#!/bin/bash

# =============================================================================
# ProtocolGuide - Docker Compose Start Script
# =============================================================================
# Starts the Supabase local stack with all services
# =============================================================================

set -e

echo "========================================"
echo "ProtocolGuide - Starting Docker Stack"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying from .env.docker..."
  cp .env.docker .env
  echo "✅ Created .env file from .env.docker"
  echo ""
  echo "⚠️  IMPORTANT: Please edit .env and set secure passwords and secrets!"
  echo ""
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "🚀 Starting services..."
echo ""

# Start all services
docker compose up -d

echo ""
echo "========================================"
echo "✅ Docker Stack Started Successfully!"
echo "========================================"
echo ""
echo "Services are available at:"
echo ""
echo "📊 Supabase Studio:    http://localhost:3001"
echo "🔌 PostgreSQL:         localhost:5432"
echo "🔐 Auth (GoTrue):      http://localhost:9999"
echo "📡 Realtime:           http://localhost:4000"
echo "💾 Storage:            http://localhost:5000"
echo "🌐 REST API:           http://localhost:3000"
echo "🚪 API Gateway (Kong): http://localhost:8000"
echo "⚡ Edge Functions:     http://localhost:9000"
echo ""
echo "Database credentials:"
echo "  Host:     localhost"
echo "  Port:     5432"
echo "  Database: postgres"
echo "  User:     postgres"
echo "  Password: (see POSTGRES_PASSWORD in .env)"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
echo "To restart:   docker compose restart"
echo ""
