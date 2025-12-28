#!/bin/bash

# =============================================================================
# ProtocolGuide - Docker Compose Reset Script
# =============================================================================
# Stops all services and removes volumes (WARNING: destroys all data!)
# =============================================================================

set -e

echo "========================================"
echo "ProtocolGuide - Reset Docker Stack"
echo "========================================"
echo ""
echo "⚠️  WARNING: This will delete ALL data in Docker volumes!"
echo ""
read -p "Are you sure? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running."
  exit 1
fi

echo ""
echo "🗑️  Stopping services and removing volumes..."
echo ""

# Stop all services and remove volumes
docker compose down -v

echo ""
echo "========================================"
echo "✅ Docker Stack Reset Complete!"
echo "========================================"
echo ""
echo "All services stopped and data removed."
echo "Run ./docker-start.sh to start fresh."
echo ""
