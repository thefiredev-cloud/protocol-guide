/**
 * Blob Utils Test Suite
 * Tests cross-platform blob handling utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Platform for testing
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('Blob Utils (Web)', () => {
  // Dynamically import to ensure mocks are applied
  let blobUtils: typeof import('../lib/blob-utils.web');

  beforeEach(async () => {
    blobUtils = await import('../lib/blob-utils.web');
  });

  describe('isFileReaderSupported', () => {
    it('should return true on web platform', () => {
      expect(blobUtils.isFileReaderSupported()).toBe(true);
    });
  });

  describe('isBlobSupported', () => {
    it('should return true on web platform', () => {
      expect(blobUtils.isBlobSupported()).toBe(true);
    });
  });

  describe('blobToBase64', () => {
    it('should convert blob to base64 string', async () => {
      const testData = 'Hello, World!';
      const blob = new Blob([testData], { type: 'text/plain' });

      const base64 = await blobUtils.blobToBase64(blob);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
      // Base64 should not contain data URL prefix
      expect(base64).not.toContain('data:');
      expect(base64).not.toContain(',');
    });

    it('should handle binary data', async () => {
      const array = new Uint8Array([1, 2, 3, 4, 5]);
      const blob = new Blob([array], { type: 'application/octet-stream' });

      const base64 = await blobUtils.blobToBase64(blob);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
    });
  });

  describe('createObjectURL', () => {
    it('should create object URL from blob', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      const url = blobUtils.createObjectURL(blob);

      expect(url).toBeTruthy();
      expect(url).toMatch(/^blob:/);
    });
  });

  describe('revokeObjectURL', () => {
    it('should revoke object URL without error', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      const url = blobUtils.createObjectURL(blob);

      expect(() => {
        blobUtils.revokeObjectURL(url);
      }).not.toThrow();
    });
  });

  describe('createFormDataWithBlob', () => {
    it('should create FormData with blob', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      const formData = blobUtils.createFormDataWithBlob(blob, 'file', 'test.txt');

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.has('file')).toBe(true);
    });
  });
});

describe('Blob Utils (Native)', () => {
  let blobUtils: typeof import('../lib/blob-utils.native');

  beforeEach(async () => {
    blobUtils = await import('../lib/blob-utils.native');
  });

  describe('isFileReaderSupported', () => {
    it('should return false on native platform', () => {
      expect(blobUtils.isFileReaderSupported()).toBe(false);
    });
  });

  describe('isBlobSupported', () => {
    it('should return false on native platform', () => {
      expect(blobUtils.isBlobSupported()).toBe(false);
    });
  });

  describe('blobToBase64', () => {
    it('should throw helpful error on native', async () => {
      const blob = new Blob(['test']);

      await expect(blobUtils.blobToBase64(blob)).rejects.toThrow(
        'blobToBase64 is not supported on React Native'
      );
    });
  });

  describe('uriToBlob', () => {
    it('should throw helpful error on native', async () => {
      await expect(blobUtils.uriToBlob('file:///test.txt')).rejects.toThrow(
        'uriToBlob is not supported on React Native'
      );
    });
  });

  describe('createObjectURL', () => {
    it('should throw helpful error on native', () => {
      const blob = new Blob(['test']);

      expect(() => blobUtils.createObjectURL(blob)).toThrow(
        'createObjectURL is not supported on React Native'
      );
    });
  });

  describe('createFormDataWithUri', () => {
    it('should create FormData with file URI', () => {
      const uri = 'file:///path/to/file.m4a';

      const formData = blobUtils.createFormDataWithUri(
        uri,
        'audio',
        'recording.m4a',
        'audio/m4a'
      );

      expect(formData).toBeInstanceOf(FormData);
    });
  });
});

describe('Cross-platform behavior', () => {
  it('should export consistent API across platforms', async () => {
    const webUtils = await import('../lib/blob-utils.web');
    const nativeUtils = await import('../lib/blob-utils.native');

    // Common functions that exist on both platforms
    expect(typeof webUtils.uriToBase64).toBe('function');
    expect(typeof nativeUtils.uriToBase64).toBe('function');

    expect(typeof webUtils.isFileReaderSupported).toBe('function');
    expect(typeof nativeUtils.isFileReaderSupported).toBe('function');

    expect(typeof webUtils.isBlobSupported).toBe('function');
    expect(typeof nativeUtils.isBlobSupported).toBe('function');
  });
});
