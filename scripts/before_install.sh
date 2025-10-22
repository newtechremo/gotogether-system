#!/bin/bash
echo "=== Preparing for installation ==="

# Create necessary directories
echo "Creating directories..."
mkdir -p /home/ec2-user/logs
mkdir -p /var/www/gotogether-admin
mkdir -p /var/www/gotogether-facility

# Clean up old node_modules (optional, saves disk space)
echo "Cleaning up old node_modules..."
rm -rf /home/ec2-user/gotogether-system/backend/node_modules 2>/dev/null || true
rm -rf /home/ec2-user/gotogether-system/frontend/admin/node_modules 2>/dev/null || true
rm -rf /home/ec2-user/gotogether-system/frontend/facility/node_modules 2>/dev/null || true

echo "Preparation complete!"
