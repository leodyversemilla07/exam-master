# Timeout Error Fix - Quick Reference

## Problem
`Maximum execution time of 30 seconds exceeded` error when generating questions with AI.

## Root Cause
AI question generation takes 2-5 minutes, but PHP's default timeout is 30 seconds. Running generation synchronously in the web request causes timeouts.

## Solution
Moved question generation to background queue processing using Laravel Jobs.

## Files Changed

### 1. New Job: `app/Jobs/GenerateQuestionsJob.php`
- Handles async question generation
- Timeout: 300 seconds (5 minutes)
- Retries: 3 attempts
- Saves questions to database
- Updates TOS status (generating → completed/failed)

### 2. Updated Controller: `app/Http/Controllers/TosGenerateController.php`
- Dispatches job instead of generating synchronously
- Returns immediately with success message
- Job processes in background

### 3. Updated Service: `app/Services/AI/QuestionGeneratorService.php`
- Added `set_time_limit(300)` for PHP timeout
- Added 180-second timeout for API calls
- Enhanced error logging with stack traces

### 4. Updated Frontend: `resources/js/pages/tos-generates/show.tsx`
- Auto-refreshes every 5 seconds while status is "generating"
- Shows progress alert with spinning loader
- Shows error alert with retry button if failed
- Cleans up interval on unmount

## How to Use

### Step 1: Start Queue Worker (REQUIRED)

```bash
# In a separate terminal, run:
php artisan queue:work
```

This must be running for question generation to work!

### Step 2: Generate Questions

1. Navigate to TOS page
2. Click "Generate Questions"
3. Page shows "Generating..." status
4. Page auto-refreshes every 5 seconds
5. When complete, status changes to "Completed"

### Alternative: Use Composer Script

```bash
# Starts Laravel server, Vite, AND queue worker
composer run dev
```

## Production Setup

For production, use Supervisor or systemd to keep queue worker running:

```bash
# Install Supervisor
sudo apt-get install supervisor

# Configure (see docs/QUEUE_SETUP.md for full config)
sudo nano /etc/supervisor/conf.d/exammaster-worker.conf

# Start
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start exammaster-worker:*
```

## Troubleshooting

### Queue worker not running?
```bash
# Check if running
ps aux | grep "queue:work"

# Start if not running
php artisan queue:work
```

### Jobs stuck?
```bash
# Check pending jobs
php artisan tinker
>>> DB::table('jobs')->count();

# Check failed jobs
php artisan queue:failed

# Retry all failed jobs
php artisan queue:retry all
```

### Code changes not reflected?
```bash
# Restart queue workers after code changes
php artisan queue:restart
```

## Key Features

✅ **No More Timeouts**: Jobs have 5-minute timeout  
✅ **Automatic Retries**: 3 attempts before failing  
✅ **Real-time Status**: Frontend auto-refreshes  
✅ **Error Handling**: Clear error messages with retry option  
✅ **Background Processing**: Web requests return immediately  
✅ **Progress Tracking**: Visual status indicators  

## Testing

```bash
# 1. Start queue worker
php artisan queue:work --verbose

# 2. In another terminal, start app
php artisan serve

# 3. Generate questions from UI
# Watch queue worker terminal for progress

# Expected output:
# [2025-12-19 12:00:00] Processing: App\Jobs\GenerateQuestionsJob
# [2025-12-19 12:02:30] Processed: App\Jobs\GenerateQuestionsJob
```

## Monitoring

```bash
# Watch queue in real-time
watch -n 1 'php artisan queue:monitor'

# View logs
tail -f storage/logs/laravel.log

# Check job table
php artisan tinker
>>> DB::table('jobs')->select('id', 'queue', 'attempts', 'created_at')->get();
```

## Documentation

Full details in:
- [Queue Setup Guide](QUEUE_SETUP.md)
- [Architecture Documentation](ARCHITECTURE.md)

## Summary

The fix converts synchronous AI generation (30s timeout) to asynchronous queue processing (5min timeout):

**Before:**
```
User clicks button → Controller generates → Timeout at 30s ❌
```

**After:**
```
User clicks button → Job dispatched → Worker processes → Success ✅
                                    ↓
                          Frontend auto-refreshes
```

This eliminates timeout errors and provides better UX!
