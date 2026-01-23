/**
 * Vitest Bench - Continuous Performance Tracking
 *
 * Run with: pnpm bench
 *
 * These benchmarks run in vitest bench mode and output
 * performance metrics for CI/CD tracking.
 */

import { bench, describe } from "vitest";
import "../../scripts/load-env.js";
import { semanticSearchProtocols, embeddingCache } from "../../server/_core/embeddings";

describe("Search Performance Benchmarks", () => {
  bench(
    "simple search - cardiac arrest",
    async () => {
      await semanticSearchProtocols({
        query: "cardiac arrest",
        limit: 10,
        threshold: 0.3,
      });
    },
    { time: 10000, iterations: 5 }
  );

  bench(
    "complex search - natural language",
    async () => {
      await semanticSearchProtocols({
        query: "what do I do for a patient having a heart attack",
        limit: 10,
        threshold: 0.3,
      });
    },
    { time: 10000, iterations: 5 }
  );

  bench(
    "state-filtered search - California",
    async () => {
      await semanticSearchProtocols({
        query: "stroke protocol",
        stateCode: "CA",
        limit: 10,
        threshold: 0.3,
      });
    },
    { time: 10000, iterations: 5 }
  );

  bench(
    "protocol number search",
    async () => {
      await semanticSearchProtocols({
        query: "Ref 502",
        limit: 10,
        threshold: 0.3,
      });
    },
    { time: 10000, iterations: 5 }
  );
});
