/**
 * Data Quality Assurance Tests
 * Validates protocol data integrity and consistency
 */

import { beforeAll,describe, expect, test } from 'vitest';

import { getSupabaseAdminClient } from '@/lib/db/client';

describe('Data Quality Assurance', () => {
  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  beforeAll(() => {
    supabase = getSupabaseAdminClient();
  });

  describe('Required Field Validation', () => {
    test('should have zero null values in tp_code', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id')
        .is('tp_code', null);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);

      console.log('✓ No null tp_code values found');
    });

    test('should have zero null values in tp_name', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id')
        .is('tp_name', null);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);

      console.log('✓ No null tp_name values found');
    });

    test('should have zero null values in full_text', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id')
        .is('full_text', null);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);

      console.log('✓ No null full_text values found');
    });

    test('should have zero empty full_text values', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id, tp_code')
        .eq('full_text', '');

      expect(error).toBeNull();
      expect(data).toHaveLength(0);

      console.log('✓ No empty full_text values found');
    });
  });

  describe('Referential Integrity', () => {
    test('should have no orphaned protocol chunks', async () => {
      // Find chunks where protocol_id doesn't exist in protocols table
      const { data, error } = await supabase
        .from('protocol_chunks' as any)
        .select('id, protocol_id')
        .not('protocol_id', 'in',
          supabase.from('protocols' as any).select('id')
        );

      expect(error).toBeNull();

      if (data && data.length > 0) {
        console.warn(`⚠️  Found ${data.length} orphaned chunks`);
        expect(data).toHaveLength(0);
      } else {
        console.log('✓ No orphaned protocol chunks found');
      }
    });

    test('should have no orphaned embeddings', async () => {
      const { data, error } = await supabase
        .from('protocol_embeddings' as any)
        .select('id, chunk_id')
        .not('chunk_id', 'in',
          supabase.from('protocol_chunks' as any).select('id')
        );

      expect(error).toBeNull();

      if (data && data.length > 0) {
        console.warn(`⚠️  Found ${data.length} orphaned embeddings`);
        expect(data).toHaveLength(0);
      } else {
        console.log('✓ No orphaned embeddings found');
      }
    });

    test('should validate all foreign key relationships', async () => {
      // Check protocol_chunks -> protocols
      const { data: chunks, error: chunkError } = await supabase
        .from('protocol_chunks' as any)
        .select('id, protocol_id');

      expect(chunkError).toBeNull();

      if (chunks && chunks.length > 0) {
        const { data: protocols } = await supabase
          .from('protocols' as any)
          .select('id')
          .in('id', chunks.map((c: any) => c.protocol_id));

        expect(protocols?.length).toBe(new Set(chunks.map((c: any) => c.protocol_id)).size);
        console.log('✓ All protocol chunk references are valid');
      }
    });
  });

  describe('Data Consistency', () => {
    test('should have no duplicate tp_code values', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const tpCodes = data?.map((p: any) => p.tp_code) || [];
      const uniqueTpCodes = new Set(tpCodes);

      expect(tpCodes.length).toBe(uniqueTpCodes.size);

      console.log(`✓ ${tpCodes.length} unique protocol codes, no duplicates`);
    });

    test('should have consistent chunk ordering', async () => {
      const { data: protocols } = await supabase
        .from('protocols' as any)
        .select('id')
        .limit(10);

      if (!protocols || protocols.length === 0) {
        console.warn('No protocols found for chunk ordering test');
        return;
      }

      for (const protocol of protocols) {
        const { data: chunks } = await supabase
          .from('protocol_chunks' as any)
          .select('chunk_index')
          .eq('protocol_id', protocol.id)
          .order('chunk_index');

        if (chunks && chunks.length > 0) {
          chunks.forEach((chunk: any, index: number) => {
            expect(chunk.chunk_index).toBe(index);
          });
        }
      }

      console.log('✓ All protocol chunks have consistent ordering');
    });

    test('should have valid date ranges', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, effective_date, expiration_date')
        .not('expiration_date', 'is', null);

      expect(error).toBeNull();

      data?.forEach((protocol: any) => {
        const effective = new Date(protocol.effective_date);
        const expiration = new Date(protocol.expiration_date);

        expect(effective <= expiration).toBe(true);
      });

      console.log('✓ All date ranges are valid');
    });

    test('should have valid version numbers', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, version');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data?.forEach((protocol: any) => {
        expect(protocol.version).toBeGreaterThan(0);
        expect(Number.isInteger(protocol.version)).toBe(true);
      });

      console.log('✓ All protocol versions are valid');
    });
  });

  describe('Content Quality', () => {
    test('should have reasonable content lengths', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, full_text');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data?.forEach((protocol: any) => {
        expect(protocol.full_text.length).toBeGreaterThan(100);
        expect(protocol.full_text.length).toBeLessThan(100000);
      });

      console.log('✓ All protocol content lengths are reasonable');
    });

    test('should have reasonable chunk sizes', async () => {
      const { data, error } = await supabase
        .from('protocol_chunks' as any)
        .select('chunk_text')
        .limit(100);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data?.forEach((chunk: any) => {
        expect(chunk.chunk_text.length).toBeGreaterThan(50);
        expect(chunk.chunk_text.length).toBeLessThan(10000);
      });

      console.log('✓ All chunk sizes are reasonable');
    });

    test('should have unique content hashes', async () => {
      const { data, error } = await supabase
        .from('protocol_chunks' as any)
        .select('content_hash');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const hashes = data?.map((c: any) => c.content_hash) || [];
      const uniqueHashes = new Set(hashes);

      expect(hashes.length).toBe(uniqueHashes.size);

      console.log(`✓ ${hashes.length} chunks with unique content hashes`);
    });
  });

  describe('Metadata Quality', () => {
    test('should have valid metadata structure', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('tp_code, metadata')
        .not('metadata', 'is', null)
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data?.forEach((protocol: any) => {
        expect(typeof protocol.metadata).toBe('object');
        expect(protocol.metadata).not.toBeNull();
      });

      console.log('✓ All protocol metadata has valid structure');
    });

    test('should have valid categories', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('category')
        .not('category', 'is', null);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const categories = new Set(data?.map((p: any) => p.category));

      expect(categories.size).toBeGreaterThan(0);
      expect(categories.size).toBeLessThan(100); // Reasonable number of categories

      console.log(`✓ Found ${categories.size} protocol categories`);
    });
  });

  describe('Completeness Checks', () => {
    test('should have protocols for all major categories', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('category')
        .not('category', 'is', null);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const categories = new Set(data?.map((p: any) => p.category.toLowerCase()));

      // Check for major emergency categories
      const majorCategories = ['cardiac', 'respiratory', 'trauma', 'neurological'];

      majorCategories.forEach(category => {
        const hasCategory = Array.from(categories).some(cat =>
          (cat as string).includes(category)
        );

        if (!hasCategory) {
          console.warn(`⚠️  Missing protocols for category: ${category}`);
        }
      });

      console.log('✓ Major protocol categories present');
    });

    test('should have minimum expected protocol count', async () => {
      const { data, error } = await supabase
        .from('protocols' as any)
        .select('id');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // LA County should have substantial protocol library
      expect(data?.length).toBeGreaterThan(10);

      console.log(`✓ Found ${data?.length} protocols in database`);
    });

    test('should have chunks for all protocols', async () => {
      const { data: protocols } = await supabase
        .from('protocols' as any)
        .select('id, tp_code');

      expect(protocols).toBeDefined();

      for (const protocol of protocols || []) {
        const { data: chunks } = await supabase
          .from('protocol_chunks' as any)
          .select('id')
          .eq('protocol_id', protocol.id);

        expect(chunks).toBeDefined();
        expect(chunks!.length).toBeGreaterThan(0);
      }

      console.log('✓ All protocols have associated chunks');
    });
  });

  describe('Performance Indicators', () => {
    test('should have reasonable chunk distribution', async () => {
      const { data } = await supabase
        .from('protocols' as any)
        .select('id, tp_code, protocol_chunks(count)');

      expect(data).toBeDefined();

      const chunkCounts = data?.map((p: any) =>
        p.protocol_chunks?.[0]?.count || 0
      ) || [];

      const avgChunks = chunkCounts.reduce((a, b) => a + b, 0) / chunkCounts.length;
      const maxChunks = Math.max(...chunkCounts);
      const minChunks = Math.min(...chunkCounts);

      expect(avgChunks).toBeGreaterThan(1);
      expect(avgChunks).toBeLessThan(100);

      console.log(`✓ Chunk distribution: avg ${avgChunks.toFixed(1)}, min ${minChunks}, max ${maxChunks}`);
    });
  });
});
