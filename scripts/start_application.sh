#!/bin/bash
echo "Starting GoTogether application..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /home/ec2-user/gotogether-system/backend
pm2 delete gotogether-backend || true
pm2 start dist/main.js --name gotogether-backend --max-memory-restart 800M
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | grep 'sudo' | bash || true

sudo systemctl reload nginx

echo "Application started successfully!"
