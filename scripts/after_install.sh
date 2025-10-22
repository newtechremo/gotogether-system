#!/bin/bash
set -e

echo "Installing dependencies for GoTogether..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Backend
echo "Building backend..."
cd /home/ec2-user/gotogether-system/backend
npm install
npm run build

# Create .env file from Parameter Store
aws ssm get-parameter --name "/gotogether/production/backend-env" --with-decryption --query 'Parameter.Value' --output text > .env || echo "Using default .env"

# Admin Frontend
echo "Building admin frontend..."
cd /home/ec2-user/gotogether-system/frontend/admin
npm install
npm run build

# Copy to Nginx directory
sudo rm -rf /var/www/gotogether-admin/*
sudo cp -r .next/standalone/* /var/www/gotogether-admin/ || sudo cp -r dist/* /var/www/gotogether-admin/
sudo chown -R nginx:nginx /var/www/gotogether-admin

# Facility Frontend
echo "Building facility frontend..."
cd /home/ec2-user/gotogether-system/frontend/facility
npm install
npm run build

# Copy to Nginx directory
sudo rm -rf /var/www/gotogether-facility/*
sudo cp -r .next/standalone/* /var/www/gotogether-facility/ || sudo cp -r dist/* /var/www/gotogether-facility/
sudo chown -R nginx:nginx /var/www/gotogether-facility

echo "Build completed successfully!"
