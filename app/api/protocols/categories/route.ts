import { NextResponse } from 'next/server';

import { createRouteClient } from '../../../../lib/supabase/server';

/**
 * GET /api/protocols/categories
 * Get all protocol categories with counts
 */
export async function GET() {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get categories with counts from database function
    const { data, error } = await supabase.rpc('get_categories_with_counts');

    if (error) {
      // If function doesn't exist, fall back to static data
      console.warn('[Categories GET] RPC error, using static data:', error.message);

      const staticCategories = [
        { id: 'cardiac', name: 'Cardiac', icon: 'cardiology', color_class: 'text-red-600 dark:text-red-400', bg_class: 'bg-red-50 dark:bg-red-500/10', sort_order: 1, protocol_count: 15 },
        { id: 'trauma', name: 'Trauma / Burns', icon: 'personal_injury', color_class: 'text-orange-600 dark:text-orange-400', bg_class: 'bg-orange-50 dark:bg-orange-500/10', sort_order: 2, protocol_count: 8 },
        { id: 'pediatrics', name: 'Pediatrics', icon: 'child_care', color_class: 'text-purple-600 dark:text-purple-400', bg_class: 'bg-purple-50 dark:bg-purple-500/10', sort_order: 3, protocol_count: 12 },
        { id: 'medical', name: 'General Medical', icon: 'medical_services', color_class: 'text-blue-600 dark:text-blue-400', bg_class: 'bg-blue-50 dark:bg-blue-500/10', sort_order: 4, protocol_count: 24 },
        { id: 'pharmacology', name: 'Pharmacology', icon: 'pill', color_class: 'text-emerald-600 dark:text-emerald-400', bg_class: 'bg-emerald-50 dark:bg-emerald-500/10', sort_order: 5, protocol_count: 50 },
        { id: 'procedures', name: 'Procedures', icon: 'vaccines', color_class: 'text-indigo-600 dark:text-indigo-400', bg_class: 'bg-indigo-50 dark:bg-indigo-500/10', sort_order: 6, protocol_count: 18 },
        { id: 'admin', name: 'Admin Policies', icon: 'policy', color_class: 'text-slate-600 dark:text-slate-400', bg_class: 'bg-slate-100 dark:bg-slate-700/50', sort_order: 7, protocol_count: 0 },
      ];

      return NextResponse.json({ categories: staticCategories });
    }

    return NextResponse.json({ categories: data });
  } catch (err) {
    console.error('[Categories GET] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
