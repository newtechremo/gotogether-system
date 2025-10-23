#!/bin/bash
echo "=== Preparing for installation ==="

# Create necessary directories
echo "Creating directories..."
mkdir -p /home/ec2-user/logs
mkdir -p /var/www/gotogether-admin
mkdir -p /var/www/gotogether-facility

# Clean up temporary files that might cause deployment conflicts
echo "Cleaning up temporary files..."
# Remove temporary data files
rm -f /home/ec2-user/gotogether-system/backend/exported-data.json
rm -f /home/ec2-user/gotogether-system/backend/imported-data.json
# Remove temporary script files
rm -f /home/ec2-user/gotogether-system/backend/create-schema-remote.ts
rm -f /home/ec2-user/gotogether-system/backend/fix-*.ts
rm -f /home/ec2-user/gotogether-system/backend/test-*.ts
rm -f /home/ec2-user/gotogether-system/backend/temp-*.ts
# Remove log and backup files
rm -f /home/ec2-user/gotogether-system/backend/*.log
rm -f /home/ec2-user/gotogether-system/backend/.env.backup
rm -f /home/ec2-user/gotogether-system/backend/.env.*.backup

# DON'T delete anything - CodeDeploy will overwrite files anyway
# Removing node_modules and dist can cause issues
echo "Skipping cleanup - CodeDeploy will handle file replacement"

echo "Preparation complete!"
