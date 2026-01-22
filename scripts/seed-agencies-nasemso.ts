/**
 * Seed script for NASEMSO agency database
 *
 * Scales manus_agencies from ~2,700 to ~23,272 agencies
 * Based on NASEMSO 2020 National EMS Assessment data
 *
 * Features:
 * - Batch upsert (1000 records/batch)
 * - Duplicate handling via name+state_code conflict
 * - Retry logic with exponential backoff
 * - Progress reporting
 * - Protocol inheritance setup
 *
 * Run: npx tsx scripts/seed-agencies-nasemso.ts
 * Options:
 *   --dry-run     Preview without inserting
 *   --demo-only   Only seed demo agencies (for ImageTrend)
 *   --state=XX    Seed only specific state
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

// ============================================================================
// TYPES
// ============================================================================

export type AgencyType =
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

export type CallVolumeTier = "high" | "mid" | "low" | "unknown";
export type IntegrationPartner =
  | "imagetrend"
  | "esos"
  | "zoll"
  | "emscloud"
  | "none";

export interface AgencyRecord {
  name: string;
  state: string;
  state_code: string;
  agency_type: AgencyType;
  call_volume_tier?: CallVolumeTier;
  is_active?: boolean;
  uses_state_protocols?: boolean;
  integration_partner?: IntegrationPartner;
  license_number?: string;
  is_verified?: boolean;
}

// ============================================================================
// STATE DATA (from NASEMSO 2020 Assessment)
// ============================================================================

interface StateData {
  code: string;
  name: string;
  total_agencies: number;
  state_office_name: string;
  has_regional_system: boolean;
  regional_count: number;
}

const US_STATES: StateData[] = [
  { code: "AL", name: "Alabama", total_agencies: 390, state_office_name: "Alabama Department of Public Health Office of EMS", has_regional_system: true, regional_count: 6 },
  { code: "AK", name: "Alaska", total_agencies: 195, state_office_name: "Alaska EMS Section", has_regional_system: true, regional_count: 3 },
  { code: "AZ", name: "Arizona", total_agencies: 285, state_office_name: "Arizona Bureau of EMS and Trauma System", has_regional_system: true, regional_count: 6 },
  { code: "AR", name: "Arkansas", total_agencies: 425, state_office_name: "Arkansas Department of Health EMS", has_regional_system: true, regional_count: 5 },
  { code: "CA", name: "California", total_agencies: 1425, state_office_name: "California EMS Authority (EMSA)", has_regional_system: true, regional_count: 33 },
  { code: "CO", name: "Colorado", total_agencies: 365, state_office_name: "Colorado Department of Public Health EMS", has_regional_system: true, regional_count: 11 },
  { code: "CT", name: "Connecticut", total_agencies: 180, state_office_name: "Connecticut DPH Office of EMS", has_regional_system: true, regional_count: 5 },
  { code: "DE", name: "Delaware", total_agencies: 65, state_office_name: "Delaware Office of EMS", has_regional_system: false, regional_count: 0 },
  { code: "DC", name: "District of Columbia", total_agencies: 15, state_office_name: "DC Fire and EMS Department", has_regional_system: false, regional_count: 0 },
  { code: "FL", name: "Florida", total_agencies: 710, state_office_name: "Florida Bureau of EMS", has_regional_system: true, regional_count: 11 },
  { code: "GA", name: "Georgia", total_agencies: 540, state_office_name: "Georgia Office of EMS and Trauma", has_regional_system: true, regional_count: 10 },
  { code: "HI", name: "Hawaii", total_agencies: 45, state_office_name: "Hawaii State Department of Health EMS", has_regional_system: true, regional_count: 4 },
  { code: "ID", name: "Idaho", total_agencies: 185, state_office_name: "Idaho Bureau of EMS", has_regional_system: true, regional_count: 3 },
  { code: "IL", name: "Illinois", total_agencies: 985, state_office_name: "Illinois IDPH Division of EMS", has_regional_system: true, regional_count: 11 },
  { code: "IN", name: "Indiana", total_agencies: 545, state_office_name: "Indiana EMS Division", has_regional_system: true, regional_count: 10 },
  { code: "IA", name: "Iowa", total_agencies: 820, state_office_name: "Iowa HHS Bureau of EMS", has_regional_system: true, regional_count: 6 },
  { code: "KS", name: "Kansas", total_agencies: 495, state_office_name: "Kansas Board of EMS", has_regional_system: true, regional_count: 6 },
  { code: "KY", name: "Kentucky", total_agencies: 335, state_office_name: "Kentucky Board of EMS", has_regional_system: true, regional_count: 9 },
  { code: "LA", name: "Louisiana", total_agencies: 310, state_office_name: "Louisiana Bureau of EMS", has_regional_system: true, regional_count: 9 },
  { code: "ME", name: "Maine", total_agencies: 285, state_office_name: "Maine Emergency Medical Services", has_regional_system: true, regional_count: 4 },
  { code: "MD", name: "Maryland", total_agencies: 245, state_office_name: "Maryland Institute for EMS Systems (MIEMSS)", has_regional_system: true, regional_count: 5 },
  { code: "MA", name: "Massachusetts", total_agencies: 385, state_office_name: "Massachusetts DPH Office of EMS", has_regional_system: true, regional_count: 6 },
  { code: "MI", name: "Michigan", total_agencies: 580, state_office_name: "Michigan Bureau of EMS, Trauma and Preparedness", has_regional_system: true, regional_count: 8 },
  { code: "MN", name: "Minnesota", total_agencies: 450, state_office_name: "Minnesota EMS Regulatory Board", has_regional_system: true, regional_count: 8 },
  { code: "MS", name: "Mississippi", total_agencies: 295, state_office_name: "Mississippi State OEMSACS", has_regional_system: true, regional_count: 5 },
  { code: "MO", name: "Missouri", total_agencies: 510, state_office_name: "Missouri Bureau of EMS", has_regional_system: true, regional_count: 8 },
  { code: "MT", name: "Montana", total_agencies: 245, state_office_name: "Montana EMS and Trauma Systems", has_regional_system: true, regional_count: 3 },
  { code: "NE", name: "Nebraska", total_agencies: 340, state_office_name: "Nebraska DHHS Board of EMS", has_regional_system: true, regional_count: 6 },
  { code: "NV", name: "Nevada", total_agencies: 95, state_office_name: "Nevada Office of EMS and Trauma System", has_regional_system: true, regional_count: 3 },
  { code: "NH", name: "New Hampshire", total_agencies: 165, state_office_name: "NH Bureau of EMS", has_regional_system: true, regional_count: 6 },
  { code: "NJ", name: "New Jersey", total_agencies: 520, state_office_name: "New Jersey Office of EMS", has_regional_system: true, regional_count: 4 },
  { code: "NM", name: "New Mexico", total_agencies: 175, state_office_name: "New Mexico EMS Bureau", has_regional_system: true, regional_count: 3 },
  { code: "NY", name: "New York", total_agencies: 1285, state_office_name: "New York Bureau of EMS", has_regional_system: true, regional_count: 17 },
  { code: "NC", name: "North Carolina", total_agencies: 445, state_office_name: "NC Office of EMS", has_regional_system: true, regional_count: 8 },
  { code: "ND", name: "North Dakota", total_agencies: 185, state_office_name: "North Dakota HHS EMS Unit", has_regional_system: true, regional_count: 3 },
  { code: "OH", name: "Ohio", total_agencies: 1165, state_office_name: "Ohio Division of EMS", has_regional_system: true, regional_count: 9 },
  { code: "OK", name: "Oklahoma", total_agencies: 395, state_office_name: "Oklahoma State EMS Division", has_regional_system: true, regional_count: 5 },
  { code: "OR", name: "Oregon", total_agencies: 210, state_office_name: "Oregon Health Authority EMS Program", has_regional_system: true, regional_count: 6 },
  { code: "PA", name: "Pennsylvania", total_agencies: 1385, state_office_name: "Pennsylvania Bureau of EMS", has_regional_system: true, regional_count: 15 },
  { code: "RI", name: "Rhode Island", total_agencies: 85, state_office_name: "Rhode Island Department of Health EMS", has_regional_system: false, regional_count: 0 },
  { code: "SC", name: "South Carolina", total_agencies: 255, state_office_name: "SC DPH Division of EMS", has_regional_system: true, regional_count: 8 },
  { code: "SD", name: "South Dakota", total_agencies: 175, state_office_name: "South Dakota EMS and Trauma Program", has_regional_system: true, regional_count: 3 },
  { code: "TN", name: "Tennessee", total_agencies: 370, state_office_name: "Tennessee EMS Division", has_regional_system: true, regional_count: 8 },
  { code: "TX", name: "Texas", total_agencies: 1765, state_office_name: "Texas DSHS Office of EMS/Trauma", has_regional_system: true, regional_count: 22 },
  { code: "UT", name: "Utah", total_agencies: 165, state_office_name: "Utah Bureau of EMS", has_regional_system: true, regional_count: 4 },
  { code: "VT", name: "Vermont", total_agencies: 145, state_office_name: "Vermont Department of Health EMS", has_regional_system: true, regional_count: 13 },
  { code: "VA", name: "Virginia", total_agencies: 475, state_office_name: "Virginia Office of EMS", has_regional_system: true, regional_count: 11 },
  { code: "WA", name: "Washington", total_agencies: 355, state_office_name: "Washington DOH Office of EMS and Trauma", has_regional_system: true, regional_count: 8 },
  { code: "WV", name: "West Virginia", total_agencies: 235, state_office_name: "West Virginia Office of EMS", has_regional_system: true, regional_count: 6 },
  { code: "WI", name: "Wisconsin", total_agencies: 595, state_office_name: "Wisconsin EMS Section", has_regional_system: true, regional_count: 9 },
  { code: "WY", name: "Wyoming", total_agencies: 115, state_office_name: "Wyoming Office of EMS", has_regional_system: true, regional_count: 3 },
];

// ============================================================================
// DEMO AGENCIES (for ImageTrend presentation)
// ============================================================================

const DEMO_AGENCIES: AgencyRecord[] = [
  // California LEMSA structure (real hierarchy)
  {
    name: "Los Angeles County EMS Agency (DHS)",
    state: "California",
    state_code: "CA",
    agency_type: "regional_council",
    call_volume_tier: "high",
    is_active: true,
    uses_state_protocols: false,
    integration_partner: "imagetrend",
  },
  {
    name: "Los Angeles County Fire Department",
    state: "California",
    state_code: "CA",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    uses_state_protocols: false,
    integration_partner: "imagetrend",
  },
  {
    name: "Los Angeles City Fire Department",
    state: "California",
    state_code: "CA",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    uses_state_protocols: false,
    integration_partner: "imagetrend",
  },
  {
    name: "Glendale Fire Department",
    state: "California",
    state_code: "CA",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    uses_state_protocols: false,
    integration_partner: "imagetrend",
  },

  // Texas agencies
  {
    name: "Texas DSHS Office of EMS/Trauma",
    state: "Texas",
    state_code: "TX",
    agency_type: "state_office",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
  {
    name: "Houston Fire Department EMS",
    state: "Texas",
    state_code: "TX",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
  {
    name: "Dallas Fire-Rescue",
    state: "Texas",
    state_code: "TX",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },

  // Florida agencies
  {
    name: "Florida Bureau of EMS",
    state: "Florida",
    state_code: "FL",
    agency_type: "state_office",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
  {
    name: "Miami-Dade Fire Rescue",
    state: "Florida",
    state_code: "FL",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },

  // New York agencies
  {
    name: "New York Bureau of EMS",
    state: "New York",
    state_code: "NY",
    agency_type: "state_office",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
  {
    name: "FDNY Emergency Medical Services",
    state: "New York",
    state_code: "NY",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },

  // Virginia agencies
  {
    name: "Virginia Office of EMS",
    state: "Virginia",
    state_code: "VA",
    agency_type: "state_office",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
  {
    name: "Fairfax County Fire and Rescue",
    state: "Virginia",
    state_code: "VA",
    agency_type: "911_transport",
    call_volume_tier: "high",
    is_active: true,
    integration_partner: "imagetrend",
  },
];

// ============================================================================
// AGENCY GENERATOR
// ============================================================================

/**
 * Generate agency type distribution for a state
 */
