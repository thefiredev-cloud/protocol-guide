/**
 * Blob utilities for React Native
 * Handles binary data operations using expo-file-system
 */

import * as FileSystem from "expo-file-system/legacy";

/**
 * Convert Blob to base64 string (React Native)
 * Note: React Native doesn't have native Blob support, use FileSystem instead
 */
export async function blobToBase64(_blob: Blob): Promise<string> {
  throw new Error(
    "blobToBase64 is not supported on React Native. Use uriToBase64 with file URI instead."
  );
}

/**
 * Fetch URI and convert to Blob (React Native)
 * Note: Returns a mock Blob-like object since RN doesn't have native Blob
 */
export async function uriToBlob(_uri: string): Promise<Blob> {
  throw new Error(
    "uriToBlob is not supported on React Native. Use FileSystem directly."
  );
}

/**
 * Convert file URI to base64 (React Native)
 */
export async function uriToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    throw new Error(
      `Failed to convert URI to base64: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create FormData with file from URI (React Native)
 */
export function createFormDataWithBlob(
  _blob: Blob,
  fieldName: string,
  filename: string
): FormData {
  // React Native's FormData doesn't work the same as web
  // This should be handled differently on native
  const formData = new FormData();
  // Note: On React Native, you typically append files using:
  // formData.append(fieldName, { uri, type: 'audio/m4a', name: filename } as any);
  console.warn(
    "createFormDataWithBlob on React Native requires a file URI, not a Blob"
  );
  return formData;
}

/**
 * Create FormData with file from URI (React Native specific)
 */
export function createFormDataWithUri(
  uri: string,
  fieldName: string,
  filename: string,
  mimeType: string
): FormData {
  const formData = new FormData();
  formData.append(fieldName, {
    uri,
    type: mimeType,
    name: filename,
  } as any);
  return formData;
}

/**
 * Create object URL from Blob (React Native)
 * Not supported - returns the URI as-is
 */
export function createObjectURL(_blob: Blob): string {
  throw new Error("createObjectURL is not supported on React Native");
}

/**
 * Revoke object URL (React Native)
 * No-op since object URLs aren't used
 */
export function revokeObjectURL(_url: string): void {
  // No-op
}

/**
 * Check if FileReader is available
 */
export function isFileReaderSupported(): boolean {
  return false;
}

/**
 * Check if Blob is supported
 */
export function isBlobSupported(): boolean {
  return false;
}

/**
 * Delete file from file system (React Native specific)
 */
export async function deleteFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.warn(`Failed to delete file: ${uri}`, error);
  }
}
