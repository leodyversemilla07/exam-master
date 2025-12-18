# ExamMaster Deployment Guide

This guide covers deploying ExamMaster to production environments.

---

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Environment Setup](#environment-setup)
-   [Production Build](#production-build)
-   [Server Configuration](#server-configuration)
-   [Database Setup](#database-setup)
-   [SSL/HTTPS](#sslhttps)
-   [Performance Optimization](#performance-optimization)
-   [Monitoring](#monitoring)
-   [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

| Requirement | Minimum | Recommended |
| ----------- | ------- | ----------- |
| PHP         | 8.2     | 8.3         |
| MySQL       | 8.0     | 8.0+        |
| Node.js     | 18      | 20 LTS      |
| RAM         | 2GB     | 4GB+        |
| Storage     | 20GB    | 50GB+       |

### Required PHP Extensions

```
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL
- Tokenizer
- XML
- cURL
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/hisangge/exam-master.git
cd exam-master
```

### 2. Install Dependencies

```bash
# PHP dependencies
composer install --optimize-autoloader --no-dev

# Node.js dependencies
npm ci
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with production values:

```env
APP_NAME=ExamMaster
APP_ENV=production
APP_KEY=  # Generate with: php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=exammaster
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

SESSION_DRIVER=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

---

## Production Build

### 1. Build Frontend Assets

```bash
npm run build
```

### 2. Optimize Laravel

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Cache events
php artisan event:cache
```

### 3. Run Migrations

```bash
php artisan migrate --force
```

### 4. Set Permissions

```bash
# Storage and cache directories
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;
    root /var/www/exam-master/public;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
```

### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/exam-master/public

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem

    <Directory /var/www/exam-master/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/exammaster_error.log
    CustomLog ${APACHE_LOG_DIR}/exammaster_access.log combined
</VirtualHost>
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE exammaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'exammaster_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON exammaster.* TO 'exammaster_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Run Migrations

```bash
php artisan migrate --force
```

### 3. Seed Initial Data (Optional)

```bash
php artisan db:seed --force
```

---

## SSL/HTTPS

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Performance Optimization

### 1. PHP-FPM Tuning

Edit `/etc/php/8.2/fpm/pool.d/www.conf`:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

### 2. OPcache Configuration

Edit `/etc/php/8.2/fpm/conf.d/10-opcache.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

### 3. MySQL Tuning

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
```

### 4. Redis Cache (Optional)

Install Redis for better caching:

```bash
sudo apt install redis-server
```

Update `.env`:

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

## Monitoring

### Laravel Telescope (Development)

For development debugging (not recommended for production):

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Log Monitoring

```bash
# View Laravel logs
tail -f storage/logs/laravel.log

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log
```

### Health Check Endpoint

Add to `routes/web.php`:

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
    ]);
});
```

---

## Maintenance Mode

### Enable Maintenance Mode

```bash
php artisan down --secret="your-secret-token"
```

Access during maintenance: `https://your-domain.com/your-secret-token`

### Disable Maintenance Mode

```bash
php artisan up
```

---

## Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u exammaster_user -p exammaster > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

### File Backup

```bash
# Backup storage directory
tar -czf /backups/storage_$(date +%Y%m%d).tar.gz /var/www/exam-master/storage
```

---

## Troubleshooting

### Common Issues

#### 500 Internal Server Error

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check permissions: `chmod -R 775 storage bootstrap/cache`
3. Clear caches: `php artisan cache:clear`

#### 404 Not Found

1. Check Nginx/Apache configuration
2. Verify `.htaccess` or `try_files` directive
3. Run `php artisan route:cache`

#### Database Connection Failed

1. Verify `.env` database credentials
2. Check MySQL is running: `systemctl status mysql`
3. Test connection: `php artisan tinker` then `DB::connection()->getPdo()`

#### Assets Not Loading

1. Run `npm run build`
2. Check `APP_URL` in `.env`
3. Clear view cache: `php artisan view:clear`

### Clear All Caches

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
composer dump-autoload
```

---

## Rollback Procedure

### Database Rollback

```bash
# Rollback last migration
php artisan migrate:rollback

# Rollback specific steps
php artisan migrate:rollback --step=3
```

### Code Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout specific version
git checkout v1.0.0
```

---

## Security Checklist

-   [ ] `APP_DEBUG=false` in production
-   [ ] Strong database password
-   [ ] SSL/HTTPS enabled
-   [ ] Firewall configured (allow only 80, 443, 22)
-   [ ] Regular security updates
-   [ ] Backup strategy in place
-   [ ] Rate limiting configured
-   [ ] CORS properly configured
-   [ ] Environment file not in version control

---

## Support

For deployment issues:

1. Check documentation
2. Review Laravel logs
3. Open an issue on GitHub
