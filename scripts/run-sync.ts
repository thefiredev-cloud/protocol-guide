/**
 * Full Policy Sync Script
 *
 * Runs a complete sync: scrape → compare → validate → report
 *
 * Run with: npm run sync:run
 */

import { runSync, saveSyncResults } from '../lib/sync';

async function main() {
  console.log('='.repeat(60));
  console.log('LA County DHS EMS Policy Sync');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log();

  try {
    // Run full sync
    const { scrapeResult, diffReport, markdownReport, jsonReport } = await runSync();

    // Save results
    await saveSyncResults(scrapeResult, markdownReport, jsonReport);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`New policies: ${diffReport.summary.newPolicies}`);
    console.log(`Updated policies: ${diffReport.summary.updatedPolicies}`);
    console.log(`Removed policies: ${diffReport.summary.removedPolicies}`);
    console.log(`Critical issues: ${diffReport.summary.criticalIssues}`);
    console.log(`High priority reviews: ${diffReport.summary.highPriorityReviews}`);

    if (diffReport.summary.criticalIssues > 0) {
      console.log('\n⚠️  CRITICAL ISSUES REQUIRE IMMEDIATE REVIEW');
      console.log('Check the generated report for details.');
    }

    if (diffReport.summary.newPolicies > 0 || diffReport.summary.updatedPolicies > 0) {
      console.log('\n📋 ACTION REQUIRED:');
      console.log('1. Review the diff report in data/sync/reports/');
      console.log('2. Run: npx tsx scripts/apply-policy-updates.ts');
      console.log('3. Rebuild the app: npm run build');
    }

    console.log('\nSync completed successfully!');

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
