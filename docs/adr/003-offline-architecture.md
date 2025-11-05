# ADR-003: Offline-First Architecture for Field Reliability

**Status:** Proposed
**Date:** 2025-10-31
**Decision Makers:** Architecture Team

## Context

Field paramedics often work in areas with poor or no network connectivity:
- Rural areas with limited cell coverage
- Building basements and parking structures
- Network congestion during major incidents
- Device airplane mode to preserve battery

Current PWA provides basic offline capabilities but lacks protocol search and full functionality when offline.

## Decision

Implement a **comprehensive offline-first architecture** using IndexedDB for protocol storage and a sync queue for deferred operations.

### Architecture Components:

1. **IndexedDB Protocol Database** - Full protocol content searchable offline
2. **Service Worker Enhancement** - Intelligent caching and sync
3. **Sync Queue** - Deferred operation handling
4. **Conflict Resolution** - Smart merging of offline/online data

## Rationale

### Storage Options Considered:

1. **LocalStorage** (Rejected)
   - Pros: Simple API, synchronous
   - Cons: 5-10MB limit, blocks main thread, no complex queries

2. **WebSQL** (Rejected)
   - Pros: SQL queries, relational
   - Cons: Deprecated, Safari-only support

3. **IndexedDB** (Selected)
   - Pros: Large storage (50MB+), async, complex queries, reliable
   - Cons: Complex API, requires wrapper

4. **Cache API Only** (Rejected)
   - Pros: Simple, integrated with Service Worker
   - Cons: No structured queries, limited to request/response

### Key Requirements:

- Store 7,000+ protocol documents (≈11MB)
- Full-text search capability offline
- Work on 5-year-old iPads
- Sync when connection returns
- Handle partial connectivity

## Consequences

### Positive:
- 100% functionality without network
- Faster response times (local search)
- Reduced data usage
- Better battery life
- Reliable in all field conditions

### Negative:
- Initial download size (11MB)
- Complex sync logic
- Storage management needed
- Potential for stale data

### Mitigations:
- Progressive download with priority protocols
- Background sync when on WiFi
- Storage quota management
- Version checking and auto-update

## Implementation

