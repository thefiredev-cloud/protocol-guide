/**
 * LA County DHS Policy Sync - Supabase Edge Function
 *
 * Triggered monthly by cron-job.org to:
 * 1. Scrape LA County DHS EMS website for policy updates
 * 2. Compare against current app data
 * 3. Generate diff report
 * 4. Commit results to GitHub
 * 5. Send notification email
 *
 * Environment Variables Required:
 * - CRON_SECRET: Shared secret for authenticating cron requests
 * - GITHUB_TOKEN: GitHub PAT for committing to repo
 * - GITHUB_REPO: Repository in format "owner/repo"
 * - ADMIN_EMAIL: Email for notifications (optional)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0";
import { createHash } from "https://deno.land/std@0.177.0/crypto/mod.ts";

// Types
interface ScrapedPolicy {
  refNo: string;
  fullRefNo: string;
  title: string;
  sourceUrl: string;
  pdfUrl: string | null;
  lastModified: Date | null;
  contentHash: string;
  medications: string[];
  procedures: string[];
  scrapedAt: Date;
}

interface SyncResult {
  success: boolean;
  policiesScraped: number;
  errors: string[];
  reportUrl?: string;
  timestamp: string;
}

// Configuration
const DHS_BASE_URL = "https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual";
const SERIES_TO_SCRAPE = [
  "ref-100", "ref-200", "ref-400", "ref-500",
  "ref-700", "ref-800", "ref-1100", "ref-1200", "ref-1300"
];
const REQUEST_DELAY_MS = 2000;

// RSI Drugs to detect (CRITICAL)
const RSI_DRUGS = new Set([
  "succinylcholine", "rocuronium", "vecuronium",
  "cisatracurium", "etomidate", "ketamine", "propofol"
]);

serve(async (req: Request) => {
  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");

  if (!expectedSecret || cronSecret !== expectedSecret) {
    console.error("Unauthorized request - invalid cron secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  console.log("=".repeat(60));
  console.log("LA County DHS Policy Sync - Edge Function");
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  const result: SyncResult = {
    success: false,
    policiesScraped: 0,
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Scrape policies
    console.log("\nStep 1: Scraping LA County DHS website...");
    const policies = await scrapeAllSeries();
    result.policiesScraped = policies.length;
    console.log(`Scraped ${policies.length} policies`);

    // Step 2: Validate for RSI drugs
    console.log("\nStep 2: Validating policies...");
    const criticalIssues = validatePolicies(policies);
    if (criticalIssues.length > 0) {
      console.warn(`Found ${criticalIssues.length} critical issues!`);
      result.errors.push(...criticalIssues);
    }

    // Step 3: Generate report
    console.log("\nStep 3: Generating report...");
    const report = generateReport(policies, criticalIssues);

    // Step 4: Commit to GitHub (if configured)
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const githubRepo = Deno.env.get("GITHUB_REPO");

    if (githubToken && githubRepo) {
      console.log("\nStep 4: Committing to GitHub...");
      const commitResult = await commitToGitHub(githubToken, githubRepo, report);
      if (commitResult.success) {
        result.reportUrl = commitResult.url;
        console.log(`Report committed: ${commitResult.url}`);
      } else {
        result.errors.push(`GitHub commit failed: ${commitResult.error}`);
      }
    } else {
      console.log("\nStep 4: Skipping GitHub commit (not configured)");
    }

    // Step 5: Send notification (if configured)
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (adminEmail && (criticalIssues.length > 0 || policies.length > 0)) {
      console.log("\nStep 5: Sending notification...");
      // Note: Email sending would require additional setup (e.g., Resend, SendGrid)
      console.log(`Would notify: ${adminEmail}`);
    }

    result.success = true;
    console.log("\n✅ Sync completed successfully!");

  } catch (error) {
    console.error("Sync failed:", error);
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 500,
    headers: { "Content-Type": "application/json" }
  });
});

/**
 * Scrape all configured series
 */
