import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { counties } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";
import mysql from "mysql2/promise";

interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface IndexInfo {
  Table: string;
  Non_unique: number;
  Key_name: string;
  Seq_in_index: number;
  Column_name: string;
  Collation: string | null;
  Cardinality: number | null;
  Sub_part: number | null;
  Packed: string | null;
  Null: string;
  Index_type: string;
  Comment: string;
  Index_comment: string;
}

interface CountyRow {
  id: number;
  name: string;
  state: string;
  usesStateProtocols: boolean;
  protocolVersion: string | null;
  createdAt: Date;
}

async function auditMySQLSchema() {
  console.log("=".repeat(80));
  console.log("Protocol Guide Manus - MySQL Database Schema Audit");
  console.log("=".repeat(80));
  console.log();

  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);

  try {
    // 1. Document the counties table structure
    console.log("## 1. Counties Table Structure\n");

    const [columns] = await pool.query("DESCRIBE counties") as [ColumnInfo[], any];
    console.log("### Columns:\n");
    console.log("```");
    console.log("Field                Type                Null    Key     Default         Extra");
    console.log("-".repeat(90));
    columns.forEach((col) => {
      const field = col.Field.padEnd(20);
      const type = col.Type.padEnd(19);
      const nullable = col.Null.padEnd(7);
      const key = col.Key.padEnd(7);
      const defaultVal = (col.Default || "NULL").padEnd(15);
      const extra = col.Extra;
      console.log(`${field} ${type} ${nullable} ${key} ${defaultVal} ${extra}`);
    });
    console.log("```\n");

    // 2. Get indexes
    const [indexes] = await pool.query("SHOW INDEX FROM counties") as [IndexInfo[], any];
    console.log("### Indexes:\n");
    console.log("```");
    const uniqueIndexes = new Map<string, IndexInfo[]>();
    indexes.forEach((idx) => {
      if (!uniqueIndexes.has(idx.Key_name)) {
        uniqueIndexes.set(idx.Key_name, []);
      }
      uniqueIndexes.get(idx.Key_name)!.push(idx);
    });

    uniqueIndexes.forEach((indexCols, indexName) => {
      const isUnique = indexCols[0].Non_unique === 0;
      const isPrimary = indexName === "PRIMARY";
      const columns = indexCols.map(i => i.Column_name).join(", ");
      const type = isPrimary ? "PRIMARY KEY" : isUnique ? "UNIQUE" : "INDEX";
      console.log(`${indexName.padEnd(30)} ${type.padEnd(15)} (${columns})`);
    });
    console.log("```\n");

    // 3. Get table statistics
    console.log("### Table Statistics:\n");
    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM counties`);
    const totalCounties = (countResult as any)[0]?.total || 0;
    console.log(`- Total counties: ${totalCounties}`);

    const [stateResult] = await db.execute(sql`SELECT COUNT(DISTINCT state) as total FROM counties`);
    const totalStates = (stateResult as any)[0]?.total || 0;
    console.log(`- Total states: ${totalStates}\n`);

    // 4. Get all California counties
    console.log("## 2. California Counties\n");
    const caCounties = await db
      .select()
      .from(counties)
      .where(eq(counties.state, "California"))
      .orderBy(counties.name);

    console.log(`Found ${caCounties.length} California counties:\n`);
    console.log("```");
    console.log("ID    Name                                    Uses State   Protocol Version");
    console.log("-".repeat(90));
    caCounties.forEach((county) => {
      const id = county.id.toString().padEnd(5);
      const name = county.name.padEnd(43);
      const usesState = (county.usesStateProtocols ? "Yes" : "No").padEnd(12);
      const version = (county.protocolVersion || "N/A").padEnd(16);
      console.log(`${id} ${name} ${usesState} ${version}`);
    });
    console.log("```\n");

    // 5. Find LA County specifically
    console.log("## 3. LA County (Los Angeles County)\n");
    const laCountyResults = await db
      .select()
      .from(counties)
      .where(eq(counties.name, "Los Angeles County"));

    if (laCountyResults.length > 0) {
      const laCounty = laCountyResults[0];
      console.log("```json");
      console.log(JSON.stringify(laCounty, null, 2));
      console.log("```\n");
      console.log(`**LA County ID: ${laCounty.id}**\n`);
    } else {
      // Try alternative searches
      console.log("Searching for alternative LA County names...\n");
      const [searchResults] = await db.execute(
        sql`SELECT * FROM counties WHERE name LIKE '%Los Angeles%' OR name LIKE '%LA County%' ORDER BY name`
      );
      const matches = searchResults as any[];
      if (matches.length > 0) {
        console.log(`Found ${matches.length} possible matches:\n`);
        console.log("```json");
        matches.forEach((match) => {
          console.log(JSON.stringify(match, null, 2));
        });
        console.log("```\n");
      } else {
        console.log("**No LA County found in database**\n");
      }
    }

    // 6. Check how county IDs are generated
    console.log("## 4. County ID Generation Analysis\n");

    const [firstCounty] = await db.execute(sql`SELECT * FROM counties ORDER BY id ASC LIMIT 1`);
    const [lastCounty] = await db.execute(sql`SELECT * FROM counties ORDER BY id DESC LIMIT 1`);
    const firstId = (firstCounty as any)[0]?.id || 0;
    const lastId = (lastCounty as any)[0]?.id || 0;

    console.log("```");
    console.log(`First County ID: ${firstId}`);
    console.log(`Last County ID:  ${lastId}`);
    console.log(`ID Range:        ${lastId - firstId + 1}`);
    console.log(`Total Counties:  ${totalCounties}`);
    console.log(`Gap Analysis:    ${lastId - firstId + 1 - totalCounties} missing IDs (deleted or never created)`);
    console.log("```\n");

    console.log("### ID Generation Method:\n");
    console.log("Based on schema analysis:");
    console.log("- Column: `id INT AUTO_INCREMENT PRIMARY KEY`");
    console.log("- Method: **MySQL AUTO_INCREMENT**");
    console.log("- Behavior: Sequential integer starting from 1, increments on each INSERT");
    console.log("- Gaps: Possible if records are deleted or inserts fail\n");

    // 7. Sample counties from different states
    console.log("## 5. Sample Counties by State\n");
    const [stateGroups] = await db.execute(sql`
      SELECT state, COUNT(*) as count
      FROM counties
      GROUP BY state
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log("Top 10 states by county count:\n");
    console.log("```");
    console.log("State                Count");
    console.log("-".repeat(40));
    (stateGroups as any[]).forEach((row) => {
      console.log(`${row.state.padEnd(20)} ${row.count}`);
    });
    console.log("```\n");

    // 8. Protocol version analysis
    console.log("## 6. Protocol Version Analysis\n");
    const [versionStats] = await db.execute(sql`
      SELECT
        protocolVersion,
        COUNT(*) as count
      FROM counties
      GROUP BY protocolVersion
      ORDER BY count DESC
      LIMIT 20
    `);

    console.log("Protocol version distribution:\n");
    console.log("```");
    console.log("Version                      Count");
    console.log("-".repeat(50));
    (versionStats as any[]).forEach((row) => {
      const version = (row.protocolVersion || "NULL").padEnd(28);
      console.log(`${version} ${row.count}`);
    });
    console.log("```\n");

    // 9. State protocol usage
    console.log("## 7. State Protocol Usage\n");
    const [stateProtocolStats] = await db.execute(sql`
      SELECT
        usesStateProtocols,
        COUNT(*) as count
      FROM counties
      GROUP BY usesStateProtocols
    `);

    console.log("Counties using state-level protocols:\n");
    console.log("```");
    (stateProtocolStats as any[]).forEach((row) => {
      const uses = row.usesStateProtocols ? "Yes" : "No";
      console.log(`${uses.padEnd(10)} ${row.count} counties`);
    });
    console.log("```\n");

    console.log("=".repeat(80));
    console.log("Audit Complete");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("Error during audit:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

auditMySQLSchema().catch(console.error);
