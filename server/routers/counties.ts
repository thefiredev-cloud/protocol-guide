/**
 * Counties Router
 * Handles county listing and retrieval procedures
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, publicRateLimitedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const countiesRouter = router({
  // Rate limited to prevent abuse and scraping of county data
  list: publicRateLimitedProcedure.query(async () => {
    try {
      const counties = await db.getAllCounties();
      // Handle empty/null case
      if (!counties || counties.length === 0) {
        return { counties: [], grouped: {} };
      }
      // Group by state
      const grouped: Record<string, typeof counties> = {};
      for (const county of counties) {
        if (!grouped[county.state]) {
          grouped[county.state] = [];
        }
        grouped[county.state].push(county);
      }
      return { counties, grouped };
    } catch (error) {
      console.error('[Counties] list error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch counties',
        cause: error,
      });
    }
  }),

  // Rate limited to prevent scraping individual county records
  get: publicRateLimitedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const county = await db.getCountyById(input.id);
        if (!county) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'County not found',
          });
        }
        return county;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Counties] get error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch county',
          cause: error,
        });
      }
    }),
});

export type CountiesRouter = typeof countiesRouter;
