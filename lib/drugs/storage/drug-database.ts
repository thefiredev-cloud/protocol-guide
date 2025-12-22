/**
 * Drug Database Manager
 *
 * IndexedDB storage with MiniSearch for offline-first drug lookups.
 * Supports 2,500-5,000 medications for field use by LA County paramedics.
 */

import { DBSchema, IDBPDatabase, openDB } from 'idb';
import MiniSearch from 'minisearch';

import type {
  DrugDatabaseManifest,
  DrugInteraction,
  DrugRecord,
} from '../types';

// ============================================================================
// INDEXEDDB SCHEMA
// ============================================================================

interface DrugDBSchema extends DBSchema {
  drugs: {
    key: string; // rxcui
    value: DrugRecord;
    indexes: {
      'by-name': string;
      'by-class': string;
      'by-brand': string;
    };
  };
  interactions: {
    key: string; // `${drugA_rxcui}-${drugB_rxcui}`
    value: DrugInteraction;
    indexes: {
      'by-drugA': string;
      'by-drugB': string;
      'by-severity': string;
    };
  };
  metadata: {
    key: string;
    value: string;
  };
}

// ============================================================================
// DRUG DATABASE MANAGER
// ============================================================================

export class DrugDatabaseManager {
  private db: IDBPDatabase<DrugDBSchema> | null = null;
  private searchIndex: MiniSearch<DrugRecord> | null = null;
  private manifest: DrugDatabaseManifest | null = null;
  private initialized = false;

  private static instance: DrugDatabaseManager | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DrugDatabaseManager {
    if (!DrugDatabaseManager.instance) {
      DrugDatabaseManager.instance = new DrugDatabaseManager();
    }
    return DrugDatabaseManager.instance;
  }

  /**
   * Initialize database and search index
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Open IndexedDB
      this.db = await openDB<DrugDBSchema>('medic-bot-drugs', 1, {
        upgrade(db) {
          // Drugs store
          if (!db.objectStoreNames.contains('drugs')) {
            const drugStore = db.createObjectStore('drugs', { keyPath: 'rxcui' });
            drugStore.createIndex('by-name', 'name');
            drugStore.createIndex('by-class', 'drugClass');
            drugStore.createIndex('by-brand', 'brandNames', { multiEntry: true });
          }

          // Interactions store
          if (!db.objectStoreNames.contains('interactions')) {
            const interactionStore = db.createObjectStore('interactions');
            interactionStore.createIndex('by-drugA', 'drugA_rxcui');
            interactionStore.createIndex('by-drugB', 'drugB_rxcui');
            interactionStore.createIndex('by-severity', 'severity');
          }

          // Metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });

      // Initialize MiniSearch
      this.searchIndex = new MiniSearch<DrugRecord>({
        fields: ['name', 'displayName', 'brandNames', 'drugClass', 'pillImprint'],
        storeFields: ['rxcui', 'name', 'displayName', 'drugClass', 'emsRelevance', 'brandNames'],
        idField: 'rxcui',
        searchOptions: {
          boost: { name: 3, displayName: 2, brandNames: 2 },
          prefix: true,
          fuzzy: 0.2,
        },
      });

      // Rebuild search index from stored drugs
      await this.rebuildSearchIndex();

      this.initialized = true;
      console.log('[DrugDB] Initialized successfully');
    } catch (error) {
      console.error('[DrugDB] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // ==========================================================================
  // DRUG OPERATIONS
  // ==========================================================================

  /**
   * Get a drug by RxCUI
   */
  async getDrug(rxcui: string): Promise<DrugRecord | undefined> {
    await this.ensureInitialized();
    return this.db?.get('drugs', rxcui);
  }

  /**
   * Get a drug by generic name
   */
  async getDrugByName(name: string): Promise<DrugRecord | undefined> {
    await this.ensureInitialized();
    const normalized = name.toLowerCase().trim();
    const index = this.db?.transaction('drugs').store.index('by-name');
    return index?.get(normalized);
  }

  /**
   * Search drugs by query
   */
  async searchDrugs(query: string, limit = 10): Promise<DrugRecord[]> {
    await this.ensureInitialized();

    if (!this.searchIndex) {
      return [];
    }

    const results = this.searchIndex.search(query).slice(0, limit);
    const drugs: DrugRecord[] = [];

    for (const result of results) {
      const drug = await this.getDrug(result.id);
      if (drug) {
        drugs.push(drug);
      }
    }

    return drugs;
  }

  /**
   * Get drugs by class
   */
  async getDrugsByClass(drugClass: string): Promise<DrugRecord[]> {
    await this.ensureInitialized();
    const index = this.db?.transaction('drugs').store.index('by-class');
    return (await index?.getAll(drugClass)) || [];
  }

  /**
   * Get all drugs
   */
  async getAllDrugs(): Promise<DrugRecord[]> {
    await this.ensureInitialized();
    return (await this.db?.getAll('drugs')) || [];
  }

  /**
   * Get drug count
   */
  async getDrugCount(): Promise<number> {
    await this.ensureInitialized();
    return (await this.db?.count('drugs')) || 0;
  }

  /**
   * Store a single drug
   */
  async storeDrug(drug: DrugRecord): Promise<void> {
    await this.ensureInitialized();
    await this.db?.put('drugs', drug);

    // Update search index
    if (this.searchIndex) {
      try {
        this.searchIndex.remove(drug);
      } catch {
        // Ignore if not in index
      }
      this.searchIndex.add(drug);
    }
  }

