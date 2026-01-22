/**
 * Backfill script for existing agencies in manus_agencies table
 *
 * This script:
 * 1. Classifies existing agencies by name patterns into agency_type
 * 2. Sets call_volume_tier based on protocol_count percentiles
 * 3. Marks all as is_verified = false for later verification
 *
 * Run: npx tsx scripts/backfill-agency-types.ts
 */

import "./load-env.js";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Agency type classification patterns
type AgencyType =
  | "911_transport"
  | "911_non_transport"
  | "air_medical"
  | "dispatch"
  | "specialty"
  | "regional_council"
  | "state_office"
  | "hospital_based"
  | "tribal"
  | "unknown";

interface ClassificationPattern {
  type: AgencyType;
  patterns: RegExp[];
}

const CLASSIFICATION_PATTERNS: ClassificationPattern[] = [
  // State offices (check first - most specific)
  {
    type: "state_office",
    patterns: [
      /state\s+(ems|emergency|health|department)/i,
      /department\s+of\s+health.*ems/i,
      /ems\s+(division|bureau|office|program)\s*$/i,
      /oems|oemsacs|bems|sems/i,
      /state\s+office/i,
    ],
  },
  // Regional councils / RETACs
  {
    type: "regional_council",
    patterns: [
      /retac|rtac/i,
      /regional\s+(ems|council|trauma)/i,
      /ems\s+(council|region|consortium)/i,
      /region\s+\d+|region\s+(i|ii|iii|iv|v|vi|one|two|three|four|five|six)/i,
      /lemsa|local\s+ems\s+agency/i,
      /medical\s+control\s+board/i,
      /healthcare\s+coalition/i,
    ],
  },
  // Air medical
  {
    type: "air_medical",
    patterns: [
      /air\s*(med|care|life|ambulance|rescue)/i,
      /lifeflight|life\s*flight/i,
      /helicopter|hems/i,
      /aeromedical|aero\s*medical/i,
      /flight\s+(for\s+life|paramedic|nurse|transport)/i,
      /wings|aviator|eagle.*medical/i,
      /med\s*evac|medevac/i,
      /starflight|careflite|stat\s*flight/i,
    ],
  },
  // Dispatch / PSAPs
  {
    type: "dispatch",
    patterns: [
      /dispatch|psap|911\s*center/i,
      /communications?\s*(center|division)/i,
      /metro\s*911/i,
      /emergency\s*communications/i,
    ],
  },
  // Specialty transport
  {
    type: "specialty",
    patterns: [
      /critical\s*care/i,
      /neonatal|pediatric\s*(transport|icu)/i,
      /interfacility|inter-facility/i,
      /mobile\s*icu/i,
      /specialty\s*(care|transport)/i,
    ],
  },
  // Hospital-based
  {
    type: "hospital_based",
    patterns: [
      /hospital.*ems|hospital.*ambulance/i,
      /medical\s*center\s*(ems|ambulance|transport)/i,
      /university\s*(health|hospital|medical).*ems/i,
      /health\s*system\s*ems/i,
      /clinic\s*ambulance/i,
      /healthcare.*ems/i,
      /\buh\s*ems\b|\buc\s*ems\b/i,
    ],
  },
  // Tribal
  {
    type: "tribal",
    patterns: [
      /tribal|tribe|nation\s*(ems|fire|rescue)/i,
      /indian\s*(health|ems)/i,
      /reservation\s*(ems|fire)/i,
      /navajo|cherokee|choctaw|sioux|apache/i,
    ],
  },
  // 911 non-transport (fire departments without transport)
  {
    type: "911_non_transport",
    patterns: [
      /fire\s*(department|rescue|protection|district)(?!.*transport|.*ambulance)/i,
      /volunteer\s*fire/i,
      /fire\s*&\s*rescue(?!.*ambulance)/i,
      /first\s*responder/i,
    ],
  },
  // 911 transport (default for ambulance services)
  {
    type: "911_transport",
    patterns: [
      /ambulance/i,
      /ems(?!\s*(council|region|division|office|bureau|program))/i,
      /paramedic/i,
      /county\s*ems|city\s*ems/i,
      /emergency\s*medical\s*service/i,
      /amr|acadian|ambucare|rural.*metro/i,
      /rescue\s*(squad|service)/i,
      /medic\s*(one|unit|\d)/i,
    ],
  },
];

