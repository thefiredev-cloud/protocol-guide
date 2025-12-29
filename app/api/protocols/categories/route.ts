/**
 * Protocol Categories API
 * GET /api/protocols/categories - Get all categories with counts
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../lib/api/handler';

// Static categories matching UI design
const STATIC_CATEGORIES = [
  { id: 'cardiac', name: 'Cardiac', icon: 'cardiology', colorClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-500/10', sortOrder: 1, protocolCount: 15 },
  { id: 'trauma', name: 'Trauma / Burns', icon: 'personal_injury', colorClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-500/10', sortOrder: 2, protocolCount: 8 },
  { id: 'pediatrics', name: 'Pediatrics', icon: 'child_care', colorClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-50 dark:bg-purple-500/10', sortOrder: 3, protocolCount: 12 },
  { id: 'medical', name: 'General Medical', icon: 'medical_services', colorClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-500/10', sortOrder: 4, protocolCount: 24 },
  { id: 'pharmacology', name: 'Pharmacology', icon: 'pill', colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10', sortOrder: 5, protocolCount: 50 },
  { id: 'procedures', name: 'Procedures', icon: 'vaccines', colorClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-50 dark:bg-indigo-500/10', sortOrder: 6, protocolCount: 18 },
  { id: 'admin', name: 'Admin Policies', icon: 'policy', colorClass: 'text-slate-600 dark:text-slate-400', bgClass: 'bg-slate-100 dark:bg-slate-700/50', sortOrder: 7, protocolCount: 0 },
];

/**
 * GET /api/protocols/categories
 * Get all protocol categories with counts
 */
export const GET = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    void input;
    void req;
    // Return static categories - will be dynamic once migration is applied
    return NextResponse.json({ categories: STATIC_CATEGORIES });
  },
  { loggerName: 'api.protocols.categories' }
);
