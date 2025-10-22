#!/bin/bash
echo "Stopping GoTogether application..."
pm2 stop all || true
