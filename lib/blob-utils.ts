/**
 * Blob utilities - Platform-agnostic exports
 *
 * This file provides TypeScript resolution for @/lib/blob-utils imports.
 * Metro bundler will resolve to:
 * - blob-utils.web.ts on web/PWA
 * - blob-utils.native.ts on iOS/Android
 *
 * This base file re-exports from the web version for TypeScript type checking.
 */

export {
  blobToBase64,
  uriToBlob,
  uriToBase64,
  createFormDataWithBlob,
  createObjectURL,
  revokeObjectURL,
  isFileReaderSupported,
  isBlobSupported,
} from "./blob-utils.web";
