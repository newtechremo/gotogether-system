#!/bin/bash
echo "Stopping GoTogether application..."

# Stop specific processes
pm2 delete gotogether-backend 2>/dev/null || true
pm2 delete gotogether-admin 2>/dev/null || true

echo "Applications stopped"
