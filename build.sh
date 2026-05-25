#!/bin/bash
# Next.js Build and Deployment Script
# Safely compiles, copies static assets to the standalone directory, and restarts the systemd service.

set -e

# Change directory to the frontend project root
cd /var/www/os/nsf

echo "[nsf-build] Starting Next.js frontend build process..."

# 1. Clean previous build folders to prevent stale assets
echo "[nsf-build] Cleaning previous builds..."
rm -rf .next

# 2. Run the Next.js build
echo "[nsf-build] Compiling frontend application..."
npm run build

# 3. Ensure the standalone directory was created successfully
if [ ! -d ".next/standalone" ]; then
    echo "[ERROR] Standalone build directory not found. Please verify next.config.ts settings." >&2
    exit 1
fi

# 4. Copy static assets to the standalone bundle
echo "[nsf-build] Copying static assets to standalone bundle..."
mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/

# 5. Copy public assets if they exist
if [ -d "public" ]; then
    echo "[nsf-build] Copying public folder to standalone bundle..."
    mkdir -p .next/standalone/public
    cp -r public/* .next/standalone/public/
fi

# 6. Restart the nexus-frontend supervisor service to pick up the new build
echo "[nsf-build] Restarting nexus-frontend supervisor service..."
supervisorctl restart nexus-frontend:*

echo "[nsf-build] Deployment completed successfully!"
