#!/bin/bash
set -e

echo "=== Starting GoTogether application ==="

# Function for error logging
log_error() {
    echo "ERROR: $1" >&2
}

# Load NVM
echo "Loading NVM..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    echo "NVM loaded successfully"
else
    log_error "NVM not found, trying system Node.js"
fi

# Verify Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not available"
    exit 1
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing globally..."
    npm install -g pm2
fi

echo "PM2 version: $(pm2 --version)"

# Start Backend Application
echo "Starting backend application..."
cd /home/ec2-user/gotogether-system/backend

# Check if dist/main.js exists
if [ ! -f "dist/main.js" ]; then
    log_error "dist/main.js not found! Build may have failed."
    exit 1
fi

# Stop existing PM2 process if running
pm2 delete gotogether-backend 2>/dev/null || echo "No existing process to delete"

# Start the application with PM2
pm2 start dist/main.js \
    --name gotogether-backend \
    --max-memory-restart 800M \
    --log /home/ec2-user/logs/gotogether-backend.log \
    --error /home/ec2-user/logs/gotogether-backend-error.log \
    --time

# Save PM2 process list
pm2 save

# Setup PM2 startup script (only first time)
pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null | grep 'sudo' | bash || echo "PM2 startup already configured"

# Show PM2 status
pm2 list

# Reload Nginx if installed
if command -v nginx &> /dev/null; then
    echo "Reloading Nginx..."
    sudo systemctl reload nginx || echo "Nginx reload failed, but continuing..."
else
    echo "Nginx not installed, skipping reload"
fi

echo "=== Backend application started successfully! ==="

# Wait a moment for the app to initialize
sleep 5

# Check if the process is running
if pm2 describe gotogether-backend | grep -q "online"; then
    echo "✓ Backend is running"
else
    log_error "Backend failed to start"
    pm2 logs gotogether-backend --lines 50 --nostream
    exit 1
fi
