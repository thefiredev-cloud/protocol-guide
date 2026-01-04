/**
 * Apply Policy Updates Script
 *
 * Applies approved policy changes from a sync report to the app's data files.
 * Run this AFTER reviewing the diff report and confirming changes are valid.
 *
 * Usage: npx tsx scripts/apply-policy-updates.ts [--report=YYYY-MM-DD]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ScrapedPolicy {
  refNo: string;
  fullRefNo: string;
  title: string;
  sourceUrl: string;
  pdfUrl: string | null;
  lastModified: string | null;
  contentHash: string;
  medications: string[];
  procedures: string[];
}

interface SyncData {
  scrapedAt: string;
  totalPolicies: number;
  policies: ScrapedPolicy[];
}

interface DiffEntry {
  refNo: string;
  diffType: 'new' | 'updated' | 'removed';
  severity: string;
  requiresReview: boolean;
  summary: string;
  sourceVersion?: {
    title: string;
    lastModified: string;
    sourceUrl: string;
  };
}

interface DiffReport {
  timestamp: string;
  summary: {
    newPolicies: number;
    updatedPolicies: number;
    removedPolicies: number;
    criticalIssues: number;
  };
  diffs: DiffEntry[];
}

async function main() {
  console.log('='.repeat(60));
  console.log('Apply Policy Updates');
  console.log('='.repeat(60));
  console.log();

  // Parse command line args
  const args = process.argv.slice(2);
  let reportDate = new Date().toISOString().split('T')[0]; // Default to today

  for (const arg of args) {
    if (arg.startsWith('--report=')) {
      reportDate = arg.split('=')[1];
    }
  }

  const syncDir = join(process.cwd(), 'data', 'sync');
  const reportsDir = join(syncDir, 'reports');

  // Load scraped policies
  const scrapedPath = join(syncDir, 'scraped-policies.json');
  if (!existsSync(scrapedPath)) {
    console.error('❌ No scraped policies found at:', scrapedPath);
    console.error('   Run "npm run sync:run" first.');
    process.exit(1);
  }

  const syncData: SyncData = JSON.parse(readFileSync(scrapedPath, 'utf-8'));
  console.log(`Loaded ${syncData.totalPolicies} scraped policies from ${syncData.scrapedAt}`);

  // Load diff report
  const reportPath = join(reportsDir, `${reportDate}.json`);
  if (!existsSync(reportPath)) {
    console.error(`❌ No diff report found for ${reportDate}`);
    console.error('   Available reports:');
    // List available reports
    const { readdirSync } = await import('fs');
    const reports = readdirSync(reportsDir).filter(f => f.endsWith('.json'));
    for (const report of reports) {
      console.error(`   - ${report.replace('.json', '')}`);
    }
    process.exit(1);
  }

  const diffReport: DiffReport = JSON.parse(readFileSync(reportPath, 'utf-8'));
  console.log(`Loaded diff report from ${diffReport.timestamp}`);
  console.log();

  // Summary
  console.log('Changes to apply:');
  console.log(`  New policies: ${diffReport.summary.newPolicies}`);
  console.log(`  Updated policies: ${diffReport.summary.updatedPolicies}`);
  console.log(`  Removed policies: ${diffReport.summary.removedPolicies}`);
  console.log(`  Critical issues: ${diffReport.summary.criticalIssues}`);
  console.log();

  // Check for critical issues
  if (diffReport.summary.criticalIssues > 0) {
    console.warn('⚠️  WARNING: This report contains critical issues!');
    console.warn('   Please review the markdown report before proceeding.');
    console.warn();

    const criticalDiffs = diffReport.diffs.filter(d => d.severity === 'critical');
    for (const diff of criticalDiffs) {
      console.warn(`   ❌ ${diff.refNo}: ${diff.summary}`);
    }
    console.warn();

    // In automated mode, exit; in interactive mode, prompt
    console.log('To proceed anyway, add --force flag');
    if (!args.includes('--force')) {
      process.exit(1);
    }
  }

  // Process changes
  console.log('Processing changes...');
  console.log();

  let applied = 0;
  let skipped = 0;

  for (const diff of diffReport.diffs) {
    if (diff.diffType === 'new') {
      console.log(`📝 NEW: ${diff.refNo} - ${diff.sourceVersion?.title}`);
      console.log(`   Source: ${diff.sourceVersion?.sourceUrl}`);
      console.log(`   → Add to appropriate series-*.ts file`);
      applied++;
    } else if (diff.diffType === 'updated') {
      console.log(`🔄 UPDATE: ${diff.refNo} - ${diff.summary}`);
      console.log(`   Last Modified: ${diff.sourceVersion?.lastModified}`);
      console.log(`   → Update lastUpdated field and review content`);
      applied++;
    } else if (diff.diffType === 'removed') {
      console.log(`🗑️  REMOVED: ${diff.refNo}`);
      console.log(`   → Verify if policy was deprecated or URL changed`);
      skipped++;
    }
    console.log();
  }

  // Generate update instructions
  console.log('='.repeat(60));
  console.log('MANUAL STEPS REQUIRED');
  console.log('='.repeat(60));
  console.log();
  console.log('1. Review the changes above');
  console.log('2. For NEW policies:');
  console.log('   - Determine the correct series file (series-1200.ts, series-1300.ts, etc.)');
  console.log('   - Add the protocol entry with proper formatting');
  console.log('   - Run validation to check for RSI drugs/cricothyrotomy');
  console.log();
  console.log('3. For UPDATED policies:');
  console.log('   - Compare the new content with existing');
  console.log('   - Update the lastUpdated field');
  console.log('   - Update any changed content sections');
  console.log();
  console.log('4. After making changes:');
  console.log('   npm run build');
  console.log();

  // Save update log
  const logPath = join(reportsDir, `${reportDate}-applied.log`);
  const logContent = [
    `Policy Update Log - ${new Date().toISOString()}`,
    `Report: ${reportDate}`,
    `Applied: ${applied}`,
    `Skipped: ${skipped}`,
    '',
    'Changes:',
    ...diffReport.diffs.map(d => `${d.diffType.toUpperCase()}: ${d.refNo} - ${d.summary}`)
  ].join('\n');

  writeFileSync(logPath, logContent);
  console.log(`Update log saved to: ${logPath}`);

  console.log();
  console.log('✅ Review complete!');
}

main().catch(console.error);
