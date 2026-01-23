/**
 * Netlify Edge Function: Geolocation Routing
 * Adds geolocation headers and routes to nearest edge
 */

import type { Context } from "@netlify/edge-functions";

// US State abbreviations from region codes
const REGION_TO_STATE: Record<string, string> = {
  // Netlify uses ISO 3166-2 region codes
  "US-AL": "AL", "US-AK": "AK", "US-AZ": "AZ", "US-AR": "AR", "US-CA": "CA",
  "US-CO": "CO", "US-CT": "CT", "US-DE": "DE", "US-FL": "FL", "US-GA": "GA",
  "US-HI": "HI", "US-ID": "ID", "US-IL": "IL", "US-IN": "IN", "US-IA": "IA",
  "US-KS": "KS", "US-KY": "KY", "US-LA": "LA", "US-ME": "ME", "US-MD": "MD",
  "US-MA": "MA", "US-MI": "MI", "US-MN": "MN", "US-MS": "MS", "US-MO": "MO",
  "US-MT": "MT", "US-NE": "NE", "US-NV": "NV", "US-NH": "NH", "US-NJ": "NJ",
  "US-NM": "NM", "US-NY": "NY", "US-NC": "NC", "US-ND": "ND", "US-OH": "OH",
  "US-OK": "OK", "US-OR": "OR", "US-PA": "PA", "US-RI": "RI", "US-SC": "SC",
  "US-SD": "SD", "US-TN": "TN", "US-TX": "TX", "US-UT": "UT", "US-VT": "VT",
  "US-VA": "VA", "US-WA": "WA", "US-WV": "WV", "US-WI": "WI", "US-WY": "WY",
  "US-DC": "DC",
};

export default async function handler(request: Request, context: Context) {
  // Get geolocation from Netlify context
  const geo = context.geo;

  // Build geo headers
  const geoHeaders: Record<string, string> = {};

  if (geo.country?.code) {
    geoHeaders["X-Geo-Country"] = geo.country.code;
  }

  if (geo.subdivision?.code) {
    geoHeaders["X-Geo-Region"] = geo.subdivision.code;

    // Convert to US state code if applicable
    const stateCode = REGION_TO_STATE[geo.subdivision.code];
    if (stateCode) {
      geoHeaders["X-Geo-State"] = stateCode;
    }
  }

  if (geo.city) {
    geoHeaders["X-Geo-City"] = geo.city;
  }

  if (geo.latitude && geo.longitude) {
    geoHeaders["X-Geo-Lat"] = geo.latitude.toString();
    geoHeaders["X-Geo-Lon"] = geo.longitude.toString();
  }

  if (geo.timezone) {
    geoHeaders["X-Geo-Timezone"] = geo.timezone;
  }

  // Forward request with geo headers
  const response = await context.next();

  // Add geo headers to response for client access
  const newHeaders = new Headers(response.headers);
  Object.entries(geoHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  // Also add to client-accessible header
  newHeaders.set("X-Geo-Data", JSON.stringify({
    country: geo.country?.code,
    region: geo.subdivision?.code,
    state: geoHeaders["X-Geo-State"] || null,
    city: geo.city,
    timezone: geo.timezone,
  }));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export const config = {
  path: ["/*"],
  excludedPath: ["/_next/*", "/static/*", "/*.ico", "/*.png", "/*.jpg"],
};
