#!/bin/bash

# =============================================================================
# ProtocolGuide - Docker Compose Stop Script
# =============================================================================
# Stops the Supabase local stack
# =============================================================================

set -e

echo "========================================"
echo "ProtocolGuide - Stopping Docker Stack"
echo "========================================"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running."
  exit 1
fi

echo "🛑 Stopping services..."
echo ""

# Stop all services
docker compose down

echo ""
echo "========================================"
echo "✅ Docker Stack Stopped Successfully!"
echo "========================================"
echo ""
echo "Data is preserved in Docker volumes."
echo "To remove volumes and data: docker compose down -v"
echo ""
