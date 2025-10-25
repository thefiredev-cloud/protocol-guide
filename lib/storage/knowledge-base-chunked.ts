import { DBSchema, IDBPDatabase,openDB } from 'idb';
import MiniSearch from 'minisearch';

interface KBChunk {
  category: string;
  filename: string;
  count: number;
  sizeKB: number;
}

interface KBManifest {
  version: string;
  generatedAt: string;
  chunks: KBChunk[];
}

interface KBDocument {
  id: string;
  title: string;
  category: string;
  keywords?: string[];
  content?: string;
  [key: string]: unknown;
}

interface KBDatabase extends DBSchema {
  chunks: {
    key: string;
    value: KBDocument[];
  };
  metadata: {
    key: string;
    value: {
      loadedAt: string;
      version: string;
    };
  };
}

export class ChunkedKnowledgeBaseManager {
  private db: IDBPDatabase<KBDatabase> | null = null;
  private manifest: KBManifest | null = null;
  private loadedChunks = new Set<string>();
  private searchIndex: MiniSearch<KBDocument> | null = null;

  /**
   * Initialize the chunked KB manager
   * Loads manifest and sets up IndexedDB
   */
  async initialize(): Promise<void> {
    try {
      // Load manifest
      const response = await fetch('/kb/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      this.manifest = await response.json();

      // Open IndexedDB
      this.db = await openDB<KBDatabase>('medic-bot-kb', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('chunks')) {
            db.createObjectStore('chunks');
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });

      // Initialize search index
      this.searchIndex = new MiniSearch<KBDocument>({
        fields: ['title', 'content', 'keywords'],
        storeFields: ['id', 'title', 'category'],
        searchOptions: {
          boost: { title: 2 },
          prefix: true,
          fuzzy: 0.2,
        },
      });

      console.log('[ChunkedKB] Initialized with', this.manifest?.chunks.length ?? 0, 'chunks');
    } catch (error) {
      console.error('[ChunkedKB] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load a specific chunk by category
   * Uses IndexedDB cache when available
   */
  async loadChunk(category: string): Promise<void> {
    if (this.loadedChunks.has(category)) {
      console.log('[ChunkedKB] Chunk already loaded:', category);
      return;
    }

    try {
      // Check IndexedDB cache first
      const cached = await this.db?.get('chunks', category);
      if (cached && Array.isArray(cached)) {
        console.log('[ChunkedKB] Loading from cache:', category, '(', cached.length, 'docs)');
        this.searchIndex?.addAll(cached);
        this.loadedChunks.add(category);
        return;
      }

      // Fetch from network
      const chunk = this.manifest?.chunks.find(c => c.category === category);
      if (!chunk) {
        throw new Error(`Chunk ${category} not found in manifest`);
      }

      console.log('[ChunkedKB] Fetching chunk:', chunk.filename);
      const response = await fetch(`/kb/chunks/${chunk.filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chunk: ${response.statusText}`);
      }

      const data: KBDocument[] = await response.json();

      // Cache in IndexedDB
      await this.db?.put('chunks', data, category);

      // Add to search index
      this.searchIndex?.addAll(data);
      this.loadedChunks.add(category);

      console.log('[ChunkedKB] Loaded chunk:', category, '(', data.length, 'docs)');
    } catch (error) {
      console.error('[ChunkedKB] Error loading chunk:', category, error);
      throw error;
    }
  }

  /**
   * Load multiple chunks in parallel
   */
  async loadChunks(categories: string[]): Promise<void> {
    await Promise.all(categories.map(cat => this.loadChunk(cat)));
  }

  /**
   * Search the knowledge base
   * Lazy-loads chunks as needed based on categories filter
   */
  async search(query: string, categories?: string[]): Promise<Array<{
    id: string;
    title: string;
    category: string;
    score: number;
    match: Record<string, string[]>;
  }>> {
    if (!this.searchIndex) {
      throw new Error('Search index not initialized');
    }

    // Load relevant chunks if not loaded
    if (categories && categories.length > 0) {
      await Promise.all(categories.map(cat => this.loadChunk(cat)));
    } else {
      // Load all chunks (fallback for broad queries)
      await Promise.all(
        this.manifest!.chunks.map(chunk => this.loadChunk(chunk.category))
      );
    }

    const results = this.searchIndex.search(query);
    return results.map(result => ({
      id: result.id,
      title: (result as unknown as KBDocument).title,
      category: (result as unknown as KBDocument).category,
      score: result.score,
      match: result.match,
    }));
  }

  /**
   * Get all loaded documents from a specific category
   */
  async getDocuments(category: string): Promise<KBDocument[]> {
    await this.loadChunk(category);
    const cached = await this.db?.get('chunks', category);
    return cached || [];
  }

  /**
   * Get statistics about loaded chunks
   */
  getStats(): {
    totalChunks: number;
    loadedChunks: number;
    loadedCategories: string[];
    manifest: KBManifest | null;
  } {
    return {
      totalChunks: this.manifest?.chunks.length || 0,
      loadedChunks: this.loadedChunks.size,
      loadedCategories: Array.from(this.loadedChunks),
      manifest: this.manifest,
    };
  }

  /**
   * Clear all cached chunks from IndexedDB
   */
  async clearCache(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('chunks', 'readwrite');
    await tx.objectStore('chunks').clear();
    await tx.done;

    this.loadedChunks.clear();
    this.searchIndex?.removeAll();

    console.log('[ChunkedKB] Cache cleared');
  }

  /**
   * Preload specific categories that are commonly needed
   * Call this during app initialization for better UX
   */
  async preloadEssentialChunks(): Promise<void> {
    // Preload smaller, frequently accessed chunks
    const essentialCategories = ['Medication', 'Protocol', 'Clinical Decision Support'];

    const toLoad = essentialCategories.filter(cat =>
      this.manifest?.chunks.some(chunk => chunk.category === cat)
    );

    if (toLoad.length > 0) {
      console.log('[ChunkedKB] Preloading essential chunks:', toLoad);
      await this.loadChunks(toLoad);
    }
  }
}

// Singleton instance
let chunkedKBInstance: ChunkedKnowledgeBaseManager | null = null;

/**
 * Get or create the singleton instance of ChunkedKnowledgeBaseManager
 */
export async function getChunkedKB(): Promise<ChunkedKnowledgeBaseManager> {
  if (!chunkedKBInstance) {
    chunkedKBInstance = new ChunkedKnowledgeBaseManager();
    await chunkedKBInstance.initialize();
  }
  return chunkedKBInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetChunkedKB(): void {
  chunkedKBInstance = null;
}
