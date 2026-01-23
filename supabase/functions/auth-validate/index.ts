/**
 * Auth Validate Edge Function
 * Validates JWT tokens at the edge for faster auth checks
 *
 * Expected latency: 10-50ms (vs 200-400ms from origin)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAndGetUser, supabaseAdmin } from "../_shared/supabase.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface ValidateResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  tier?: string;
  subscribedStates?: string[];
  subscribedAgencies?: number[];
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Extract Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Missing or invalid authorization header", 401, req);
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token and get user
    const { user, error } = await verifyAndGetUser(token);

    if (error || !user) {
      return jsonResponse({ valid: false, error: error || "Invalid token" }, 401, req);
    }

    // Get user metadata from our database for tier/subscriptions
    // This uses the service role to bypass RLS
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("id, tier, email")
      .eq("supabase_id", user.id)
      .single();

    if (dbError) {
      console.error("[AuthValidate] DB error:", dbError);
      // Still valid auth, just missing extended data
      return jsonResponse({
        valid: true,
        userId: user.id,
        email: user.email,
        tier: "free",
      } satisfies ValidateResponse, 200, req);
    }

    // Get user's subscribed states
    const { data: stateData } = await supabaseAdmin
      .from("user_states")
      .select("state_code")
      .eq("user_id", userData.id)
      .or("expires_at.is.null,expires_at.gt.now()");

    // Get user's subscribed agencies
    const { data: agencyData } = await supabaseAdmin
      .from("user_agencies")
      .select("agency_id")
      .eq("user_id", userData.id)
      .or("expires_at.is.null,expires_at.gt.now()");

    const response: ValidateResponse = {
      valid: true,
      userId: user.id,
      email: userData.email,
      tier: userData.tier,
      subscribedStates: stateData?.map((s) => s.state_code) || [],
      subscribedAgencies: agencyData?.map((a) => a.agency_id) || [],
    };

    return jsonResponse(response, 200, req);
  } catch (error) {
    console.error("[AuthValidate] Error:", error);
    return errorResponse("Internal server error", 500, req);
  }
});
