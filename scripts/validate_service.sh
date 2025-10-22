#!/bin/bash
echo "Validating GoTogether service..."
sleep 10
curl -f http://localhost:3002/api || exit 1
echo "Application is healthy"
