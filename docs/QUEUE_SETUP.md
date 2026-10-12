# Queue Setup Guide

## Overview

ExamMaster uses Laravel queues to handle long-running tasks like AI question generation. This prevents timeout errors and improves user experience by processing tasks in the background.

## Queue Configuration

The application is configured to use the `database` queue driver by default (see `config/queue.php`).

### Jobs Table

The `jobs` table stores queued jobs and is created by the migration:
```
0001_01_01_000002_create_jobs_table
```

This migration has already been run in your database.

## Running the Queue Worker

### Development

For local development, you need to run the queue worker in a separate terminal:

```bash
php artisan queue:work
```

This command will:
- Process jobs as they are dispatched
- Stay running until manually stopped
- Automatically handle failed jobs with retries

### With Options

```bash
# Process jobs with specific settings
php artisan queue:work --tries=3 --timeout=300

# Process a specific queue
php artisan queue:work --queue=default,high

# Run once (for testing)
php artisan queue:work --once

# Stop gracefully after current job
php artisan queue:work --stop-when-empty
```

### Common Commands

```bash
# Check queue status
php artisan queue:monitor

# List failed jobs
php artisan queue:failed

# Retry a failed job
php artisan queue:retry [job-id]

# Retry all failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush

# Restart queue workers (after code changes)
php artisan queue:restart
```

## Production Setup

### Using Supervisor (Linux)

1. Install Supervisor:
```bash
sudo apt-get install supervisor
```

2. Create configuration file `/etc/supervisor/conf.d/exammaster-worker.conf`:
```ini
[program:exammaster-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/exammaster/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/exammaster/storage/logs/worker.log
stopwaitsecs=3600
```

3. Start Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start exammaster-worker:*
```

### Using systemd (Alternative)

Create `/etc/systemd/system/exammaster-worker.service`:
```ini
[Unit]
Description=ExamMaster Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/exammaster
ExecStart=/usr/bin/php /path/to/exammaster/artisan queue:work --tries=3 --timeout=300
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable exammaster-worker
sudo systemctl start exammaster-worker
```

## How It Works

### Question Generation Flow

1. **User Action**: User clicks "Generate Questions" button
2. **Controller**: `TosGenerateController` dispatches `GenerateQuestionsJob`
3. **Status Update**: TOS status set to "generating"
4. **Queue**: Job added to database queue
5. **Worker**: Queue worker picks up job and executes
6. **AI Service**: `QuestionGeneratorService` calls AI provider
7. **Save Results**: Questions saved to database
8. **Status Update**: TOS status set to "completed" or "failed"
9. **Frontend**: Auto-refreshes every 5 seconds to show progress

### Timeout Settings

- **Job Timeout**: 300 seconds (5 minutes)
- **PHP Timeout**: 300 seconds (set via `set_time_limit()`)
- **API Timeout**: 180 seconds (3 minutes for AI provider)
- **Job Retries**: 3 attempts before marking as failed

### Error Handling

If job fails:
1. Job is retried up to 3 times
2. After final failure, `failed()` method is called
3. TOS status set to "failed" with error message
4. User can retry from frontend

## Troubleshooting

### Queue Worker Not Processing Jobs

**Problem**: Jobs stay in `jobs` table but aren't processed

**Solution**: Make sure queue worker is running:
```bash
php artisan queue:work
```

### Timeout Errors

**Problem**: Jobs timing out even with queue

**Solution**: 
1. Check job timeout (default 300s)
2. Check PHP max execution time
3. Check API provider timeout
4. Reduce number of questions per generation

### Jobs Stuck in "Generating"

**Problem**: TOS status stuck at "generating"

**Solution**:
1. Check if worker is running
2. Check `jobs` table for pending jobs
3. Check `failed_jobs` table for failures
4. Run `php artisan queue:retry all`

### Code Changes Not Reflected

**Problem**: Code changes don't affect running jobs

**Solution**: Restart workers after code changes:
```bash
php artisan queue:restart
```

## Monitoring

### Check Queue Size

```bash
# Count pending jobs
php artisan tinker
>>> DB::table('jobs')->count();
```

### Watch Queue in Real-time

```bash
# In one terminal
php artisan queue:work --verbose

# In another terminal
watch -n 1 'php artisan queue:monitor'
```

### Log Files

Queue worker logs are in:
- `storage/logs/laravel.log` - Application logs
- `storage/logs/worker.log` - Worker logs (if configured)

## Best Practices

1. **Always run queue workers in production**
2. **Use Supervisor or systemd for automatic restarts**
3. **Monitor failed jobs regularly**
4. **Set appropriate timeout values**
5. **Use `queue:restart` after deployments**
6. **Configure proper logging**
7. **Set up alerting for failed jobs**

## Quick Start

For immediate testing:

```bash
# Terminal 1: Start the application
php artisan serve

# Terminal 2: Start queue worker
php artisan queue:work --verbose

# Terminal 3: Watch logs (optional)
tail -f storage/logs/laravel.log
```

Now when you generate questions, they'll be processed in the background without timeout errors!

## Additional Resources

- [Laravel Queue Documentation](https://laravel.com/docs/13.x/queues)
- [Supervisor Documentation](http://supervisord.org/)
- [systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
