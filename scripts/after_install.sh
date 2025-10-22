#!/bin/bash
# Exit on error but with better error handling
set -e

echo "=== Starting after_install.sh ==="
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"

# Function for error logging
log_error() {
    echo "ERROR: $1" >&2
}

# Load NVM if available
echo "Loading NVM..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    echo "NVM loaded successfully"
else
    log_error "NVM not found at $NVM_DIR/nvm.sh"
    # Try to use system Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Backend
echo "=== Building backend ==="
cd /home/ec2-user/gotogether-system/backend || exit 1
echo "Installing backend dependencies..."
npm install --production=false || { log_error "Backend npm install failed"; exit 1; }

echo "Building backend..."
npm run build || { log_error "Backend build failed"; exit 1; }

# Create .env file from Parameter Store or use existing
echo "Setting up backend .env..."
if aws ssm get-parameter --name "/gotogether/production/backend-env" --with-decryption --query 'Parameter.Value' --output text > .env 2>/dev/null; then
    echo "Loaded .env from AWS SSM Parameter Store"
else
    echo "Warning: Could not load from SSM, using existing .env file"
    if [ ! -f .env ]; then
        log_error "No .env file found and SSM parameter not available"
        exit 1
    fi
fi

# Admin Frontend
echo "=== Building admin frontend ==="
cd /home/ec2-user/gotogether-system/frontend/admin || exit 1
echo "Installing admin dependencies..."
npm install --production=false || { log_error "Admin npm install failed"; exit 1; }

echo "Building admin frontend..."
npm run build || { log_error "Admin build failed"; exit 1; }

# Create Nginx directory if not exists
echo "Setting up Nginx directories..."
sudo mkdir -p /var/www/gotogether-admin
sudo chown -R ec2-user:ec2-user /var/www/gotogether-admin

# Copy build output
echo "Copying admin build files..."
if [ -d ".next" ]; then
    echo "Found .next directory, copying..."
    sudo rm -rf /var/www/gotogether-admin/*
    sudo cp -r .next /var/www/gotogether-admin/
    sudo cp -r public /var/www/gotogether-admin/ 2>/dev/null || echo "No public directory"
    sudo cp package.json /var/www/gotogether-admin/
    sudo cp next.config.* /var/www/gotogether-admin/ 2>/dev/null || echo "No next.config file"
    sudo chown -R nginx:nginx /var/www/gotogether-admin
    echo "Admin build files copied successfully"
else
    log_error "No .next directory found for admin"
    ls -la
    exit 1
fi

# Facility Frontend
echo "=== Building facility frontend ==="
cd /home/ec2-user/gotogether-system/frontend/facility || exit 1
echo "Installing facility dependencies..."
npm install --production=false || { log_error "Facility npm install failed"; exit 1; }

echo "Building facility frontend..."
npm run build || { log_error "Facility build failed"; exit 1; }

# Create Nginx directory if not exists
sudo mkdir -p /var/www/gotogether-facility
sudo chown -R ec2-user:ec2-user /var/www/gotogether-facility

# Copy build output
echo "Copying facility build files..."
if [ -d ".next" ]; then
    echo "Found .next directory, copying..."
    sudo rm -rf /var/www/gotogether-facility/*
    sudo cp -r .next /var/www/gotogether-facility/
    sudo cp -r public /var/www/gotogether-facility/ 2>/dev/null || echo "No public directory"
    sudo cp package.json /var/www/gotogether-facility/
    sudo cp next.config.* /var/www/gotogether-facility/ 2>/dev/null || echo "No next.config file"
    sudo chown -R nginx:nginx /var/www/gotogether-facility
    echo "Facility build files copied successfully"
else
    log_error "No .next directory found for facility"
    ls -la
    exit 1
fi

echo "=== Build completed successfully! ==="
