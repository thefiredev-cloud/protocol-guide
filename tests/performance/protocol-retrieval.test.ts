/**
 * Protocol Retrieval Performance Tests
 * Validates query performance meets field requirements
 */

import { beforeAll,describe, expect, test } from 'vitest';

import { buildContext, initializeKnowledgeBase,searchKB } from '@/lib/retrieval';

describe('Protocol Retrieval Performance', () => {
  beforeAll(async () => {
    // Initialize knowledge base before tests
    await initializeKnowledgeBase();
  });

  describe('Single Query Performance', () => {
    test('should complete search in <100ms', async () => {
      const start = Date.now();
      const results = await searchKB('cardiac chest pain', 6);
      const duration = Date.now() - start;

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);

      console.log(`✓ Search completed in ${duration}ms`);
    });

    test('should build context in <150ms', async () => {
      const start = Date.now();
      const context = await buildContext('cardiac chest pain', 6);
      const duration = Date.now() - start;

      expect(context).toBeDefined();
      expect(context.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(150);

      console.log(`✓ Context built in ${duration}ms`);
    });

    test('should handle typo queries efficiently', async () => {
      const start = Date.now();
      const results = await searchKB('seisure', 6); // typo: seizure
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);

      console.log(`✓ Fuzzy search completed in ${duration}ms`);
    });

    test('should handle vague queries efficiently', async () => {
      const start = Date.now();
      const results = await searchKB('pain', 6);
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);

      console.log(`✓ Vague query handled in ${duration}ms`);
    });
  });

  describe('Concurrent Request Performance', () => {
    test('should handle 10 concurrent requests', async () => {
      const queries = [
        'cardiac arrest',
        'stroke',
        'seizure',
        'trauma',
        'chest pain',
        'shortness of breath',
        'altered mental status',
        'allergic reaction',
        'diabetic emergency',
        'overdose',
      ];

      const start = Date.now();

      const results = await Promise.all(
        queries.map(query => searchKB(query, 6))
      );

      const duration = Date.now() - start;
      const avgTime = duration / queries.length;

      expect(results.length).toBe(queries.length);
      results.forEach(result => {
        expect(result.length).toBeGreaterThan(0);
      });

      expect(avgTime).toBeLessThan(150);

      console.log(`✓ ${queries.length} concurrent queries: ${duration}ms total, ${avgTime.toFixed(1)}ms avg`);
    });

    test('should handle 50 concurrent requests without degradation', async () => {
      const queries = Array(50).fill('cardiac arrest');

      const start = Date.now();

      const results = await Promise.all(
        queries.map(query => searchKB(query, 6))
      );

      const duration = Date.now() - start;
      const avgTime = duration / queries.length;

      expect(results.length).toBe(50);
      expect(avgTime).toBeLessThan(200);

      console.log(`✓ 50 concurrent queries: ${duration}ms total, ${avgTime.toFixed(1)}ms avg`);
    });

    test('should handle burst traffic pattern', async () => {
      // Simulate multiple firefighters accessing simultaneously
      const burst1 = Array(20).fill('chest pain');
      const burst2 = Array(20).fill('difficulty breathing');
      const burst3 = Array(20).fill('trauma');

      const start = Date.now();

      await Promise.all([
        ...burst1.map(q => searchKB(q, 6)),
        ...burst2.map(q => searchKB(q, 6)),
        ...burst3.map(q => searchKB(q, 6)),
      ]);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`✓ 60 burst requests completed in ${duration}ms`);
    });
  });

  describe('Memory Efficiency', () => {
    test('should not leak memory on repeated queries', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Run 100 queries
      for (let i = 0; i < 100; i++) {
        await searchKB('cardiac arrest', 6);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Memory increase should be minimal (<50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);

      console.log(`✓ Memory increase: ${memoryIncreaseMB.toFixed(2)}MB after 100 queries`);
    });

    test('should handle large result sets efficiently', async () => {
      const start = Date.now();

      // Query that might return many results
      const results = await searchKB('protocol', 20);

      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200);

      console.log(`✓ Large result set (${results.length} items) retrieved in ${duration}ms`);
    });
  });

  describe('Query Complexity Performance', () => {
    test('should handle single word queries quickly', async () => {
      const queries = ['cardiac', 'stroke', 'seizure', 'trauma', 'overdose'];

      for (const query of queries) {
        const start = Date.now();
        const results = await searchKB(query, 6);
        const duration = Date.now() - start;

        expect(results.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(80);
      }
    });

    test('should handle multi-word queries efficiently', async () => {
      const queries = [
        'cardiac chest pain',
        'shortness of breath',
        'altered mental status',
        'motor vehicle collision',
      ];

      for (const query of queries) {
        const start = Date.now();
        const results = await searchKB(query, 6);
        const duration = Date.now() - start;

        expect(results.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(100);
      }
    });

    test('should handle complex medical terminology', async () => {
      const queries = [
        'myocardial infarction',
        'cerebrovascular accident',
        'status epilepticus',
      ];

      for (const query of queries) {
        const start = Date.now();
        const results = await searchKB(query, 6);
        const duration = Date.now() - start;

        expect(results.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(100);
      }
    });

    test('should handle queries with protocol numbers', async () => {
      const queries = [
        'protocol 1210',
        'TP 1211',
        'MCG 1309',
      ];

      for (const query of queries) {
        const start = Date.now();
        const results = await searchKB(query, 6);
        const duration = Date.now() - start;

        expect(results.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(80);
      }
    });
  });

  describe('Index Performance', () => {
    test('should demonstrate index effectiveness', async () => {
      const commonQueries = [
        'cardiac',
        'respiratory',
        'trauma',
        'neurological',
      ];

      const timings: number[] = [];

      for (const query of commonQueries) {
        const start = Date.now();
        await searchKB(query, 6);
        const duration = Date.now() - start;
        timings.push(duration);
      }

      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTiming = Math.max(...timings);

      // All queries should be consistently fast
      expect(avgTiming).toBeLessThan(100);
      expect(maxTiming).toBeLessThan(150);

      console.log(`✓ Index performance: avg ${avgTiming.toFixed(1)}ms, max ${maxTiming}ms`);
    });
  });

  describe('Real-World Usage Patterns', () => {
    test('should handle typical field usage pattern', async () => {
      // Simulate real usage: search, then get details, then search related
      const start = Date.now();

      // Initial search
      const results1 = await searchKB('chest pain', 6);
      expect(results1.length).toBeGreaterThan(0);

      // Related search
      const results2 = await searchKB('nitroglycerin', 6);
      expect(results2.length).toBeGreaterThan(0);

      // Context building
      const context = await buildContext('cardiac chest pain', 6);
      expect(context.length).toBeGreaterThan(0);

      const totalDuration = Date.now() - start;

      // Complete workflow should be fast
      expect(totalDuration).toBeLessThan(500);

      console.log(`✓ Complete workflow: ${totalDuration}ms`);
    });

    test('should handle protocol lookup followed by medication search', async () => {
      const start = Date.now();

      await searchKB('cardiac arrest', 6);
      await searchKB('epinephrine dose', 6);
      await searchKB('amiodarone', 6);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(300);

      console.log(`✓ Multi-step protocol lookup: ${duration}ms`);
    });
  });

  describe('Stress Testing', () => {
    test('should maintain performance under sustained load', async () => {
      const iterations = 50;
      const timings: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await searchKB('cardiac arrest', 6);
        const duration = Date.now() - start;
        timings.push(duration);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTime = Math.max(...timings);
      const minTime = Math.min(...timings);

      // Performance should remain consistent
      expect(avgTime).toBeLessThan(150);
      expect(maxTime).toBeLessThan(300); // Even worst case should be reasonable

      console.log(`✓ Sustained load (${iterations} requests): avg ${avgTime.toFixed(1)}ms, min ${minTime}ms, max ${maxTime}ms`);
    });
  });
});
