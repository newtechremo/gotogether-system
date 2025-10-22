#!/bin/bash
echo "=== Validating GoTogether service ==="

# Function to check if service is responding
check_service() {
    local url=$1
    local max_attempts=30
    local attempt=1

    echo "Checking service at $url..."

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts..."

        if curl -f -s -o /dev/null -w "%{http_code}" $url | grep -q "200\|404\|302"; then
            echo "✓ Service is responding!"
            return 0
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    echo "✗ Service failed to respond after $max_attempts attempts"
    return 1
}

# Check PM2 status
echo "Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 list

    # Check if gotogether-backend is online
    if pm2 describe gotogether-backend 2>/dev/null | grep -q "online"; then
        echo "✓ Backend process is online"
    else
        echo "✗ Backend process is not online"
        pm2 logs gotogether-backend --lines 50 --nostream || true
        exit 1
    fi
else
    echo "Warning: PM2 not found"
fi

# Wait a bit for the application to fully initialize
echo "Waiting for application to initialize..."
sleep 10

# Check Backend API
if ! check_service "http://localhost:3002"; then
    echo "Backend health check failed!"
    echo "Checking logs..."
    pm2 logs gotogether-backend --lines 100 --nostream || true

    # Check if port is listening
    echo "Checking if port 3002 is listening..."
    netstat -tlnp 2>/dev/null | grep 3002 || ss -tlnp 2>/dev/null | grep 3002 || echo "Port 3002 not listening"

    exit 1
fi

echo "=== All services validated successfully! ==="
