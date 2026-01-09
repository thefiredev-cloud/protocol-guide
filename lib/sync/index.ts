/**
 * LA County DHS Policy Sync Module
 *
 * Automated synchronization of LA County DHS EMS policies
 * with the Protocol Guide application.
 *
 * Usage:
 *   import { runSync } from './lib/sync';
 *   const report = await runSync();
 */

export * from './types';
export * from './dhs-scraper';
export * from './diff-engine';
export * from './policy-validator';

import { DHSScraper, formatScrapeResultsAsJson } from './dhs-scraper';
import { generateDiffReport, formatDiffReportAsMarkdown, formatDiffReportAsJson } from './diff-engine';
import { validateAllPolicies, getValidationSummary } from './policy-validator';
import { SyncConfig, DEFAULT_SYNC_CONFIG, DiffReport, ScrapeResult } from './types';

/**
 * Run a complete policy sync
 */
export async function runSync(config?: Partial<SyncConfig>): Promise<{
  scrapeResult: ScrapeResult;
  diffReport: DiffReport;
  markdownReport: string;
  jsonReport: string;
}> {
  const scraper = new DHSScraper(config);

  // Step 1: Scrape LA County DHS website
  console.log('Step 1: Scraping LA County DHS website...');
  const scrapeResult = await scraper.scrapeAll();

  // Step 2: Load current app protocols
  console.log('Step 2: Loading current app protocols...');
  const appProtocols = await loadAppProtocols();

  // Step 3: Generate diff report
  console.log('Step 3: Generating diff report...');
  const diffReport = generateDiffReport(scrapeResult.policies, appProtocols);

  // Step 4: Format reports
  console.log('Step 4: Formatting reports...');
  const markdownReport = formatDiffReportAsMarkdown(diffReport);
  const jsonReport = formatDiffReportAsJson(diffReport);

  // Step 5: Log summary
  console.log('\n=== SYNC COMPLETE ===');
  console.log(`Policies scraped: ${scrapeResult.policies.length}`);
  console.log(`Policies in app: ${appProtocols.length}`);
  console.log(`New policies: ${diffReport.summary.newPolicies}`);
  console.log(`Updated policies: ${diffReport.summary.updatedPolicies}`);
  console.log(`Removed policies: ${diffReport.summary.removedPolicies}`);
  console.log(`Critical issues: ${diffReport.summary.criticalIssues}`);

  if (diffReport.summary.criticalIssues > 0) {
    console.log('\n⚠️  CRITICAL ISSUES FOUND - REVIEW REQUIRED');
  }

  return {
    scrapeResult,
    diffReport,
    markdownReport,
    jsonReport
  };
}

/**
 * Load current app protocols from data files
 * This is a placeholder - will need to import actual protocol data
 */
async function loadAppProtocols(): Promise<Array<{
  id: string;
  refNo: string;
  title: string;
  category: string;
  lastUpdated: string;
  contentHash?: string;
}>> {
  // TODO: Import from actual protocol data files
  // For now, return empty array - will be populated when integrated
  try {
    // Dynamic import of protocol data
    const { protocols } = await import('../../data/protocols');
    return protocols.map(p => ({
      id: p.id,
      refNo: p.refNo,
      title: p.title,
      category: p.category,
      lastUpdated: p.lastUpdated,
      contentHash: undefined // Will be computed when needed
    }));
  } catch (error) {
    console.warn('Could not load app protocols:', error);
    return [];
  }
}

/**
 * Save sync results to files
 */
export async function saveSyncResults(
  scrapeResult: ScrapeResult,
  markdownReport: string,
  jsonReport: string,
  outputDir: string = './data/sync'
): Promise<{
  scrapedPoliciesPath: string;
  reportPath: string;
  jsonPath: string;
}> {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // In Node.js environment, use fs
  // In browser/Deno, this would need different handling
  const fs = await import('fs/promises');
  const path = await import('path');

  // Ensure directories exist
  await fs.mkdir(path.join(outputDir, 'reports'), { recursive: true });

  // Save scraped policies
  const scrapedPoliciesPath = path.join(outputDir, 'scraped-policies.json');
  await fs.writeFile(scrapedPoliciesPath, formatScrapeResultsAsJson(scrapeResult));

  // Save markdown report
  const reportPath = path.join(outputDir, 'reports', `${timestamp}.md`);
  await fs.writeFile(reportPath, markdownReport);

  // Save JSON report
  const jsonPath = path.join(outputDir, 'reports', `${timestamp}.json`);
  await fs.writeFile(jsonPath, jsonReport);

  console.log(`\nResults saved:`);
  console.log(`  Scraped policies: ${scrapedPoliciesPath}`);
  console.log(`  Markdown report: ${reportPath}`);
  console.log(`  JSON report: ${jsonPath}`);

  return {
    scrapedPoliciesPath,
    reportPath,
    jsonPath
  };
}