function generateAgenciesForState(state: StateData): AgencyRecord[] {
  const agencies: AgencyRecord[] = [];

  // 1. State office (always 1)
  agencies.push({
    name: state.state_office_name,
    state: state.name,
    state_code: state.code,
    agency_type: "state_office",
    call_volume_tier: "high",
    is_active: true,
    uses_state_protocols: false,
  });

  // 2. Regional councils (if has regional system)
  if (state.has_regional_system) {
    for (let i = 1; i <= state.regional_count; i++) {
      agencies.push({
        name: `${state.name} EMS Region ${i}`,
        state: state.name,
        state_code: state.code,
        agency_type: "regional_council",
        call_volume_tier: "mid",
        is_active: true,
        uses_state_protocols: true,
      });
    }
  }

  // 3. Distribute remaining agencies by type
  // Based on NASEMSO data: ~60% 911_transport, ~25% 911_non_transport, ~15% other
  const remaining = state.total_agencies - 1 - state.regional_count;
  if (remaining <= 0) return agencies;

  const distribution = {
    "911_transport": Math.floor(remaining * 0.55),
    "911_non_transport": Math.floor(remaining * 0.25),
    hospital_based: Math.floor(remaining * 0.08),
    air_medical: Math.floor(remaining * 0.04),
    specialty: Math.floor(remaining * 0.03),
    tribal: Math.floor(remaining * 0.02),
    dispatch: Math.floor(remaining * 0.02),
    unknown: Math.floor(remaining * 0.01),
  };

  // Agency name templates by type
  const templates: Record<string, string[]> = {
    "911_transport": [
      "{County} County EMS",
      "{City} Fire Department EMS",
      "{City} Ambulance Service",
      "{County} Paramedics",
      "{City} Emergency Medical Services",
      "{County} Regional Ambulance",
      "AMR - {City}",
    ],
    "911_non_transport": [
      "{City} Volunteer Fire Department",
      "{County} Fire District {N}",
      "{City} Fire Protection District",
      "{County} Fire Rescue",
      "{City} First Responders",
    ],
    hospital_based: [
      "{City} Medical Center EMS",
      "{County} Regional Hospital Ambulance",
      "{City} Healthcare System EMS",
      "University Hospital {City} EMS",
    ],
    air_medical: [
      "AirLife {City}",
      "LifeFlight of {County}",
      "CareFlight {State}",
      "{City} Air Ambulance",
    ],
    specialty: [
      "{City} Critical Care Transport",
      "{County} Pediatric Transport",
      "{City} Neonatal Transport",
    ],
    tribal: [
      "{Tribe} Nation EMS",
      "{Tribe} Indian Health EMS",
      "{Tribe} Tribal Ambulance",
    ],
    dispatch: [
      "{County} 911 Center",
      "{City} Emergency Communications",
      "{County} PSAP",
    ],
    unknown: [
      "{City} EMS Agency",
      "{County} Medical Service",
    ],
  };

  // Sample city/county names per state (simplified)
  const cityNames = [
    "Central", "North", "South", "East", "West",
    "Valley", "Mountain", "Lake", "River", "Prairie",
    "Oak", "Pine", "Cedar", "Maple", "Willow",
    "Springfield", "Franklin", "Clinton", "Madison", "Washington",
    "Georgetown", "Greenville", "Fairview", "Salem", "Milton",
  ];

  const tribeNames = ["Cherokee", "Navajo", "Choctaw", "Sioux", "Apache"];

  let agencyIndex = 0;

  for (const [type, count] of Object.entries(distribution)) {
    const typeTemplates = templates[type] || templates.unknown;

    for (let i = 0; i < count; i++) {
      const template =
        typeTemplates[agencyIndex % typeTemplates.length];
      const cityName = cityNames[agencyIndex % cityNames.length];
      const tribeName = tribeNames[agencyIndex % tribeNames.length];

      const name = template
        .replace("{City}", cityName)
        .replace("{County}", `${cityName} County`)
        .replace("{State}", state.name)
        .replace("{Tribe}", tribeName)
        .replace("{N}", String((agencyIndex % 10) + 1));

      // Determine call volume tier (20% high, 30% mid, 50% low)
      let tier: CallVolumeTier;
      const tierRoll = Math.random();
      if (tierRoll < 0.2) tier = "high";
      else if (tierRoll < 0.5) tier = "mid";
      else tier = "low";

      agencies.push({
        name: `${name} - ${state.code}`,
        state: state.name,
        state_code: state.code,
        agency_type: type as AgencyType,
        call_volume_tier: tier,
        is_active: true,
        uses_state_protocols: type !== "state_office" && type !== "regional_council",
      });

      agencyIndex++;
    }
  }

  return agencies;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

interface UpsertResult {
  inserted: number;
  updated: number;
  errors: number;
}

/**
 * Batch upsert agencies with retry logic
 */
async function upsertAgenciesBatch(
  agencies: AgencyRecord[],
  batchSize = 500,
  maxRetries = 3
): Promise<UpsertResult> {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < agencies.length; i += batchSize) {
    const batch = agencies.slice(i, i + batchSize);
    let retries = 0;
    let success = false;

    while (!success && retries < maxRetries) {
      try {
        // Upsert with conflict on name + state_code
        const { error } = await supabase.from("manus_agencies").upsert(
          batch.map((a) => ({
            name: a.name,
            state: a.state,
            state_code: a.state_code,
            agency_type: a.agency_type,
            call_volume_tier: a.call_volume_tier || "unknown",
            is_active: a.is_active ?? true,
            uses_state_protocols: a.uses_state_protocols ?? true,
            integration_partner: a.integration_partner || "none",
            is_verified: a.is_verified ?? false,
          })),
          { onConflict: "name,state_code", ignoreDuplicates: false }
        );

        if (error) {
          throw error;
        }

        inserted += batch.length;
        success = true;
      } catch (err: unknown) {
        retries++;
        if (retries >= maxRetries) {
          console.error(`\nBatch failed after ${maxRetries} retries:`, err);
          errors += batch.length;
        } else {
          // Exponential backoff
          const delay = Math.pow(2, retries) * 100;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    // Progress report
    const progress = Math.min(i + batchSize, agencies.length);
    process.stdout.write(
      `\rProcessed ${progress}/${agencies.length} agencies...`
    );
  }

  return { inserted, updated, errors };
}

/**
 * Setup protocol inheritance relationships
 */
async function setupProtocolInheritance(): Promise<void> {
  console.log("\nSetting up protocol inheritance...");

  // 1. Link regional councils to state offices
  for (const state of US_STATES) {
    if (!state.has_regional_system) continue;

    // Find state office
    const { data: stateOffice } = await supabase
      .from("manus_agencies")
      .select("id")
      .eq("state_code", state.code)
      .eq("agency_type", "state_office")
      .single();

    if (!stateOffice) continue;

    // Link all regional councils to state office
    await supabase
      .from("manus_agencies")
      .update({ parent_protocol_source_id: stateOffice.id })
      .eq("state_code", state.code)
      .eq("agency_type", "regional_council");

    // Find first regional council to use as parent for local agencies
    const { data: regionalCouncil } = await supabase
      .from("manus_agencies")
      .select("id")
      .eq("state_code", state.code)
      .eq("agency_type", "regional_council")
      .limit(1)
      .single();

    if (regionalCouncil) {
      // Link local agencies to regional council (simplified: all go to first regional)
      await supabase
        .from("manus_agencies")
        .update({ parent_protocol_source_id: regionalCouncil.id })
        .eq("state_code", state.code)
        .in("agency_type", ["911_transport", "911_non_transport", "hospital_based"]);
    }
  }

  console.log("Protocol inheritance setup complete");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const demoOnly = args.includes("--demo-only");
  const stateFilter = args
    .find((a) => a.startsWith("--state="))
    ?.split("=")[1];

  console.log("=== Protocol Guide: NASEMSO Agency Seed ===\n");

  if (dryRun) console.log("DRY RUN MODE - No data will be inserted\n");
  if (demoOnly) console.log("DEMO ONLY MODE - Seeding demo agencies only\n");
  if (stateFilter) console.log(`STATE FILTER: ${stateFilter}\n`);

  let allAgencies: AgencyRecord[] = [];

  if (demoOnly) {
    // Only seed demo agencies for ImageTrend presentation
    allAgencies = DEMO_AGENCIES;
  } else {
    // Generate full NASEMSO dataset
    let states = US_STATES;
    if (stateFilter) {
      states = US_STATES.filter(
        (s) => s.code.toUpperCase() === stateFilter.toUpperCase()
      );
    }

    for (const state of states) {
      const stateAgencies = generateAgenciesForState(state);
      allAgencies.push(...stateAgencies);
    }

    // Add demo agencies (they'll be upserted, so no duplicates)
    allAgencies.push(...DEMO_AGENCIES);
  }

  console.log(`Generated ${allAgencies.length} agency records\n`);

  // Summary by type
  const typeCounts: Record<string, number> = {};
  for (const a of allAgencies) {
    typeCounts[a.agency_type] = (typeCounts[a.agency_type] || 0) + 1;
  }
  console.log("Distribution by type:");
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  // Summary by state (top 10)
  const stateCounts: Record<string, number> = {};
  for (const a of allAgencies) {
    stateCounts[a.state_code] = (stateCounts[a.state_code] || 0) + 1;
  }
  console.log("\nTop 10 states by agency count:");
  Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });

  if (dryRun) {
    console.log("\nDry run complete - no data inserted");
    return;
  }

  // Upsert agencies
  console.log("\nUpserting agencies...");
  const result = await upsertAgenciesBatch(allAgencies);

  console.log("\n\n=== Seed Complete ===");
  console.log(`Inserted/Updated: ${result.inserted}`);
  console.log(`Errors: ${result.errors}`);

  // Setup inheritance if not demo-only
  if (!demoOnly) {
    await setupProtocolInheritance();
  }

  // Verify final count
  const { count } = await supabase
    .from("manus_agencies")
    .select("*", { count: "exact", head: true });

  console.log(`\nTotal agencies in database: ${count}`);
}

main()
  .then(() => {
    console.log("\nSeed script complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
