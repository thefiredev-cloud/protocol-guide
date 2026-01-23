/**
 * Agency Suggest Edge Function
 * Suggests agencies based on geolocation
 *
 * Expected latency: 30-60ms (vs 150-250ms from origin)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { cacheGet, cacheSet } from "../_shared/redis.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

// US State code to name mapping
const STATE_CODES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

interface AgencySuggestion {
  id: number;
  name: string;
  state_code: string;
  agency_type: string;
  protocol_count: number;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get geolocation from headers (set by CDN/edge)
    const cfCountry = req.headers.get("cf-ipcountry");
    const cfRegion = req.headers.get("cf-region"); // State/province code
    const cfCity = req.headers.get("cf-ipcity");

    // Also accept explicit query params
    const url = new URL(req.url);
    const stateParam = url.searchParams.get("state")?.toUpperCase();
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

    // Determine state to use
    let stateCode = stateParam || cfRegion?.toUpperCase();

    // Validate state code
    if (stateCode && !STATE_CODES[stateCode]) {
      stateCode = undefined;
    }

    // If no valid state, return top agencies overall
    if (!stateCode) {
      // Check cache
      const cacheKey = "agencies:top";
      const cached = await cacheGet<AgencySuggestion[]>(cacheKey);
      if (cached) {
        return jsonResponse({
          suggestions: cached.slice(0, limit),
          source: "cache",
          detected_state: null,
        }, 200, req);
      }

      // Get top agencies by protocol count
      const { data, error } = await supabaseAdmin
        .from("manus_agencies")
        .select("id, name, state_code, agency_type")
        .order("id")
        .limit(50);

      if (error) {
        console.error("[AgencySuggest] Query error:", error);
        return errorResponse("Failed to fetch agencies", 500, req);
      }

      // Cache for 1 hour
      await cacheSet(cacheKey, data, 3600);

      return jsonResponse({
        suggestions: data?.slice(0, limit) || [],
        source: "database",
        detected_state: null,
        detected_country: cfCountry,
      }, 200, req);
    }

    // Check cache for state
    const cacheKey = `agencies:state:${stateCode}`;
    const cached = await cacheGet<AgencySuggestion[]>(cacheKey);
    if (cached) {
      return jsonResponse({
        suggestions: cached.slice(0, limit),
        source: "cache",
        detected_state: stateCode,
        state_name: STATE_CODES[stateCode],
      }, 200, req);
    }

    // Query agencies for this state
    const { data, error } = await supabaseAdmin
      .from("manus_agencies")
      .select("id, name, state_code, agency_type")
      .eq("state_code", stateCode)
      .order("name")
      .limit(50);

    if (error) {
      console.error("[AgencySuggest] Query error:", error);
      return errorResponse("Failed to fetch agencies", 500, req);
    }

    // If no agencies in state, get nearby states or national
    if (!data || data.length === 0) {
      // Fall back to state office protocols (available to everyone)
      const { data: stateOffices } = await supabaseAdmin
        .from("manus_agencies")
        .select("id, name, state_code, agency_type")
        .eq("agency_type", "state_office")
        .limit(limit);

      return jsonResponse({
        suggestions: stateOffices || [],
        source: "fallback",
        detected_state: stateCode,
        state_name: STATE_CODES[stateCode],
        message: `No local agencies found in ${STATE_CODES[stateCode]}. Showing state-level protocols.`,
      }, 200, req);
    }

    // Cache for 1 hour
    await cacheSet(cacheKey, data, 3600);

    return jsonResponse({
      suggestions: data.slice(0, limit),
      source: "database",
      detected_state: stateCode,
      state_name: STATE_CODES[stateCode],
      detected_city: cfCity,
    }, 200, req);
  } catch (error) {
    console.error("[AgencySuggest] Error:", error);
    return errorResponse("Internal server error", 500, req);
  }
});
