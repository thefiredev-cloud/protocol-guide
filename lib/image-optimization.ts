/**
 * Image Optimization Utilities
 *
 * Provides optimized image loading for EMS field use:
 * - Lazy loading with intersection observer
 * - Progressive loading (blur-up)
 * - Responsive sizing
 * - WebP/AVIF format selection
 * - Caching strategies
 */

import { Platform, PixelRatio } from "react-native";

// Default image dimensions for EMS use cases
export const IMAGE_SIZES = {
  thumbnail: { width: 80, height: 80 },
  small: { width: 160, height: 160 },
  medium: { width: 320, height: 320 },
  large: { width: 640, height: 640 },
  full: { width: 1024, height: 1024 },
} as const;

// Supported image formats (in order of preference)
const IMAGE_FORMATS = ["avif", "webp", "jpg"] as const;

/**
 * Check if browser supports a specific image format
 */
export function supportsFormat(format: string): boolean {
  if (Platform.OS !== "web") return false;

  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");
  if (!canvas.getContext) return false;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  if (format === "avif") {
    return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
  }

  if (format === "webp") {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  return true; // Assume JPEG is always supported
}

/**
 * Get the best supported image format
 */
export function getBestFormat(): (typeof IMAGE_FORMATS)[number] {
  for (const format of IMAGE_FORMATS) {
    if (supportsFormat(format)) {
      return format;
    }
  }
  return "jpg";
}

/**
 * Calculate optimal image size based on container and device pixel ratio
 */
export function getOptimalSize(
  containerWidth: number,
  containerHeight?: number
): { width: number; height: number } {
  const pixelRatio = PixelRatio.get();
  const optimalWidth = Math.ceil(containerWidth * pixelRatio);
  const optimalHeight = containerHeight
    ? Math.ceil(containerHeight * pixelRatio)
    : optimalWidth;

  // Round up to nearest standard size for better caching
  const sizes = Object.values(IMAGE_SIZES);
  for (const size of sizes) {
    if (size.width >= optimalWidth && size.height >= optimalHeight) {
      return size;
    }
  }

  return IMAGE_SIZES.full;
}

/**
 * Generate optimized image URL with size and format parameters
 *
 * Supports Supabase Storage transformation API:
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 80, format = getBestFormat() } = options;

  // Handle Supabase storage URLs
  if (originalUrl.includes("supabase.co/storage")) {
    const url = new URL(originalUrl);
    const transformParams = new URLSearchParams();

    if (width) transformParams.set("width", String(width));
    if (height) transformParams.set("height", String(height));
    transformParams.set("quality", String(quality));
    transformParams.set("format", format);

    // Add transform to render path
    const pathParts = url.pathname.split("/");
    const objectIndex = pathParts.indexOf("object");
    if (objectIndex !== -1) {
      pathParts.splice(objectIndex + 1, 0, "render", "image");
    }
    url.pathname = pathParts.join("/");
    url.search = transformParams.toString();

    return url.toString();
  }

  // For other URLs, return as-is (could add CDN transformation here)
  return originalUrl;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  originalUrl: string,
  options: {
    widths?: number[];
    quality?: number;
  } = {}
): string {
  const { widths = [160, 320, 640, 1024], quality = 80 } = options;

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(originalUrl, { width, quality });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
}

/**
 * Preload critical images for faster display
 */
export function preloadImage(url: string): Promise<void> {
  if (Platform.OS !== "web") {
    // On native, use Image.prefetch
    const { Image } = require("react-native");
    return Image.prefetch(url);
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Generate blur hash placeholder data URL
 * Returns a tiny base64 image for blur-up loading
 */
export function getPlaceholderDataUrl(color: string = "#f3f4f6"): string {
  // 1x1 pixel placeholder in the specified color
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Create a tiny BMP image (faster than PNG encoding)
  const bmp = [
    0x42,
    0x4d, // BM
    0x3a,
    0x00,
    0x00,
    0x00, // File size (58 bytes)
    0x00,
    0x00,
    0x00,
    0x00, // Reserved
    0x36,
    0x00,
    0x00,
    0x00, // Pixel offset (54)
    0x28,
    0x00,
    0x00,
    0x00, // DIB header size (40)
    0x01,
    0x00,
    0x00,
    0x00, // Width (1)
    0x01,
    0x00,
    0x00,
    0x00, // Height (1)
    0x01,
    0x00, // Color planes (1)
    0x18,
    0x00, // Bits per pixel (24)
    0x00,
    0x00,
    0x00,
    0x00, // Compression (none)
    0x04,
    0x00,
    0x00,
    0x00, // Image size (4)
    0x00,
    0x00,
    0x00,
    0x00, // X pixels per meter
    0x00,
    0x00,
    0x00,
    0x00, // Y pixels per meter
    0x00,
    0x00,
    0x00,
    0x00, // Colors in table
    0x00,
    0x00,
    0x00,
    0x00, // Important colors
    b,
    g,
    r,
    0x00, // Pixel data (BGR + padding)
  ];

  const base64 = btoa(String.fromCharCode(...bmp));
  return `data:image/bmp;base64,${base64}`;
}

/**
 * Image loading state manager
 */
export type ImageLoadState = "idle" | "loading" | "loaded" | "error";

/**
 * Intersection Observer options for lazy loading
 */
export const LAZY_LOAD_OPTIONS: IntersectionObserverInit = {
  rootMargin: "200px", // Start loading 200px before visible
  threshold: 0.01, // Trigger when 1% visible
};

/**
 * Create a lazy loading observer for images
 */
export function createLazyLoadObserver(
  onIntersect: (entry: IntersectionObserverEntry) => void
): IntersectionObserver | null {
  if (Platform.OS !== "web" || typeof IntersectionObserver === "undefined") {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onIntersect(entry);
      }
    });
  }, LAZY_LOAD_OPTIONS);
}
