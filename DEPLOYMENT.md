# VPS Deployment Guide - Clothing E-commerce Platform

## Prerequisites

- Ubuntu 20.04+ VPS with root access
- Domain name (optional but recommended)
- At least 2GB RAM and 20GB storage

## 1. Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## 2. Application Deployment

### Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> clothing-ecommerce
sudo chown -R $USER:$USER /var/www/clothing-ecommerce
cd clothing-ecommerce
```

### Backend Setup
```bash
cd server
npm install --production
```

### Frontend Build
```bash
cd ../client
npm install
npm run build
```

## 3. Environment Configuration

### Server Environment (.env)
```bash
cd /var/www/clothing-ecommerce/server
sudo nano .env
```

```env
# Database
MONGODB_URI=mongodb://localhost:27017/clothing-ecommerce

# JWT
JWT_SECRET=your-super-secure-jwt-secret-change-this
JWT_EXPIRE=7d

# Razorpay (Production keys)
RAZORPAY_KEY_ID=your_production_key_id
RAZORPAY_KEY_SECRET=your_production_key_secret

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
CLIENT_URL=https://yourdomain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Client Environment
```bash
cd ../client
sudo nano .env
```

```env
SKIP_PREFLIGHT_CHECK=true
EXTEND_ESLINT=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://yourdomain.com/api
```

## 4. PM2 Configuration

### Create PM2 Ecosystem File
```bash
cd /var/www/clothing-ecommerce
sudo nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'clothing-ecommerce',
    script: './server/index.js',
    cwd: '/var/www/clothing-ecommerce',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Create Logs Directory
```bash
mkdir logs
```

### Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx Configuration

### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/clothing-ecommerce
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/clothing-ecommerce/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/clothing-ecommerce/server/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/clothing-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 7. Firewall Configuration

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 8. Database Setup

### Create MongoDB User
```bash
mongosh
```

```javascript
use clothing-ecommerce
db.createUser({
  user: "ecommerce_user",
  pwd: "secure_password_here",
  roles: [{ role: "readWrite", db: "clothing-ecommerce" }]
})
exit
```

### Update MongoDB URI in .env
```env
MONGODB_URI=mongodb://ecommerce_user:secure_password_here@localhost:27017/clothing-ecommerce
```

## 9. Monitoring & Maintenance

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 restart all
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

### Backup Script
```bash
sudo nano /home/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db clothing-ecommerce --out /home/backups/mongodb_$DATE
tar -czf /home/backups/uploads_$DATE.tar.gz /var/www/clothing-ecommerce/server/uploads
find /home/backups -name "*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x /home/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/backup-db.sh
```

## 10. Performance Optimization

### Enable HTTP/2 in Nginx
```nginx
# Add to server block
listen 443 ssl http2;
```

### Set up Redis for Session Storage (Optional)
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

## 11. Security Checklist

- [ ] Change default MongoDB port
- [ ] Set up MongoDB authentication
- [ ] Use strong JWT secret
- [ ] Enable fail2ban
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Use production Razorpay keys
- [ ] Set up proper CORS origins

## 12. Deployment Commands

### Quick Deploy Script
```bash
sudo nano /var/www/clothing-ecommerce/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/clothing-ecommerce
git pull origin main
cd client
npm install
npm run build
cd ../server
npm install --production
pm2 restart clothing-ecommerce
sudo systemctl reload nginx
echo "Deployment completed!"
```

```bash
chmod +x deploy.sh
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **PM2 app not starting**
   ```bash
   pm2 logs clothing-ecommerce
   pm2 restart clothing-ecommerce
   ```

### Log Locations
- Nginx: `/var/log/nginx/`
- PM2: `/var/www/clothing-ecommerce/logs/`
- MongoDB: `/var/log/mongodb/`

## Post-Deployment Testing

1. Test frontend: `https://yourdomain.com`
2. Test API: `https://yourdomain.com/api/products`
3. Test file uploads: Check image loading
4. Test payment integration
5. Monitor performance with `pm2 monit`

Your clothing e-commerce platform is now ready for production!