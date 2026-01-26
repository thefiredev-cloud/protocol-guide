/**
 * US State Name <-> Code conversion utilities
 * Used for normalizing state filters in search queries
 */

export const STATE_NAME_TO_CODE: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC',
};

// Reverse mapping: code -> full name
export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => [code, name])
);

/**
 * Convert a state name or code to a 2-letter state code
 * Handles both full names ("California") and codes ("CA")
 * Returns null if not a valid US state
 */
export function toStateCode(input: string): string | null {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  // Already a 2-letter code?
  if (trimmed.length === 2) {
    const upper = trimmed.toUpperCase();
    // Validate it's a real state code
    if (STATE_CODE_TO_NAME[upper]) {
      return upper;
    }
  }
  
  // Try full state name (case-insensitive)
  const normalized = trimmed.toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (name.toLowerCase() === normalized) {
      return code;
    }
  }
  
  return null;
}

/**
 * Convert a state code to full state name
 */
export function toStateName(code: string): string | null {
  if (!code) return null;
  return STATE_CODE_TO_NAME[code.toUpperCase()] || null;
}
