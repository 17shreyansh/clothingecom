#!/bin/bash

# Backup Script for Clothing E-commerce Platform
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups"
PROJECT_DIR="/var/www/clothing-ecommerce"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🗄️ Starting backup process..."

# Backup MongoDB database
echo "📊 Backing up MongoDB database..."
mongodump --db clothing-ecommerce --out $BACKUP_DIR/mongodb_$DATE

# Backup uploaded files
echo "📁 Backing up uploaded files..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $PROJECT_DIR/server/uploads

# Backup environment files
echo "⚙️ Backing up configuration files..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz $PROJECT_DIR/server/.env $PROJECT_DIR/client/.env

# Remove backups older than 7 days
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed successfully!"
echo "📍 Backup location: $BACKUP_DIR"
ls -la $BACKUP_DIR | grep $DATE