#!/bin/bash
#
# Asset Optimization Script
# Optimizes images and assets to reduce bundle size
#
# Usage: bash scripts/optimize-assets.sh
#

set -e

echo "========================================="
echo "Protocol Guide - Asset Optimization"
echo "========================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed"
    exit 1
fi

# Install optimization tools if not present
echo "📦 Installing optimization tools..."
pnpm install --save-dev sharp @squoosh/cli

# Create backup directory
BACKUP_DIR="assets/images/backup-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"
echo "💾 Backing up original assets to $BACKUP_DIR/"

# Backup original icon
cp assets/images/icon.png "$BACKUP_DIR/"
echo "  ✓ Backed up icon.png"

# Optimize icon.png (1024x1024)
echo ""
echo "🖼️  Optimizing icon.png..."
echo "  Original size: $(du -h assets/images/icon.png | cut -f1)"

npx @squoosh/cli \
  --webp auto \
  --oxipng auto \
  --resize '{"enabled":true,"width":1024,"height":1024}' \
  --output-dir assets/images \
  assets/images/icon.png

# Alternative: Use sharp if squoosh fails
# node -e "const sharp = require('sharp'); sharp('assets/images/icon.png').resize(1024, 1024).png({ compressionLevel: 9, quality: 85 }).toFile('assets/images/icon-optimized.png');"

echo "  New size: $(du -h assets/images/icon.png | cut -f1)"
echo "  ✓ Icon optimized"

# Check for other large images
echo ""
echo "📊 Checking for other large assets..."
find assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +100k -exec du -h {} \; | sort -rh

echo ""
echo "========================================="
echo "✅ Asset optimization complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run: pnpm build:web"
echo "2. Check bundle size: ls -lh dist/_expo/static/js/web/*.js"
echo "3. Verify app functionality"
echo ""
echo "Backup location: $BACKUP_DIR/"