/**
 * Classify an agency by name
 */
function classifyAgency(name: string): AgencyType {
  // Check each pattern group in order of specificity
  for (const { type, patterns } of CLASSIFICATION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return type;
      }
    }
  }
  return "unknown";
}

/**
 * Calculate call volume tier based on protocol count percentiles
 */
type CallVolumeTier = "high" | "mid" | "low" | "unknown";

function calculateCallVolumeTier(
  protocolCount: number,
  p80: number,
  p50: number
): CallVolumeTier {
  if (protocolCount === 0) return "unknown";
  if (protocolCount >= p80) return "high";
  if (protocolCount >= p50) return "mid";
  return "low";
}

interface Agency {
  id: number;
  name: string;
  protocol_count: number;
}

async function backfillAgencyTypes() {
  console.log("Starting agency type backfill...\n");

  // Step 1: Fetch all agencies
  const { data: agencies, error: fetchError } = await supabase
    .from("manus_agencies")
    .select("id, name, protocol_count")
    .order("id");

  if (fetchError) {
    console.error("Error fetching agencies:", fetchError);
    process.exit(1);
  }

  if (!agencies || agencies.length === 0) {
    console.log("No agencies found");
    process.exit(0);
  }

  console.log(`Found ${agencies.length} agencies to process\n`);

  // Step 2: Calculate protocol count percentiles for call volume tiers
  const protocolCounts = (agencies as Agency[])
    .map((a) => a.protocol_count || 0)
    .filter((c) => c > 0)
    .sort((a, b) => b - a);

  const p80Index = Math.floor(protocolCounts.length * 0.2);
  const p50Index = Math.floor(protocolCounts.length * 0.5);
  const p80 = protocolCounts[p80Index] || 100;
  const p50 = protocolCounts[p50Index] || 20;

  console.log(`Protocol count percentiles:`);
  console.log(`  P80 (top 20%): ${p80}+ protocols`);
  console.log(`  P50 (top 50%): ${p50}+ protocols\n`);

  // Step 3: Classify and update each agency
  const stats: Record<AgencyType, number> = {
    "911_transport": 0,
    "911_non_transport": 0,
    air_medical: 0,
    dispatch: 0,
    specialty: 0,
    regional_council: 0,
    state_office: 0,
    hospital_based: 0,
    tribal: 0,
    unknown: 0,
  };

  const tierStats: Record<CallVolumeTier, number> = {
    high: 0,
    mid: 0,
    low: 0,
    unknown: 0,
  };

  let updated = 0;
  let errors = 0;
  const batchSize = 100;

  for (let i = 0; i < agencies.length; i += batchSize) {
    const batch = agencies.slice(i, i + batchSize) as Agency[];

    const updates = batch.map((agency) => {
      const agencyType = classifyAgency(agency.name);
      const callVolumeTier = calculateCallVolumeTier(
        agency.protocol_count || 0,
        p80,
        p50
      );

      stats[agencyType]++;
      tierStats[callVolumeTier]++;

      return {
        id: agency.id,
        agency_type: agencyType,
        call_volume_tier: callVolumeTier,
        is_verified: false,
      };
    });

    // Update in batch using upsert
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("manus_agencies")
        .update({
          agency_type: update.agency_type,
          call_volume_tier: update.call_volume_tier,
          is_verified: update.is_verified,
        })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Error updating agency ${update.id}:`, updateError);
        errors++;
      } else {
        updated++;
      }
    }

    // Progress report
    const progress = Math.min(i + batchSize, agencies.length);
    process.stdout.write(
      `\rProcessed ${progress}/${agencies.length} agencies...`
    );
  }

  console.log("\n\n=== Backfill Complete ===\n");

  console.log("Agency Type Distribution:");
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const pct = ((count / agencies.length) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${pct}%)`);
    });

  console.log("\nCall Volume Tier Distribution:");
  Object.entries(tierStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tier, count]) => {
      const pct = ((count / agencies.length) * 100).toFixed(1);
      console.log(`  ${tier}: ${count} (${pct}%)`);
    });

  console.log(`\nUpdated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

// Run the backfill
backfillAgencyTypes()
  .then(() => {
    console.log("\nBackfill script complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
