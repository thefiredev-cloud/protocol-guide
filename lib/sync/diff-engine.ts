/**
 * LA County DHS Policy Diff Engine
 *
 * Compares scraped policies against current app data to identify:
 * - New policies (in source but not in app)
 * - Updated policies (content changed)
 * - Removed policies (in app but not in source)
 */

import {
  ScrapedPolicy,
  PolicyDiff,
  DiffReport,
  DiffSummary,
  ContentChange,
  Severity
} from './types';
import { validatePolicy } from './policy-validator';

// Type for app protocol data
interface AppProtocol {
  id: string;
  refNo: string;
  title: string;
  category: string;
  lastUpdated: string;
  contentHash?: string;
}

/**
 * Generate a comprehensive diff report
 */
export function generateDiffReport(
  scrapedPolicies: ScrapedPolicy[],
  appProtocols: AppProtocol[]
): DiffReport {
  const diffs: PolicyDiff[] = [];
  const matchedAppRefs = new Set<string>();

  // Create lookup maps
  const appByRefNo = new Map<string, AppProtocol>();
  for (const protocol of appProtocols) {
    const normalizedRef = normalizeRefNo(protocol.refNo);
    appByRefNo.set(normalizedRef, protocol);
  }

  // Compare each scraped policy against app data
  for (const scraped of scrapedPolicies) {
    const normalizedRef = normalizeRefNo(scraped.refNo);
    const appMatch = appByRefNo.get(normalizedRef);

    if (appMatch) {
      // Policy exists in app - check for updates
      matchedAppRefs.add(normalizedRef);
      const diff = compareVersions(scraped, appMatch);
      if (diff) {
        diffs.push(diff);
      }
    } else {
      // New policy not in app
      const validation = validatePolicy(scraped);
      diffs.push({
        refNo: scraped.refNo,
        diffType: 'new',
        severity: determineSeverity(scraped, validation.errors.length > 0),
        sourceVersion: {
          title: scraped.title,
          lastModified: scraped.lastModified || new Date(),
          contentHash: scraped.contentHash,
          sourceUrl: scraped.sourceUrl
        },
        validationErrors: validation.errors,
        requiresReview: true,
        summary: `New policy: ${scraped.title}`
      });
    }
  }

  // Check for removed policies (in app but not scraped)
  const scrapedRefNos = new Set(scrapedPolicies.map(p => normalizeRefNo(p.refNo)));
  for (const protocol of appProtocols) {
    const normalizedRef = normalizeRefNo(protocol.refNo);
    if (!scrapedRefNos.has(normalizedRef) && !matchedAppRefs.has(normalizedRef)) {
      diffs.push({
        refNo: protocol.refNo,
        diffType: 'removed',
        severity: 'high',
        appVersion: {
          title: protocol.title,
          lastUpdated: protocol.lastUpdated,
          contentHash: protocol.contentHash || ''
        },
        requiresReview: true,
        summary: `Policy may have been removed from LA County DHS: ${protocol.title}`
      });
    }
  }

  // Generate summary
  const summary = generateSummary(diffs);

  return {
    timestamp: new Date(),
    totalScraped: scrapedPolicies.length,
    totalInApp: appProtocols.length,
    diffs,
    summary
  };
}

/**
 * Compare scraped version against app version
 */
function compareVersions(scraped: ScrapedPolicy, app: AppProtocol): PolicyDiff | null {
  const changes: ContentChange[] = [];

  // Check title changes
  if (scraped.title.toLowerCase() !== app.title.toLowerCase()) {
    changes.push({
      section: 'title',
      changeType: 'modification',
      before: app.title,
      after: scraped.title,
      clinicalImpact: 'low'
    });
  }

  // Check content hash (if we have one for the app)
  const contentChanged = app.contentHash && app.contentHash !== scraped.contentHash;

  // Check date - if scraped is newer than app
  const appDate = parseAppDate(app.lastUpdated);
  const scrapedDate = scraped.lastModified;
  const isNewer = scrapedDate && appDate && scrapedDate > appDate;

  // If no changes detected, return null
  if (changes.length === 0 && !contentChanged && !isNewer) {
    return null;
  }

  // Validate the scraped content
  const validation = validatePolicy(scraped);

  // Determine if this is a significant update
  const hasCriticalErrors = validation.errors.some(e => e.severity === 'critical');

  return {
    refNo: scraped.refNo,
    diffType: 'updated',
    severity: hasCriticalErrors ? 'critical' : determineSeverity(scraped, false),
    appVersion: {
      title: app.title,
      lastUpdated: app.lastUpdated,
      contentHash: app.contentHash || ''
    },
    sourceVersion: {
      title: scraped.title,
      lastModified: scraped.lastModified || new Date(),
      contentHash: scraped.contentHash,
      sourceUrl: scraped.sourceUrl
    },
    changes,
    validationErrors: validation.errors,
    requiresReview: changes.length > 0 || contentChanged || hasCriticalErrors,
    summary: generateChangeSummary(changes, contentChanged, isNewer || false)
  };
}

