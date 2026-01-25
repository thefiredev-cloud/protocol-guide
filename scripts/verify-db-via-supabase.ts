/**
 * Database Health Check using Supabase Client API
 * Works without direct PostgreSQL connection string
 */

import "./load-env.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Expected tables based on schema.ts
const EXPECTED_TABLES = [
  "agencies",
  "agency_members",
  "audit_logs",
  "bookmarks",
  "contact_submissions",
  "counties",
  "drip_emails_sent",
  "feedback",
  "integration_logs",
  "protocol_chunks",
  "protocol_uploads",
  "protocol_versions",
  "push_tokens",
  "queries",
  "search_history",
  "stripe_webhook_events",
  "user_agencies",
  "user_auth_providers",
  "user_counties",
  "user_states",
  "users",
];

// Expected enums based on schema.ts
const EXPECTED_ENUMS = [
  "access_level",
  "agency_type",
  "contact_status",
  "feedback_category",
  "feedback_status",
  "integration_partner",
  "member_role",
  "member_status",
  "protocol_status",
  "subscription_tier",
  "upload_status",
  "user_role",
  "user_tier",
];

async function checkHealth() {
  console.log("🔍 Protocol Guide Supabase Database Health Check");
  console.log("=================================================\n");

  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

  const results = {
    connectivity: false,
    tablesFound: [] as string[],
    tablesMissing: [] as string[],
    enumsFound: [] as string[],
    enumsMissing: [] as string[],
    sampleCounts: {} as Record<string, number>,
    errors: [] as string[],
  };

  try {
    // 1. Test connectivity
    console.log("1️⃣ Testing Database Connectivity...");
    const { error: pingError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (pingError) {
      results.errors.push(`Connectivity test failed: ${pingError.message}`);
      console.error("❌ Failed:", pingError.message);
    } else {
      results.connectivity = true;
      console.log("✅ Database connected successfully\n");
    }

    // 2. Check each expected table
    console.log("2️⃣ Verifying Tables...");
    console.log(`   Expected: ${EXPECTED_TABLES.length} tables\n`);

    for (const table of EXPECTED_TABLES) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          results.tablesMissing.push(table);
          results.errors.push(`Table ${table}: ${error.message}`);
          console.log(`   ❌ ${table} - NOT FOUND (${error.code})`);
        } else {
          results.tablesFound.push(table);
          results.sampleCounts[table] = count || 0;
          console.log(`   ✅ ${table.padEnd(25)} - ${count || 0} rows`);
        }
      } catch (err: any) {
        results.tablesMissing.push(table);
        results.errors.push(`Table ${table}: ${err.message}`);
        console.log(`   ❌ ${table} - ERROR: ${err.message}`);
      }
    }

    // 3. Use RPC to check enums (if function exists)
    console.log("\n3️⃣ Checking Enum Types...");
    try {
      // Using SQL via rpc if available
      const { data: enumData, error: enumError } = await supabase.rpc("exec_sql", {
        sql: "SELECT typname FROM pg_type WHERE typcategory = 'E' ORDER BY typname",
      });

      if (enumError) {
        console.log("   ⚠️  Cannot query enums directly (RPC not available)");
        console.log(`   Error: ${enumError.message}`);
      } else if (enumData) {
        const foundEnums = enumData.map((row: any) => row.typname);
        results.enumsFound = foundEnums;

        console.log(`   Found: ${foundEnums.length} enum types\n`);
        foundEnums.forEach((enumName: string) => {
          const expected = EXPECTED_ENUMS.includes(enumName);
          console.log(`   ${expected ? "✅" : "⚠️ "} ${enumName}`);
        });

        // Check for missing enums
        results.enumsMissing = EXPECTED_ENUMS.filter(
          (e) => !foundEnums.includes(e)
        );
      }
    } catch (err: any) {
      console.log("   ⚠️  Enum check skipped (requires exec_sql RPC function)");
      console.log(`   Info: Create this function in Supabase to enable enum checking`);
    }

    // 4. Summary
    console.log("\n=================================================");
    console.log("📊 Summary");
    console.log("=================================================");
    console.log(`✅ Connectivity: ${results.connectivity ? "PASS" : "FAIL"}`);
    console.log(`📋 Tables Found: ${results.tablesFound.length}/${EXPECTED_TABLES.length}`);

    if (results.tablesMissing.length > 0) {
      console.log(`❌ Missing Tables (${results.tablesMissing.length}):`);
      results.tablesMissing.forEach((t) => console.log(`   - ${t}`));
    }

    console.log(`\n📊 Total Rows by Table:`);
    const sortedTables = Object.entries(results.sampleCounts).sort(
      ([, a], [, b]) => b - a
    );
    sortedTables.forEach(([table, count]) => {
      console.log(`   ${table.padEnd(25)}: ${count.toLocaleString()}`);
    });

    if (results.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered (${results.errors.length}):`);
      results.errors.slice(0, 5).forEach((err) => console.log(`   - ${err}`));
      if (results.errors.length > 5) {
        console.log(`   ... and ${results.errors.length - 5} more`);
      }
    }

    console.log("\n=================================================");

    if (results.tablesFound.length === EXPECTED_TABLES.length) {
      console.log("✅ All expected tables verified!");
    } else {
      console.log(`⚠️  Missing ${results.tablesMissing.length} tables`);
    }

    console.log("=================================================\n");
  } catch (error: any) {
    console.error("\n❌ Health check failed:", error.message);
    throw error;
  }
}

checkHealth().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
