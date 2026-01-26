#!/usr/bin/env node
/**
 * Generate PWA icons from the base icon
 * Run this script to create all required icon sizes for the PWA manifest
 * 
 * Usage: node scripts/generate-pwa-icons.js
 * 
 * Note: This requires the 'sharp' package for image processing.
 * Install it with: pnpm add -D sharp
 */

import sharp from 'sharp';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const PUBLIC_DIR = join(process.cwd(), 'public');
const SOURCE_ICON = join(PUBLIC_DIR, 'icon-512.png');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

async function generateIcons() {
  console.log('[Icons] Generating PWA icons...');

  if (!existsSync(SOURCE_ICON)) {
    console.error('[Icons] ❌ Source icon not found at:', SOURCE_ICON);
    console.error('[Icons] Please ensure icon-512.png exists in the public folder');
    process.exit(1);
  }

  try {
    // Generate regular icons
    for (const size of ICON_SIZES) {
      const outputPath = join(PUBLIC_DIR, `icon-${size}.png`);
      
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`[Icons] ✅ Generated icon-${size}.png`);
    }

    // Generate maskable icons (with padding for safe zone)
    for (const size of MASKABLE_SIZES) {
      const outputPath = join(PUBLIC_DIR, `icon-maskable-${size}.png`);
      
      // Maskable icons need 10% padding on each side (safe zone)
      // So the actual icon should be 80% of the total size
      const iconSize = Math.round(size * 0.8);
      const padding = Math.round((size - iconSize) / 2);
      
      // Create a white background with the icon centered
      await sharp(SOURCE_ICON)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`[Icons] ✅ Generated icon-maskable-${size}.png`);
    }

    console.log('[Icons] ✅ All PWA icons generated successfully!');
  } catch (error) {
    console.error('[Icons] ❌ Error generating icons:', error.message);
    console.error('[Icons] Make sure sharp is installed: pnpm add -D sharp');
    process.exit(1);
  }
}

generateIcons();