/**
 * Determine severity based on policy category
 */
function determineSeverity(policy: ScrapedPolicy, hasErrors: boolean): Severity {
  if (hasErrors) return 'critical';

  const refNum = parseInt(policy.refNo.replace(/\D/g, ''));

  // 1200 series = treatment protocols (high priority)
  if (refNum >= 1200 && refNum < 1300) return 'high';

  // 1300 series = pharmacology (high priority)
  if (refNum >= 1300 && refNum < 1400) return 'high';

  // 800 series = field operations (medium priority)
  if (refNum >= 800 && refNum < 900) return 'medium';

  // Everything else (low priority)
  return 'low';
}

/**
 * Generate summary of all diffs
 */
function generateSummary(diffs: PolicyDiff[]): DiffSummary {
  let newPolicies = 0;
  let updatedPolicies = 0;
  let removedPolicies = 0;
  let unchangedPolicies = 0;
  let criticalIssues = 0;
  let highPriorityReviews = 0;
  let medicationChanges = 0;
  let procedureChanges = 0;

  for (const diff of diffs) {
    switch (diff.diffType) {
      case 'new':
        newPolicies++;
        break;
      case 'updated':
        updatedPolicies++;
        break;
      case 'removed':
        removedPolicies++;
        break;
      case 'unchanged':
        unchangedPolicies++;
        break;
    }

    if (diff.severity === 'critical') {
      criticalIssues++;
    }

    if (diff.requiresReview && (diff.severity === 'high' || diff.severity === 'critical')) {
      highPriorityReviews++;
    }

    // Check for medication/procedure changes in validation errors
    for (const error of diff.validationErrors || []) {
      if (error.type === 'rsi_drug_detected' || error.type === 'unauthorized_medication') {
        medicationChanges++;
      }
      if (error.type === 'unauthorized_procedure') {
        procedureChanges++;
      }
    }
  }

  return {
    newPolicies,
    updatedPolicies,
    removedPolicies,
    unchangedPolicies,
    criticalIssues,
    highPriorityReviews,
    medicationChanges,
    procedureChanges
  };
}

/**
 * Generate human-readable change summary
 */
function generateChangeSummary(
  changes: ContentChange[],
  contentChanged: boolean,
  isNewer: boolean
): string {
  const parts: string[] = [];

  if (changes.length > 0) {
    const sections = changes.map(c => c.section).join(', ');
    parts.push(`Changes in: ${sections}`);
  }

  if (contentChanged) {
    parts.push('Content hash changed (may have updates)');
  }

  if (isNewer) {
    parts.push('Source is newer than app version');
  }

  return parts.length > 0 ? parts.join('; ') : 'Minor metadata update';
}

/**
 * Parse app date format (e.g., "Jan 1, 2026" or "2024")
 */
function parseAppDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try parsing as full date
  const fullDate = new Date(dateStr);
  if (!isNaN(fullDate.getTime())) {
    return fullDate;
  }

  // Try parsing as year only
  const yearMatch = dateStr.match(/\d{4}/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[0]), 0, 1);
  }

  return null;
}

/**
 * Normalize reference number for matching
 */
function normalizeRefNo(refNo: string): string {
  return refNo
    .toLowerCase()
    .replace(/^(ref\.?|tp-?|mcg-?|protocol)\s*/i, '')
    .replace(/[.\s-]/g, '')
    .trim();
}

/**
 * Format diff report as Markdown
 */