```typescript
// Offline Protocol Database
class OfflineProtocolDB {
  private db: IDBDatabase;
  private readonly DB_NAME = 'medic-bot-protocols';
  private readonly VERSION = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Protocol store with indexes
        if (!db.objectStoreNames.contains('protocols')) {
          const store = db.createObjectStore('protocols', {
            keyPath: 'tp_code'
          });

          // Indexes for searching
          store.createIndex('tp_name', 'tp_name', { unique: false });
          store.createIndex('pi_code', 'pi_code', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('keywords', 'keywords', { unique: false, multiEntry: true });
          store.createIndex('fulltext', 'searchText', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async searchProtocols(query: string): Promise<Protocol[]> {
    // Tokenize query
    const tokens = this.tokenize(query.toLowerCase());
    const results = new Map<string, Protocol & { score: number }>();

    const tx = this.db.transaction(['protocols'], 'readonly');
    const store = tx.objectStore('protocols');

    // Search across multiple indexes
    for (const token of tokens) {
      // Search in protocol names
      const nameIndex = store.index('tp_name');
      const nameResults = await this.searchIndex(nameIndex, token);

      // Search in keywords
      const keywordIndex = store.index('keywords');
      const keywordResults = await this.searchIndex(keywordIndex, token);

      // Combine and score results
      [...nameResults, ...keywordResults].forEach(protocol => {
        const existing = results.get(protocol.tp_code);
        if (existing) {
          existing.score += this.calculateScore(protocol, token);
        } else {
          results.set(protocol.tp_code, {
            ...protocol,
            score: this.calculateScore(protocol, token)
          });
        }
      });
    }

    // Sort by relevance score
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private calculateScore(protocol: Protocol, token: string): number {
    let score = 0;

    // Exact match in title: highest score
    if (protocol.tp_name.toLowerCase().includes(token)) {
      score += 10;
    }

    // Match in keywords: medium score
    if (protocol.keywords?.some(k => k.toLowerCase().includes(token))) {
      score += 5;
    }

    // Match in content: lower score
    if (protocol.content?.toLowerCase().includes(token)) {
      score += 1;
    }

    return score;
  }

  private tokenize(query: string): string[] {
    // Remove common words and tokenize
    const stopWords = new Set(['the', 'and', 'or', 'for', 'with', 'patient']);
    return query
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }
}

// Sync Queue Manager
class SyncQueueManager {
  private queue: SyncOperation[] = [];
  private syncing = false;

  async addToQueue(operation: SyncOperation): Promise<void> {
    // Add to IndexedDB queue
    const db = await this.getDB();
    const tx = db.transaction(['syncQueue'], 'readwrite');
    await tx.objectStore('syncQueue').add({
      ...operation,
      timestamp: Date.now(),
      retries: 0
    });

    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const db = await this.getDB();
      const tx = db.transaction(['syncQueue'], 'readonly');
      const store = tx.objectStore('syncQueue');
      const operations = await store.getAll();

      for (const op of operations) {
        try {
          await this.executeOperation(op);

          // Remove from queue on success
          const deleteTx = db.transaction(['syncQueue'], 'readwrite');
          await deleteTx.objectStore('syncQueue').delete(op.id);
        } catch (error) {
          // Increment retry count
          op.retries++;

          if (op.retries >= 3) {
            // Move to dead letter queue or notify user
            console.error('Sync operation failed after 3 retries:', op);
          }
        }
      }
    } finally {
      this.syncing = false;
    }
  }

  private async executeOperation(op: SyncOperation): Promise<void> {
    switch (op.type) {
      case 'chat-message':
        return this.syncChatMessage(op.data);
      case 'audit-log':
        return this.syncAuditLog(op.data);
      case 'narrative-save':
        return this.syncNarrative(op.data);
      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }
}

// Service Worker Enhancement
// sw.js
self.addEventListener('fetch', (event) => {
  // Network-first for API calls with fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('api-cache-v1').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: try cache then construct offline response
          return caches.match(event.request).then(cached => {
            if (cached) return cached;

            // Construct offline response for protocol queries
            if (event.request.url.includes('/api/chat')) {
              return constructOfflineResponse(event.request);
            }

            return new Response(
              JSON.stringify({
                error: 'Offline',
                fallback: true
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  }
});

async function constructOfflineResponse(request) {
  const body = await request.json();
  const query = body.messages[body.messages.length - 1].content;

  // Search offline database
  const db = await openProtocolDB();
  const results = await searchOfflineProtocols(db, query);

  return new Response(
    JSON.stringify({
      text: formatOfflineResults(results),
      citations: results.map(r => ({
        title: r.tp_name,
        category: 'Protocol',
        subcategory: r.category
      })),
      offline: true
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

## Storage Strategy

### Progressive Download:
1. **Critical protocols** (cardiac, respiratory, trauma) - Downloaded immediately
2. **Common protocols** - Downloaded on WiFi
3. **All protocols** - Background sync when idle

### Storage Quotas:
- **Minimum:** 50MB (critical protocols only)
- **Target:** 100MB (all protocols + cache)
- **Maximum:** 200MB (with user permission)

### Data Freshness:
- **Check for updates:** Every app launch
- **Background sync:** Every 6 hours on WiFi
- **Force refresh:** Manual trigger available
- **Version tracking:** Semantic versioning for protocol updates

## Metrics

- **Offline Search Performance:** <500ms for 95th percentile
- **Storage Usage:** <100MB total
- **Sync Success Rate:** >95% within 24 hours
- **Cache Hit Rate:** >80% for common queries
- **Initial Load Time:** <5s on 3G

## Testing Strategy

1. **Network Conditions:**
   - Airplane mode
   - Slow 3G throttling
   - Intermittent connectivity
   - Network switching

2. **Storage Scenarios:**
   - Full storage
   - Quota exceeded
   - Corrupt database
   - Version migration

3. **Sync Scenarios:**
   - Queue overflow
   - Partial sync failure
   - Conflict resolution
   - Duplicate detection

## Review Schedule

- Prototype review: Week 6
- Field testing: Week 8-10
- Production review: After 1 month
- Quarterly performance reviews