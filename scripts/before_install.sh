#!/bin/bash
echo "=== Preparing for installation ==="

# Create necessary directories
echo "Creating directories..."
mkdir -p /home/ec2-user/logs
mkdir -p /var/www/gotogether-admin
mkdir -p /var/www/gotogether-facility

# DON'T delete anything - CodeDeploy will overwrite files anyway
# Removing node_modules and dist can cause issues
echo "Skipping cleanup - CodeDeploy will handle file replacement"

echo "Preparation complete!"
