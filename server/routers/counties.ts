/**
 * Counties Router
 * Handles county listing and retrieval procedures
 */

import { z } from "zod";
import { publicProcedure, publicRateLimitedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const countiesRouter = router({
  // Rate limited to prevent abuse and scraping of county data
  list: publicRateLimitedProcedure.query(async () => {
    const counties = await db.getAllCounties();
    // Group by state
    const grouped: Record<string, typeof counties> = {};
    for (const county of counties) {
      if (!grouped[county.state]) {
        grouped[county.state] = [];
      }
      grouped[county.state].push(county);
    }
    return { counties, grouped };
  }),

  // Rate limited to prevent scraping individual county records
  get: publicRateLimitedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getCountyById(input.id);
    }),
});

export type CountiesRouter = typeof countiesRouter;
