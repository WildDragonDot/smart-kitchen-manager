#!/bin/sh

# Start script for Smart Kitchen Manager on Render
# This script handles both API and Web applications

set -e

echo "🚀 Starting Smart Kitchen Manager..."

# Run database migrations if needed
echo "📊 Running database migrations..."
cd packages/db && pnpm prisma migrate deploy && cd ../..

# Determine which service to start based on environment variable
if [ "$SERVICE_TYPE" = "api" ]; then
    echo "🔧 Starting API server..."
    cd apps/api
    exec node dist/index.js
elif [ "$SERVICE_TYPE" = "web" ]; then
    echo "🌐 Starting Web application..."
    cd apps/web
    exec pnpm start
else
    # Default: start both services (for single container deployment)
    echo "🔄 Starting both API and Web services..."
    
    # Start API in background
    cd apps/api
    node dist/index.js &
    API_PID=$!
    
    # Start Web application
    cd ../web
    pnpm start &
    WEB_PID=$!
    
    # Wait for either process to exit
    wait $API_PID $WEB_PID
fi