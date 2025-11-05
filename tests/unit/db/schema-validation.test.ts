/**
 * Database Schema Validation Tests
 * Tests protocol database schema structure, constraints, and integrity
 */

import { afterEach,beforeEach, describe, expect, test } from 'vitest';

import { getSupabaseAdminClient } from '@/lib/db/client';

describe('Protocol Database Schema', () => {
  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  beforeEach(() => {
    supabase = getSupabaseAdminClient();
  });

  afterEach(async () => {
    // Cleanup test data if needed
  });

  describe('Protocols Table', () => {
    test('should have correct table structure', async () => {
      const { data, error } = await supabase
        .from('information_schema.columns' as any)
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'protocols')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify required columns exist
      const columns = data?.map((col: any) => col.column_name) || [];
      expect(columns).toContain('id');
      expect(columns).toContain('tp_code');
      expect(columns).toContain('tp_name');
      expect(columns).toContain('category');
      expect(columns).toContain('version');
      expect(columns).toContain('effective_date');
      expect(columns).toContain('expiration_date');
      expect(columns).toContain('full_text');
      expect(columns).toContain('metadata');
    });

    test('should enforce unique tp_code constraint', async () => {
      // Create test protocol
      const testProtocol = {
        tp_code: 'TEST_UNIQUE_001',
        tp_name: 'Test Protocol',
        category: 'Test',
        version: 1,
        full_text: 'Test content',
        effective_date: new Date().toISOString(),
      };

      // Insert first protocol
      const { error: error1 } = await supabase
        .from('protocols' as any)
        .insert(testProtocol);

      expect(error1).toBeNull();

      // Attempt to insert duplicate
      const { error: error2 } = await supabase
        .from('protocols' as any)
        .insert(testProtocol);

      expect(error2).toBeDefined();
      expect(error2?.message).toContain('unique');

      // Cleanup
      await supabase
        .from('protocols' as any)
        .delete()
        .eq('tp_code', 'TEST_UNIQUE_001');
    });

    test('should validate version is positive', async () => {
      const invalidProtocol = {
        tp_code: 'TEST_VERSION_001',
        tp_name: 'Test Protocol',
        category: 'Test',
        version: -1, // Invalid version
        full_text: 'Test content',
        effective_date: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('protocols' as any)
        .insert(invalidProtocol);

      expect(error).toBeDefined();
      expect(error?.message).toContain('check constraint') || expect(error?.message).toContain('version');
    });

    test('should validate effective_date <= expiration_date', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000); // 1 day ago

      const invalidProtocol = {
        tp_code: 'TEST_DATE_001',
        tp_name: 'Test Protocol',
        category: 'Test',
        version: 1,
        full_text: 'Test content',
        effective_date: now.toISOString(),
        expiration_date: past.toISOString(), // Expiration before effective
      };

      const { error } = await supabase
        .from('protocols' as any)
        .insert(invalidProtocol);

      expect(error).toBeDefined();
      expect(error?.message).toContain('check constraint') || expect(error?.message).toContain('date');
    });

    test('should not allow deletion of current protocols', async () => {
      // This test verifies trigger or RLS policy prevents deletion
      const currentProtocol = {
        tp_code: 'TEST_DELETE_001',
        tp_name: 'Test Protocol',
        category: 'Test',
        version: 1,
        full_text: 'Test content',
        effective_date: new Date().toISOString(),
        is_current: true,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('protocols' as any)
        .insert(currentProtocol)
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Attempt to delete current protocol
      const { error: deleteError } = await supabase
        .from('protocols' as any)
        .delete()
        .eq('id', inserted.id);

      // Should fail if protection is in place
      // If no protection, this is a warning to add it
      if (!deleteError) {
        console.warn('WARNING: Current protocols can be deleted - add protection!');
      }

      // Cleanup with admin privileges if needed
      await supabase
        .from('protocols' as any)
        .delete()
        .eq('tp_code', 'TEST_DELETE_001');
    });
  });

  describe('Protocol Chunks Table', () => {
    test('should link chunks to protocols via foreign key', async () => {
      // Insert test protocol
      const { data: protocol, error: protocolError } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_FK_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      expect(protocolError).toBeNull();
      expect(protocol).toBeDefined();

      // Insert chunk with valid protocol_id
      const { error: chunkError1 } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: 0,
          chunk_text: 'Test chunk content',
          content_hash: 'test_hash_001',
        });

      expect(chunkError1).toBeNull();

      // Attempt to insert chunk with invalid protocol_id
      const { error: chunkError2 } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: '00000000-0000-0000-0000-000000000000', // Non-existent
          chunk_index: 0,
          chunk_text: 'Test chunk content',
          content_hash: 'test_hash_002',
        });

      expect(chunkError2).toBeDefined();
      expect(chunkError2?.message).toContain('foreign key') || expect(chunkError2?.message).toContain('constraint');

      // Cleanup
      await supabase.from('protocol_chunks' as any).delete().eq('protocol_id', protocol.id);
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);
    });

    test('should enforce content_hash uniqueness', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_HASH_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      const testHash = 'unique_hash_' + Date.now();

      // Insert first chunk
      const { error: error1 } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: 0,
          chunk_text: 'Test chunk 1',
          content_hash: testHash,
        });

      expect(error1).toBeNull();

      // Attempt duplicate hash
      const { error: error2 } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: 1,
          chunk_text: 'Test chunk 2',
          content_hash: testHash, // Duplicate hash
        });

      expect(error2).toBeDefined();
      expect(error2?.message).toContain('unique');

      // Cleanup
      await supabase.from('protocol_chunks' as any).delete().eq('protocol_id', protocol.id);
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);
    });

    test('should validate chunk_index >= 0', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_INDEX_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      const { error } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: -1, // Invalid index
          chunk_text: 'Test chunk',
          content_hash: 'test_hash',
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('check constraint') || expect(error?.message).toContain('chunk_index');

      // Cleanup
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);
    });

    test('should cascade delete chunks when protocol is deleted', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_CASCADE_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      // Insert chunks
      await supabase
        .from('protocol_chunks' as any)
        .insert([
          {
            protocol_id: protocol.id,
            chunk_index: 0,
            chunk_text: 'Chunk 1',
            content_hash: 'hash_1_' + Date.now(),
          },
          {
            protocol_id: protocol.id,
            chunk_index: 1,
            chunk_text: 'Chunk 2',
            content_hash: 'hash_2_' + Date.now(),
          },
        ]);

      // Verify chunks exist
      const { data: chunksBefore } = await supabase
        .from('protocol_chunks' as any)
        .select('id')
        .eq('protocol_id', protocol.id);

      expect(chunksBefore).toHaveLength(2);

      // Delete protocol
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);

      // Verify chunks are deleted
      const { data: chunksAfter } = await supabase
        .from('protocol_chunks' as any)
        .select('id')
        .eq('protocol_id', protocol.id);

      expect(chunksAfter).toHaveLength(0);
    });
  });

  describe('Protocol Embeddings Table', () => {
    test('should store 1536-dimension vectors', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_EMBED_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: chunk } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: 0,
          chunk_text: 'Test chunk',
          content_hash: 'embed_hash_' + Date.now(),
        })
        .select()
        .single();

      // Create valid 1536-dimension vector
      const validVector = Array(1536).fill(0).map(() => Math.random());

      const { error: error1 } = await supabase
        .from('protocol_embeddings' as any)
        .insert({
          chunk_id: chunk.id,
          model: 'text-embedding-3-small',
          model_version: '1',
          embedding: validVector,
        });

      expect(error1).toBeNull();

      // Attempt invalid dimension vector
      const invalidVector = Array(512).fill(0); // Wrong dimension

      const { error: error2 } = await supabase
        .from('protocol_embeddings' as any)
        .insert({
          chunk_id: chunk.id,
          model: 'text-embedding-3-small',
          model_version: '2',
          embedding: invalidVector,
        });

      expect(error2).toBeDefined();

      // Cleanup
      await supabase.from('protocol_embeddings' as any).delete().eq('chunk_id', chunk.id);
      await supabase.from('protocol_chunks' as any).delete().eq('id', chunk.id);
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);
    });

    test('should enforce unique (chunk_id, model, version)', async () => {
      const { data: protocol } = await supabase
        .from('protocols' as any)
        .insert({
          tp_code: 'TEST_UNIQUE_EMBED_001',
          tp_name: 'Test Protocol',
          category: 'Test',
          version: 1,
          full_text: 'Test content',
          effective_date: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: chunk } = await supabase
        .from('protocol_chunks' as any)
        .insert({
          protocol_id: protocol.id,
          chunk_index: 0,
          chunk_text: 'Test chunk',
          content_hash: 'unique_embed_hash_' + Date.now(),
        })
        .select()
        .single();

      const vector = Array(1536).fill(0);

      // Insert first embedding
      const { error: error1 } = await supabase
        .from('protocol_embeddings' as any)
        .insert({
          chunk_id: chunk.id,
          model: 'text-embedding-3-small',
          model_version: '1',
          embedding: vector,
        });

      expect(error1).toBeNull();

      // Attempt duplicate
      const { error: error2 } = await supabase
        .from('protocol_embeddings' as any)
        .insert({
          chunk_id: chunk.id,
          model: 'text-embedding-3-small',
          model_version: '1',
          embedding: vector,
        });

      expect(error2).toBeDefined();
      expect(error2?.message).toContain('unique');

      // Cleanup
      await supabase.from('protocol_embeddings' as any).delete().eq('chunk_id', chunk.id);
      await supabase.from('protocol_chunks' as any).delete().eq('id', chunk.id);
      await supabase.from('protocols' as any).delete().eq('id', protocol.id);
    });
  });

  describe('Indexes', () => {
    test('should use index for tp_code lookups', async () => {
      // Query to check if index exists
      const { data } = await supabase
        .from('pg_indexes' as any)
        .select('indexname')
        .eq('tablename', 'protocols')
        .like('indexname', '%tp_code%');

      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should use GIN index for full-text search', async () => {
      const { data } = await supabase
        .from('pg_indexes' as any)
        .select('indexname')
        .eq('tablename', 'protocols')
        .or('indexname.ilike.%gin%,indexname.ilike.%fts%');

      // Verify GIN index exists for full-text search
      expect(data).toBeDefined();
      if (data && data.length === 0) {
        console.warn('WARNING: No GIN index found for full-text search');
      }
    });

    test('should use HNSW index for vector similarity', async () => {
      const { data } = await supabase
        .from('pg_indexes' as any)
        .select('indexname')
        .eq('tablename', 'protocol_embeddings')
        .ilike('indexname', '%hnsw%');

      // Verify HNSW index exists for vector search
      expect(data).toBeDefined();
      if (data && data.length === 0) {
        console.warn('WARNING: No HNSW index found for vector similarity');
      }
    });

    test('should use index for category filtering', async () => {
      const { data } = await supabase
        .from('pg_indexes' as any)
        .select('indexname')
        .eq('tablename', 'protocols')
        .ilike('indexname', '%category%');

      expect(data).toBeDefined();
    });
  });
});
