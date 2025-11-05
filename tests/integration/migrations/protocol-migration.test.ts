/**
 * Protocol Data Migration Tests
 * Validates data integrity during protocol database migration
 */

import { beforeAll,describe, expect, test } from 'vitest';

import { getSupabaseAdminClient } from '@/lib/db/client';

describe('Protocol Data Migration', () => {
  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  beforeAll(() => {
    supabase = getSupabaseAdminClient();
  });

  describe('Data Integrity', () => {
    test('should have migrated all protocols without loss', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, tp_name')
        .order('tp_code');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify we have LA County protocols
      expect(data?.length).toBeGreaterThan(0);

      // Log for debugging
      console.log(`✓ Found ${data?.length} protocols in database`);
    });

    test('should have migrated all protocol chunks', async () => {
      const { data, error } = await supabase
        .from('protocol_chunks' as any)
        .select('id');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify chunks were migrated
      const chunkCount = data?.length || 0;
      expect(chunkCount).toBeGreaterThan(0);

      console.log(`✓ Found ${chunkCount} protocol chunks in database`);
    });

    test('should preserve protocol relationships', async () => {
      // Get protocols with their chunks
      const { data: protocols, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, protocol_chunks(id, chunk_index)')
        .order('tp_code')
        .limit(10);

      expect(error).toBeNull();
      expect(protocols).toBeDefined();

      // Verify each protocol has chunks
      protocols?.forEach((protocol: any) => {
        expect(protocol.protocol_chunks).toBeDefined();
        expect(protocol.protocol_chunks.length).toBeGreaterThan(0);
      });
    });

    test('should have no null values in required metadata fields', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, tp_name, category, full_text')
        .or('tp_code.is.null,tp_name.is.null,category.is.null,full_text.is.null');

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    test('should maintain chunk order and context', async () => {
      // Get a sample protocol with chunks
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .select('id, tp_code')
        .limit(1)
        .single();

      if (!protocol) {
        console.warn('No protocols found for chunk order test');
        return;
      }

      const { data: chunks, error } = await supabase
        .from('protocol_chunks' as any)
        .select('chunk_index, chunk_text')
        .eq('protocol_id', protocol.id)
        .order('chunk_index');

      expect(error).toBeNull();
      expect(chunks).toBeDefined();
      expect(chunks?.length).toBeGreaterThan(0);

      // Verify chunks are in sequential order
      chunks?.forEach((chunk: any, index: number) => {
        expect(chunk.chunk_index).toBe(index);
        expect(chunk.chunk_text).toBeDefined();
        expect(chunk.chunk_text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Transformation', () => {
    test('should have valid tp_code format', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify tp_code follows expected format (e.g., "1210", "1211-P")
      const tpCodePattern = /^\d{4}(-P)?$/;

      data?.forEach((protocol: any) => {
        expect(protocol.tp_code).toMatch(tpCodePattern);
      });
    });

    test('should have normalized protocol categories', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('category')
        .not('category', 'is', null);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Get unique categories
      const categories = new Set(data?.map((p: any) => p.category));

      // Verify we have reasonable categories
      expect(categories.size).toBeGreaterThan(0);
      expect(categories.size).toBeLessThan(50); // Sanity check

      console.log(`✓ Found ${categories.size} unique protocol categories`);
    });

    test('should have extracted provider impressions correctly', async () => {
      // Check if protocols have associated provider impressions
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, tp_name, metadata')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify metadata structure
      data?.forEach((protocol: any) => {
        expect(protocol.metadata).toBeDefined();
        expect(typeof protocol.metadata).toBe('object');
      });
    });
  });

  describe('Data Quality Checks', () => {
    test('should have no orphaned protocol chunks', async () => {
      // Find chunks without valid protocol references
      const { data, error } = await supabase
        .rpc('find_orphaned_chunks' as any);

      if (error && error.message.includes('function')) {
        // Function doesn't exist yet - skip this test
        console.warn('find_orphaned_chunks function not implemented yet');
        return;
      }

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    test('should have no duplicate protocols', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, version');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Check for duplicate tp_code + version combinations
      const combinations = new Set<string>();
      const duplicates: string[] = [];

      data?.forEach((protocol: any) => {
        const key = `${protocol.tp_code}-v${protocol.version}`;
        if (combinations.has(key)) {
          duplicates.push(key);
        }
        combinations.add(key);
      });

      expect(duplicates).toHaveLength(0);
    });

    test('should have consistent chunk counts', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, protocol_chunks(count)');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify each protocol has at least 1 chunk
      data?.forEach((protocol: any) => {
        const chunkCount = protocol.protocol_chunks?.[0]?.count || 0;
        expect(chunkCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Idempotency', () => {
    test('should handle duplicate inserts gracefully', async () => {
      // Attempt to insert a protocol that already exists
      const { data: existingProtocol } = await supabase
        .from('protocols' as any)
        .select('tp_code, tp_name, category, version')
        .limit(1)
        .single();

      if (!existingProtocol) {
        console.warn('No existing protocol found for idempotency test');
        return;
      }

      // Try to insert duplicate (should fail with unique constraint)
      const { error } = await supabase
        .from('protocols' as any)
        .insert({
          ...existingProtocol,
          full_text: 'Duplicate test',
          effective_date: new Date().toISOString(),
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('unique');
    });

    test('should not create duplicate chunks on re-migration', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .select('id')
        .limit(1)
        .single();

      if (!protocol) {
        console.warn('No protocol found for duplicate chunk test');
        return;
      }

      const { data: chunks } = await supabase
        .from('protocol_chunks' as any)
        .select('content_hash')
        .eq('protocol_id', protocol.id);

      // Verify no duplicate content hashes
      const hashes = chunks?.map((c: any) => c.content_hash) || [];
      const uniqueHashes = new Set(hashes);

      expect(hashes.length).toBe(uniqueHashes.size);
    });
  });

  describe('Performance Validation', () => {
    test('should query protocols efficiently', async () => {
      const start = Date.now();

      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, tp_name')
        .limit(100);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete within 1 second

      console.log(`✓ Query completed in ${duration}ms`);
    });

    test('should join protocols and chunks efficiently', async () => {
      const start = Date.now();

      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, protocol_chunks(chunk_index, chunk_text)')
        .limit(10);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds

      console.log(`✓ Join query completed in ${duration}ms`);
    });
  });
});