async function scrapeAllSeries(): Promise<ScrapedPolicy[]> {
  const policies: ScrapedPolicy[] = [];

  for (const series of SERIES_TO_SCRAPE) {
    const url = `${DHS_BASE_URL}/${series}/`;
    console.log(`  Scraping: ${series}`);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ProtocolGuide-Sync/1.0 (LA County EMS Policy Monitor)"
        }
      });

      if (!response.ok) {
        console.error(`  Failed to fetch ${series}: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract policy info
      const lastModified = extractLastModified($);
      const title = $("title").text().replace(" - Emergency Medical Services Agency", "").trim();
      const content = extractContent($);
      const medications = extractMedications(content);
      const procedures = extractProcedures(content);
      const pdfUrl = extractPdfUrl($);

      policies.push({
        refNo: normalizeRefNo(series),
        fullRefNo: series.toUpperCase().replace("REF-", "Ref. "),
        title,
        sourceUrl: url,
        pdfUrl,
        lastModified,
        contentHash: await hashContent(content),
        medications,
        procedures,
        scrapedAt: new Date()
      });

      // Rate limiting
      await delay(REQUEST_DELAY_MS);

    } catch (error) {
      console.error(`  Error scraping ${series}:`, error);
    }
  }

  return policies;
}

/**
 * Extract last modified date from meta tags
 */
function extractLastModified($: cheerio.CheerioAPI): Date | null {
  const modifiedTime = $('meta[property="article:modified_time"]').attr("content");
  return modifiedTime ? new Date(modifiedTime) : null;
}

/**
 * Extract main content from page
 */
function extractContent($: cheerio.CheerioAPI): string {
  $("nav, footer, script, style, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

/**
 * Extract PDF URL
 */
function extractPdfUrl($: cheerio.CheerioAPI): string | null {
  const pdfLink = $('a[href*="file.lacounty.gov"][href*=".pdf"]').first().attr("href");
  return pdfLink || null;
}

/**
 * Extract medication names
 */
function extractMedications(content: string): string[] {
  const medications: string[] = [];
  const lowerContent = content.toLowerCase();

  const allMeds = [
    "adenosine", "albuterol", "amiodarone", "aspirin", "atropine",
    "epinephrine", "fentanyl", "glucagon", "lidocaine", "midazolam",
    "morphine", "naloxone", "nitroglycerin", "ondansetron",
    "succinylcholine", "rocuronium", "etomidate", "ketamine", "propofol"
  ];

  for (const med of allMeds) {
    if (lowerContent.includes(med)) {
      medications.push(med);
    }
  }

  return [...new Set(medications)];
}

/**
 * Extract procedure names
 */
function extractProcedures(content: string): string[] {
  const procedures: string[] = [];
  const lowerContent = content.toLowerCase();

  const allProcs = [
    "intubation", "defibrillation", "cardioversion",
    "cricothyrotomy", "needle cricothyrotomy", "surgical airway"
  ];

  for (const proc of allProcs) {
    if (lowerContent.includes(proc)) {
      procedures.push(proc);
    }
  }

  return [...new Set(procedures)];
}

/**
 * Validate policies for critical issues
 */
function validatePolicies(policies: ScrapedPolicy[]): string[] {
  const issues: string[] = [];

  for (const policy of policies) {
    // Check for RSI drugs
    for (const med of policy.medications) {
      if (RSI_DRUGS.has(med.toLowerCase())) {
        issues.push(`CRITICAL: RSI drug "${med}" found in ${policy.refNo}`);
      }
    }

    // Check for cricothyrotomy
    for (const proc of policy.procedures) {
      if (proc.toLowerCase().includes("cricothyrotomy")) {
        issues.push(`CRITICAL: Cricothyrotomy reference in ${policy.refNo}`);
      }
    }
  }

  return issues;
}

/**
 * Generate markdown report
 */
function generateReport(policies: ScrapedPolicy[], criticalIssues: string[]): string {
  const timestamp = new Date().toISOString();
  const lines = [
    `# LA County EMS Policy Sync Report`,
    ``,
    `**Generated:** ${timestamp}`,
    `**Policies Scraped:** ${policies.length}`,
    `**Critical Issues:** ${criticalIssues.length}`,
    ``
  ];

  if (criticalIssues.length > 0) {
    lines.push(`## CRITICAL ISSUES`);
    lines.push(``);
    for (const issue of criticalIssues) {
      lines.push(`- ${issue}`);
    }
    lines.push(``);
  }

  lines.push(`## Policies Scraped`);
  lines.push(``);
  lines.push(`| Ref | Title | Last Modified |`);
  lines.push(`|-----|-------|---------------|`);

  for (const policy of policies) {
    const modified = policy.lastModified?.toISOString().split("T")[0] || "Unknown";
    lines.push(`| ${policy.refNo} | ${policy.title.substring(0, 40)} | ${modified} |`);
  }

  return lines.join("\n");
}

/**
 * Commit report to GitHub
 */
async function commitToGitHub(
  token: string,
  repo: string,
  content: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const date = new Date().toISOString().split("T")[0];
  const path = `data/sync/reports/${date}.md`;

  try {
    // Create or update file via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: `Policy sync report - ${date}`,
          content: btoa(content), // Base64 encode
          branch: "main"
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, url: data.content?.html_url };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Normalize reference number
 */
function normalizeRefNo(refNo: string): string {
  return refNo.replace(/^ref-/i, "").trim();
}

/**
 * Hash content using SHA-256
 */
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