  /**
   * Bulk store drugs
   */
  async bulkStoreDrugs(drugs: DrugRecord[]): Promise<void> {
    await this.ensureInitialized();

    const tx = this.db!.transaction('drugs', 'readwrite');
    const store = tx.objectStore('drugs');

    for (const drug of drugs) {
      await store.put(drug);
    }

    await tx.done;

    // Rebuild search index
    await this.rebuildSearchIndex();

    console.log(`[DrugDB] Stored ${drugs.length} drugs`);
  }

  // ==========================================================================
  // INTERACTION OPERATIONS
  // ==========================================================================

  /**
   * Get all interactions for a drug
   */
  async getInteractionsForDrug(rxcui: string): Promise<DrugInteraction[]> {
    await this.ensureInitialized();

    const indexA = this.db?.transaction('interactions').store.index('by-drugA');
    const indexB = this.db?.transaction('interactions').store.index('by-drugB');

    const [asA, asB] = await Promise.all([
      indexA?.getAll(rxcui) || [],
      indexB?.getAll(rxcui) || [],
    ]);

    return [...asA, ...asB];
  }

  /**
   * Check interaction between two drugs
   */
  async checkInteractionPair(
    rxcuiA: string,
    rxcuiB: string
  ): Promise<DrugInteraction | undefined> {
    await this.ensureInitialized();

    // Check both key directions
    const key1 = `${rxcuiA}-${rxcuiB}`;
    const key2 = `${rxcuiB}-${rxcuiA}`;

    const result = await this.db?.get('interactions', key1);
    if (result) return result;

    return this.db?.get('interactions', key2);
  }

  /**
   * Store a single interaction
   */
  async storeInteraction(interaction: DrugInteraction): Promise<void> {
    await this.ensureInitialized();
    const key = `${interaction.drugA_rxcui}-${interaction.drugB_rxcui}`;
    await this.db?.put('interactions', interaction, key);
  }

  /**
   * Bulk store interactions
   */
  async bulkStoreInteractions(interactions: DrugInteraction[]): Promise<void> {
    await this.ensureInitialized();

    const tx = this.db!.transaction('interactions', 'readwrite');
    const store = tx.objectStore('interactions');

    for (const interaction of interactions) {
      const key = `${interaction.drugA_rxcui}-${interaction.drugB_rxcui}`;
      await store.put(interaction, key);
    }

    await tx.done;

    console.log(`[DrugDB] Stored ${interactions.length} interactions`);
  }

  /**
   * Get interaction count
   */
  async getInteractionCount(): Promise<number> {
    await this.ensureInitialized();
    return (await this.db?.count('interactions')) || 0;
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<string | undefined> {
    await this.ensureInitialized();
    return this.db?.get('metadata', key);
  }

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    await this.db?.put('metadata', value, key);
  }

  /**
   * Get database version from metadata
   */
  async getVersion(): Promise<string | undefined> {
    return this.getMetadata('version');
  }

  /**
   * Set database version
   */
  async setVersion(version: string): Promise<void> {
    await this.setMetadata('version', version);
  }

  /**
   * Get manifest
   */
  getManifest(): DrugDatabaseManifest | null {
    return this.manifest;
  }

  /**
   * Set manifest
   */
  setManifest(manifest: DrugDatabaseManifest): void {
    this.manifest = manifest;
  }

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================

  /**
   * Rebuild the search index from stored drugs
   */
  private async rebuildSearchIndex(): Promise<void> {
    if (!this.db || !this.searchIndex) {
      return;
    }

    const drugs = await this.db.getAll('drugs');

    this.searchIndex.removeAll();

    if (drugs.length > 0) {
      this.searchIndex.addAll(drugs);
      console.log(`[DrugDB] Search index rebuilt with ${drugs.length} drugs`);
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized();

    const tx1 = this.db!.transaction('drugs', 'readwrite');
    await tx1.objectStore('drugs').clear();
    await tx1.done;

    const tx2 = this.db!.transaction('interactions', 'readwrite');
    await tx2.objectStore('interactions').clear();
    await tx2.done;

    const tx3 = this.db!.transaction('metadata', 'readwrite');
    await tx3.objectStore('metadata').clear();
    await tx3.done;

    this.searchIndex?.removeAll();

    console.log('[DrugDB] All data cleared');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    drugCount: number;
    interactionCount: number;
    version: string | undefined;
    lastUpdated: string | undefined;
  }> {
    await this.ensureInitialized();

    const [drugCount, interactionCount, version, lastUpdated] = await Promise.all([
      this.getDrugCount(),
      this.getInteractionCount(),
      this.getMetadata('version'),
      this.getMetadata('lastUpdated'),
    ]);

    return {
      drugCount,
      interactionCount,
      version,
      lastUpdated,
    };
  }

  /**
   * Check if database has data
   */
  async hasData(): Promise<boolean> {
    const count = await this.getDrugCount();
    return count > 0;
  }
}

// ============================================================================
// SINGLETON HELPER
// ============================================================================

let drugDBInstance: DrugDatabaseManager | null = null;

/**
 * Get or create the singleton DrugDatabaseManager
 */
export async function getDrugDB(): Promise<DrugDatabaseManager> {
  if (!drugDBInstance) {
    drugDBInstance = DrugDatabaseManager.getInstance();
    await drugDBInstance.initialize();
  }
  return drugDBInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetDrugDB(): void {
  drugDBInstance = null;
}
