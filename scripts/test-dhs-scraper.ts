/**
 * Test script for LA County DHS EMS Policy Scraper
 *
 * Run with: npm run sync:test
 */

import { DHSScraper, formatScrapeResultsAsJson } from '../lib/sync/dhs-scraper';
import { validateAllPolicies, getValidationSummary } from '../lib/sync/policy-validator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('='.repeat(60));
  console.log('LA County DHS EMS Policy Scraper - Test Run');
  console.log('='.repeat(60));
  console.log();

  // Create scraper with test config (only scrape a few series)
  const scraper = new DHSScraper({
    seriesToScrape: ['ref-1200', 'ref-1300'], // Just treatment protocols and pharmacology
    requestDelayMs: 2000, // 2 second delay between requests
    maxRetries: 2
  });

  try {
    // Run scrape
    console.log('Starting scrape of LA County DHS EMS website...');
    console.log('(Testing with ref-1200 and ref-1300 series only)');
    console.log();

    const result = await scraper.scrapeAll();

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('SCRAPE RESULTS');
    console.log('='.repeat(60));
    console.log(`Total policies found: ${result.policies.length}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log();

    // Show sample policies
    console.log('Sample policies found:');
    for (const policy of result.policies.slice(0, 5)) {
      console.log(`  - ${policy.fullRefNo}: ${policy.title}`);
      console.log(`    Last Modified: ${policy.lastModified?.toISOString() || 'Unknown'}`);
      console.log(`    Medications: ${policy.medications.join(', ') || 'None detected'}`);
      console.log(`    Procedures: ${policy.procedures.join(', ') || 'None detected'}`);
      console.log();
    }

    // Validate all policies
    console.log('='.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(60));

    const validationResults = validateAllPolicies(result.policies);
    const summary = getValidationSummary(validationResults);

    console.log(`Total policies validated: ${summary.totalPolicies}`);
    console.log(`Valid policies: ${summary.validPolicies}`);
    console.log(`Invalid policies: ${summary.invalidPolicies}`);
    console.log(`Critical errors: ${summary.criticalErrors}`);
    console.log(`Warnings: ${summary.warnings}`);

    if (summary.rsiDrugsFound.length > 0) {
      console.log();
      console.log('⚠️  RSI DRUGS DETECTED:');
      for (const drug of summary.rsiDrugsFound) {
        console.log(`   - ${drug}`);
      }
    }

    if (summary.unauthorizedProcedures.length > 0) {
      console.log();
      console.log('⚠️  UNAUTHORIZED PROCEDURES DETECTED:');
      for (const proc of summary.unauthorizedProcedures) {
        console.log(`   - ${proc}`);
      }
    }

    // Save results to file
    console.log();
    console.log('='.repeat(60));
    console.log('SAVING RESULTS');
    console.log('='.repeat(60));

    const outputDir = join(process.cwd(), 'data', 'sync');
    mkdirSync(outputDir, { recursive: true });

    const outputPath = join(outputDir, 'test-scrape-results.json');
    writeFileSync(outputPath, formatScrapeResultsAsJson(result));
    console.log(`Results saved to: ${outputPath}`);

    // Show any errors
    if (result.errors.length > 0) {
      console.log();
      console.log('ERRORS:');
      for (const error of result.errors) {
        console.log(`  - ${error.url}: ${error.error}`);
      }
    }

    console.log();
    console.log('Test complete!');

  } catch (error) {
    console.error('Scraper test failed:', error);
    process.exit(1);
  }
}

main();
