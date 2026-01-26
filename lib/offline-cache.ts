import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { cacheProtocolInSW, queueOfflineSearch } from "./register-sw";

const CACHE_KEY = "protocol_cache";
const CACHE_METADATA_KEY = "protocol_cache_metadata";
const PENDING_SEARCHES_KEY = "protocol_pending_searches";
const MAX_CACHED_ITEMS = 50; // Maximum number of cached protocol responses
const MAX_PENDING_SEARCHES = 20; // Maximum pending offline searches

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

export type CachedProtocol = {
  id: string;
  query: string;
  response: string;
  protocolRefs?: string[];
  countyId: number;
  countyName: string;
  timestamp: number;
  // Additional fields for better offline experience
  protocolTitle?: string;
  protocolNumber?: string;
  isFavorite?: boolean;
};

export type PendingSearch = {
  id: string;
  query: string;
  stateFilter?: string;
  agencyId?: number;
  timestamp: number;
  retryCount: number;
};

type CacheMetadata = {
  lastUpdated: number;
  itemCount: number;
  totalSize: number;
  pendingSearchCount: number;
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
        
        // Trim cache if it exceeds max items (keep favorites)
        const favorites = cache.filter(p => p.isFavorite);
        const nonFavorites = cache.filter(p => !p.isFavorite);
        
        if (cache.length > MAX_CACHED_ITEMS) {
          // Keep all favorites + most recent non-favorites
          const maxNonFavorites = MAX_CACHED_ITEMS - favorites.length;
          const trimmedNonFavorites = nonFavorites.slice(0, maxNonFavorites);
          cache.length = 0;
          cache.push(...favorites, ...trimmedNonFavorites);
        }
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      await this.updateMetadata(cache);
      
      // Also cache in Service Worker for web PWA
      if (Platform.OS === "web") {
        cacheProtocolInSW({
          id,
          query: protocol.query,
          content: protocol.response,
          title: protocol.protocolTitle,
          agencyId: protocol.countyId,
          agencyName: protocol.countyName,
        });
      }
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
        p.response.toLowerCase().includes(searchLower) ||
        (p.protocolTitle?.toLowerCase().includes(searchLower) ?? false);
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
   * Get favorite protocols
   */
  async getFavoriteProtocols(): Promise<CachedProtocol[]> {
    const cache = await this.getAllProtocols();
    return cache.filter(p => p.isFavorite);
  },

  /**
   * Toggle favorite status for a protocol
   */
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const cache = await this.getAllProtocols();
      const protocol = cache.find(p => p.id === id);
      
      if (protocol) {
        protocol.isFavorite = !protocol.isFavorite;
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return protocol.isFavorite;
      }
      return false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  },

  /**
   * Clear all cached protocols
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
      await AsyncStorage.removeItem(PENDING_SEARCHES_KEY);
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
      const pendingSearches = await this.getPendingSearches();
      
      const metadata: CacheMetadata = {
        lastUpdated: Date.now(),
        itemCount: cache.length,
        totalSize: getByteLength(cacheString),
        pendingSearchCount: pendingSearches.length,
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

  // ============================================
  // Pending Offline Searches
  // ============================================

  /**
   * Queue a search to be executed when back online
   */
  async queueSearch(search: Omit<PendingSearch, "id" | "timestamp" | "retryCount">): Promise<void> {
    try {
      const pendingSearches = await this.getPendingSearches();
      
      // Check if this search already exists
      const existingIndex = pendingSearches.findIndex(
        s => s.query === search.query && s.agencyId === search.agencyId
      );
      
      if (existingIndex >= 0) {
        // Update timestamp
        pendingSearches[existingIndex].timestamp = Date.now();
      } else {
        // Add new search
        const newSearch: PendingSearch = {
          ...search,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
          timestamp: Date.now(),
          retryCount: 0,
        };
        
        pendingSearches.unshift(newSearch);
        
        // Trim if too many pending searches
        if (pendingSearches.length > MAX_PENDING_SEARCHES) {
          pendingSearches.pop();
        }
      }
      
      await AsyncStorage.setItem(PENDING_SEARCHES_KEY, JSON.stringify(pendingSearches));
      
      // Also queue in Service Worker for background sync
      if (Platform.OS === "web") {
        queueOfflineSearch({
          query: search.query,
          stateFilter: search.stateFilter,
          agencyId: search.agencyId,
        });
      }
    } catch (error) {
      console.error("Error queueing search:", error);
    }
  },

  /**
   * Get all pending searches
   */
  async getPendingSearches(): Promise<PendingSearch[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading pending searches:", error);
      return [];
    }
  },

  /**
   * Remove a pending search (after it's been processed)
   */
  async removePendingSearch(id: string): Promise<void> {
    try {
      const pendingSearches = await this.getPendingSearches();
      const filtered = pendingSearches.filter(s => s.id !== id);
      await AsyncStorage.setItem(PENDING_SEARCHES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing pending search:", error);
    }
  },

  /**
   * Clear all pending searches
   */
  async clearPendingSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PENDING_SEARCHES_KEY);
    } catch (error) {
      console.error("Error clearing pending searches:", error);
    }
  },

  /**
   * Increment retry count for a pending search
   */
  async incrementRetryCount(id: string): Promise<void> {
    try {
      const pendingSearches = await this.getPendingSearches();
      const search = pendingSearches.find(s => s.id === id);
      
      if (search) {
        search.retryCount += 1;
        
        // Remove if too many retries
        if (search.retryCount >= 3) {
          await this.removePendingSearch(id);
        } else {
          await AsyncStorage.setItem(PENDING_SEARCHES_KEY, JSON.stringify(pendingSearches));
        }
      }
    } catch (error) {
      console.error("Error incrementing retry count:", error);
    }
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
