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
   * Determine which chunks to load based on query content
   * Returns array of category names that are relevant to the query
   */
  private determineRelevantChunks(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const relevantCategories: string[] = [];

    // Always load medications for drug-related queries
    if (
      lowerQuery.match(/\b(drug|medication|dose|dosage|epinephrine|adenosine|atropine|amiodarone|aspirin|fentanyl|morphine|naloxone|versed|ketamine)\b/)
    ) {
      relevantCategories.push('Medications');
    }

    // Cardiac-related queries
    if (
      lowerQuery.match(/\b(cardiac|heart|chest pain|mi|stemi|stroke|cva|arrest|cpr|acls|defibrillat|pacing|arrhythmia|vtach|vfib|asystole)\b/)
    ) {
      relevantCategories.push('Cardiac');
    }

    // Airway management
    if (
      lowerQuery.match(/\b(airway|intubat|ventilat|breathing|respiratory|bvm|cpap|supraglottic|cricothyrotomy)\b/)
    ) {
      relevantCategories.push('Airway');
      relevantCategories.push('Respiratory');
    }

    // Trauma
    if (
      lowerQuery.match(/\b(trauma|injury|bleed|hemorrhage|wound|burn|fracture|head injury|tbi|penetrating|blunt)\b/)
    ) {
      relevantCategories.push('Trauma');
    }

    // Pediatric
    if (
      lowerQuery.match(/\b(pediatric|child|infant|baby|neonatal|newborn|pedi)\b/)
    ) {
      relevantCategories.push('Pediatrics');
      relevantCategories.push('Pediatric Dosing');
    }

    // Environmental
    if (
      lowerQuery.match(/\b(hypothermia|hyperthermia|heat stroke|drowning|environmental|cold|heat)\b/)
    ) {
      relevantCategories.push('Environmental');
    }

    // Obstetric
    if (
      lowerQuery.match(/\b(pregnan|delivery|obstetric|ob|labor|birth|gynecolog)\b/)
    ) {
      relevantCategories.push('Obstetric');
    }

    // Toxicology
    if (
      lowerQuery.match(/\b(poison|toxic|overdose|ingestion|exposure|antidote)\b/)
    ) {
      relevantCategories.push('Toxicology');
    }

    // Equipment
    if (
      lowerQuery.match(/\b(equipment|device|monitor|defibrillator|scope|iv pump)\b/)
    ) {
      relevantCategories.push('Equipment');
    }

    // Protocol references (look for protocol numbers)
    if (lowerQuery.match(/\b\d{4}\b/)) {
      relevantCategories.push('General-protocols');
    }

    // Administrative/operational queries
    if (
      lowerQuery.match(/\b(policy|procedure|training|certification|approval|facility|hospital|base|communication|radio)\b/)
    ) {
      relevantCategories.push('Admin-training', 'Admin-provider', 'Admin-operations', 'Admin-general');
    }

    // If no specific categories matched, return essential chunks for broad search
    if (relevantCategories.length === 0) {
      return [
        'Medications',
        'Cardiac',
        'Trauma',
        'Airway',
        'General-protocols'
      ];
    }

    return relevantCategories;
  }

  /**
   * Search the knowledge base with intelligent chunk loading
   * Analyzes query to determine which chunks to load
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

    // Determine which chunks to load
    let chunksToLoad: string[];
    if (categories && categories.length > 0) {
      // Use provided categories
      chunksToLoad = categories;
    } else {
      // Intelligently determine based on query
      chunksToLoad = this.determineRelevantChunks(query);
      console.log('[ChunkedKB] Auto-detected relevant chunks for query:', chunksToLoad);
    }

    // Load relevant chunks
    await Promise.all(chunksToLoad.map(cat => this.loadChunk(cat)));

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
    const essentialCategories = [
      'Medication',
      'Medications',
      'Cardiac',
      'Airway',
      'Pediatric Dosing',
      'Protocol'
    ];

    const toLoad = essentialCategories.filter(cat =>
      this.manifest?.chunks.some(chunk => chunk.category === cat)
    );

    if (toLoad.length > 0) {
      console.log('[ChunkedKB] Preloading essential chunks:', toLoad);
      await this.loadChunks(toLoad);
    }
  }

  /**
   * Search with automatic expansion to related chunks if initial results are sparse
   */
  async smartSearch(query: string, minResults = 5): Promise<Array<{
    id: string;
    title: string;
    category: string;
    score: number;
    match: Record<string, string[]>;
  }>> {
    // First search with relevant chunks
    let results = await this.search(query);

    // If we don't have enough results, expand to more chunks
    if (results.length < minResults && this.loadedChunks.size < this.manifest!.chunks.length) {
      console.log('[ChunkedKB] Expanding search to additional chunks');

      // Load general-protocols and reference materials
      const expandedCategories = ['General-protocols', 'Reference', 'General'];
      await this.loadChunks(expandedCategories);

      // Search again
      results = await this.search(query);
    }

    return results;
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
