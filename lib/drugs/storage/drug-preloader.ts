/**
 * Drug Database Preloader
 *
 * Handles initial loading and updates of the drug database.
 * Designed for PWA offline-first operation.
 */

import type {
  DrugDatabaseManifest,
  DrugInteraction,
  DrugRecord,
} from '../types';
import { getDrugDB } from './drug-database';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DRUG_DATA_BASE_URL = '/drugs';
const MANIFEST_URL = `${DRUG_DATA_BASE_URL}/manifest.json`;
const DRUGS_URL = `${DRUG_DATA_BASE_URL}/drugs.json`;
const INTERACTIONS_URL = `${DRUG_DATA_BASE_URL}/interactions.json`;

// ============================================================================
// PRELOADER
// ============================================================================

export class DrugPreloader {
  private loading = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Check if drug database needs to be loaded or updated
   */
  async needsUpdate(): Promise<boolean> {
    try {
      const db = await getDrugDB();

      // Check if we have any data
      const hasData = await db.hasData();
      if (!hasData) {
        console.log('[DrugPreloader] No data found, needs initial load');
        return true;
      }

      // Fetch manifest to check version
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) {
        console.warn('[DrugPreloader] Could not fetch manifest');
        return false; // Can't update if we can't fetch manifest
      }

      const manifest: DrugDatabaseManifest = await response.json();
      const currentVersion = await db.getVersion();

      if (currentVersion !== manifest.version) {
        console.log(`[DrugPreloader] Update available: ${currentVersion} -> ${manifest.version}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[DrugPreloader] Error checking for updates:', error);
      return false;
    }
  }

  /**
   * Load or update the drug database
   * Returns true if data was loaded, false if already up to date or failed
   */
  async load(force = false): Promise<boolean> {
    // Prevent concurrent loads
    if (this.loading) {
      console.log('[DrugPreloader] Load already in progress, waiting...');
      await this.loadPromise;
      return true;
    }

    this.loading = true;
    this.loadPromise = this.doLoad(force);

    try {
      await this.loadPromise;
      return true;
    } catch (error) {
      console.error('[DrugPreloader] Load failed:', error);
      return false;
    } finally {
      this.loading = false;
      this.loadPromise = null;
    }
  }

  private async doLoad(force: boolean): Promise<void> {
    const db = await getDrugDB();

    // Check if update needed
    if (!force) {
      const needsUpdate = await this.needsUpdate();
      if (!needsUpdate) {
        console.log('[DrugPreloader] Database is up to date');
        return;
      }
    }

    console.log('[DrugPreloader] Starting database load...');

    // Fetch manifest
    const manifestResponse = await fetch(MANIFEST_URL);
    if (!manifestResponse.ok) {
      throw new Error(`Failed to fetch manifest: ${manifestResponse.statusText}`);
    }
    const manifest: DrugDatabaseManifest = await manifestResponse.json();

    console.log(`[DrugPreloader] Loading version ${manifest.version}`);
    console.log(`[DrugPreloader] Expected: ${manifest.drugCount} drugs, ${manifest.interactionCount} interactions`);

    // Fetch drugs
    const drugsResponse = await fetch(DRUGS_URL);
    if (!drugsResponse.ok) {
      throw new Error(`Failed to fetch drugs: ${drugsResponse.statusText}`);
    }
    const drugs: DrugRecord[] = await drugsResponse.json();
    console.log(`[DrugPreloader] Fetched ${drugs.length} drugs`);

    // Fetch interactions
    const interactionsResponse = await fetch(INTERACTIONS_URL);
    if (!interactionsResponse.ok) {
      throw new Error(`Failed to fetch interactions: ${interactionsResponse.statusText}`);
    }
    const interactions: DrugInteraction[] = await interactionsResponse.json();
    console.log(`[DrugPreloader] Fetched ${interactions.length} interactions`);

    // Clear existing data and store new data
    await db.clearAll();
    await db.bulkStoreDrugs(drugs);
    await db.bulkStoreInteractions(interactions);

    // Store metadata
    await db.setVersion(manifest.version);
    await db.setMetadata('lastUpdated', new Date().toISOString());
    await db.setMetadata('drugCount', String(drugs.length));
    await db.setMetadata('interactionCount', String(interactions.length));

    db.setManifest(manifest);

    console.log('[DrugPreloader] Database load complete');
  }

  /**
   * Get loading status
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Preload in background (non-blocking)
   * Call this on app startup
   */
  preloadInBackground(): void {
    // Don't wait for this - let it run in background
    this.load().catch(error => {
      console.warn('[DrugPreloader] Background preload failed:', error);
    });
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let preloaderInstance: DrugPreloader | null = null;

/**
 * Get the singleton DrugPreloader
 */
export function getDrugPreloader(): DrugPreloader {
  if (!preloaderInstance) {
    preloaderInstance = new DrugPreloader();
  }
  return preloaderInstance;
}

/**
 * Convenience function to preload drug database
 * Safe to call multiple times - will only load once
 */
export async function preloadDrugDatabase(force = false): Promise<boolean> {
  const preloader = getDrugPreloader();
  return preloader.load(force);
}

/**
 * Start background preload on app initialization
 */
export function startDrugDatabasePreload(): void {
  const preloader = getDrugPreloader();
  preloader.preloadInBackground();
}
