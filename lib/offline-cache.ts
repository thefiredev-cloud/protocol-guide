import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const CACHE_KEY = "protocol_cache";

/**
 * Calculate byte length of a string in a platform-safe way
 * Blob is not available in React Native
 */
function getByteLength(str: string): number {
  if (Platform.OS === "web" && typeof Blob !== "undefined") {
    return new Blob([str]).size;
  }
  // For native platforms, calculate UTF-8 byte length manually
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      byteLength += 1;
    } else if (code < 0x800) {
      byteLength += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // Surrogate pair (4 bytes for the pair)
      byteLength += 4;
      i++; // Skip the low surrogate
    } else {
      byteLength += 3;
    }
  }
  return byteLength;
}
const CACHE_METADATA_KEY = "protocol_cache_metadata";
const MAX_CACHED_ITEMS = 50; // Maximum number of cached protocol responses

export type CachedProtocol = {
  id: string;
  query: string;
  response: string;
  protocolRefs?: string[];
  countyId: number;
  countyName: string;
  timestamp: number;
};

type CacheMetadata = {
  lastUpdated: number;
  itemCount: number;
  totalSize: number;
};

/**
 * Offline Cache Service for EMS Protocols
 * Stores recently viewed protocols for offline access in the field
 */
export const OfflineCache = {
  /**
   * Save a protocol response to the cache
   */
  async saveProtocol(protocol: Omit<CachedProtocol, "id" | "timestamp">): Promise<void> {
    try {
      const cache = await this.getAllProtocols();
      
      // Generate unique ID based on query and county
      const id = `${protocol.countyId}_${protocol.query.toLowerCase().replace(/\s+/g, "_").slice(0, 50)}`;
      
      // Check if this query already exists and update it
      const existingIndex = cache.findIndex(p => p.id === id);
      
      const newEntry: CachedProtocol = {
        ...protocol,
        id,
        timestamp: Date.now(),
      };

      if (existingIndex >= 0) {
        // Update existing entry
        cache[existingIndex] = newEntry;
      } else {
        // Add new entry at the beginning
        cache.unshift(newEntry);
        
        // Trim cache if it exceeds max items
        if (cache.length > MAX_CACHED_ITEMS) {
          cache.pop();
        }
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      await this.updateMetadata(cache);
    } catch (error) {
      console.error("Error saving protocol to cache:", error);
    }
  },

  /**
   * Get all cached protocols
   */
  async getAllProtocols(): Promise<CachedProtocol[]> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading protocol cache:", error);
      return [];
    }
  },

  /**
   * Get cached protocols for a specific county
   */
  async getProtocolsByCounty(countyId: number): Promise<CachedProtocol[]> {
    const cache = await this.getAllProtocols();
    return cache.filter(p => p.countyId === countyId);
  },

  /**
   * Search cached protocols by query text
   */
  async searchCachedProtocols(searchText: string, countyId?: number): Promise<CachedProtocol[]> {
    const cache = await this.getAllProtocols();
    const searchLower = searchText.toLowerCase();
    
    return cache.filter(p => {
      const matchesSearch = 
        p.query.toLowerCase().includes(searchLower) ||
        p.response.toLowerCase().includes(searchLower);
      const matchesCounty = countyId ? p.countyId === countyId : true;
      return matchesSearch && matchesCounty;
    });
  },

  /**
   * Get a specific cached protocol by ID
   */
  async getProtocolById(id: string): Promise<CachedProtocol | null> {
    const cache = await this.getAllProtocols();
    return cache.find(p => p.id === id) || null;
  },

  /**
   * Get recent protocols (last N items)
   */
  async getRecentProtocols(limit: number = 10): Promise<CachedProtocol[]> {
    const cache = await this.getAllProtocols();
    return cache.slice(0, limit);
  },

  /**
   * Clear all cached protocols
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
    } catch (error) {
      console.error("Error clearing protocol cache:", error);
    }
  },

  /**
   * Remove a specific protocol from cache
   */
  async removeProtocol(id: string): Promise<void> {
    try {
      const cache = await this.getAllProtocols();
      const filtered = cache.filter(p => p.id !== id);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
      await this.updateMetadata(filtered);
    } catch (error) {
      console.error("Error removing protocol from cache:", error);
    }
  },

  /**
   * Get cache metadata (size, count, last updated)
   */
  async getMetadata(): Promise<CacheMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error reading cache metadata:", error);
      return null;
    }
  },

  /**
   * Update cache metadata
   */
  async updateMetadata(cache: CachedProtocol[]): Promise<void> {
    try {
      const cacheString = JSON.stringify(cache);
      const metadata: CacheMetadata = {
        lastUpdated: Date.now(),
        itemCount: cache.length,
        totalSize: new Blob([cacheString]).size,
      };
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error("Error updating cache metadata:", error);
    }
  },

  /**
   * Check if cache has any data
   */
  async hasCache(): Promise<boolean> {
    const cache = await this.getAllProtocols();
    return cache.length > 0;
  },
};

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format timestamp for display
 */
export function formatCacheTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