export function formatDiffReportAsMarkdown(report: DiffReport): string {
  const lines: string[] = [
    `# LA County EMS Policy Sync Report`,
    ``,
    `**Generated:** ${report.timestamp.toISOString()}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Policies Scraped | ${report.totalScraped} |`,
    `| Policies in App | ${report.totalInApp} |`,
    `| New Policies | ${report.summary.newPolicies} |`,
    `| Updated Policies | ${report.summary.updatedPolicies} |`,
    `| Removed Policies | ${report.summary.removedPolicies} |`,
    `| Critical Issues | ${report.summary.criticalIssues} |`,
    `| High Priority Reviews | ${report.summary.highPriorityReviews} |`,
    ``
  ];

  // Critical Issues Section
  const criticalDiffs = report.diffs.filter(d => d.severity === 'critical');
  if (criticalDiffs.length > 0) {
    lines.push(`## CRITICAL ISSUES (Immediate Action Required)`);
    lines.push(``);
    for (const diff of criticalDiffs) {
      lines.push(`### ${diff.refNo} - ${diff.sourceVersion?.title || diff.appVersion?.title}`);
      lines.push(`- **Type:** ${diff.diffType}`);
      lines.push(`- **Summary:** ${diff.summary}`);
      if (diff.validationErrors && diff.validationErrors.length > 0) {
        lines.push(`- **Validation Errors:**`);
        for (const error of diff.validationErrors) {
          lines.push(`  - \`${error.severity.toUpperCase()}\`: ${error.message}`);
        }
      }
      lines.push(``);
    }
  }

  // New Policies Section
  const newPolicies = report.diffs.filter(d => d.diffType === 'new');
  if (newPolicies.length > 0) {
    lines.push(`## New Policies`);
    lines.push(``);
    for (const diff of newPolicies) {
      lines.push(`### ${diff.refNo} - ${diff.sourceVersion?.title}`);
      lines.push(`- **Source:** [${diff.sourceVersion?.sourceUrl}](${diff.sourceVersion?.sourceUrl})`);
      lines.push(`- **Last Modified:** ${diff.sourceVersion?.lastModified.toISOString()}`);
      lines.push(`- **Severity:** ${diff.severity}`);
      lines.push(`- **Action Required:** Add to app`);
      lines.push(``);
    }
  }

  // Updated Policies Section
  const updatedPolicies = report.diffs.filter(d => d.diffType === 'updated');
  if (updatedPolicies.length > 0) {
    lines.push(`## Updated Policies`);
    lines.push(``);
    for (const diff of updatedPolicies) {
      lines.push(`### ${diff.refNo} - ${diff.sourceVersion?.title}`);
      lines.push(`- **App Version:** ${diff.appVersion?.lastUpdated}`);
      lines.push(`- **Source Version:** ${diff.sourceVersion?.lastModified.toISOString()}`);
      lines.push(`- **Changes:** ${diff.summary}`);
      lines.push(`- **Severity:** ${diff.severity}`);
      lines.push(``);
    }
  }

  // Removed Policies Section
  const removedPolicies = report.diffs.filter(d => d.diffType === 'removed');
  if (removedPolicies.length > 0) {
    lines.push(`## Removed/Missing Policies`);
    lines.push(``);
    lines.push(`> These policies exist in the app but were not found on the LA County DHS website.`);
    lines.push(`> Verify if they have been deprecated or if the URL has changed.`);
    lines.push(``);
    for (const diff of removedPolicies) {
      lines.push(`- **${diff.refNo}** - ${diff.appVersion?.title}`);
    }
    lines.push(``);
  }

  // Footer
  lines.push(`---`);
  lines.push(`*Report generated by Protocol Guide DHS Policy Sync*`);

  return lines.join('\n');
}

/**
 * Format diff report as JSON
 */
export function formatDiffReportAsJson(report: DiffReport): string {
  return JSON.stringify({
    timestamp: report.timestamp.toISOString(),
    totalScraped: report.totalScraped,
    totalInApp: report.totalInApp,
    summary: report.summary,
    diffs: report.diffs.map(d => ({
      refNo: d.refNo,
      diffType: d.diffType,
      severity: d.severity,
      requiresReview: d.requiresReview,
      summary: d.summary,
      appVersion: d.appVersion ? {
        title: d.appVersion.title,
        lastUpdated: d.appVersion.lastUpdated
      } : null,
      sourceVersion: d.sourceVersion ? {
        title: d.sourceVersion.title,
        lastModified: d.sourceVersion.lastModified.toISOString(),
        sourceUrl: d.sourceVersion.sourceUrl
      } : null,
      validationErrors: d.validationErrors?.map(e => ({
        type: e.type,
        severity: e.severity,
        message: e.message
      })) || []
    }))
  }, null, 2);
}
