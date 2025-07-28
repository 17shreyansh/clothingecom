#!/bin/bash

# Clothing E-commerce Deployment Script
echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/clothing-ecommerce

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install --production

# Build frontend
echo "🏗️ Building frontend..."
cd ../client
npm install
npm run build

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart clothing-ecommerce

# Reload Nginx
echo "🔧 Reloading Nginx..."
sudo systemctl reload nginx

# Check application status
echo "✅ Checking application status..."
pm2 status

echo "🎉 Deployment completed successfully!"
echo "🌐 Visit your website to verify the deployment"