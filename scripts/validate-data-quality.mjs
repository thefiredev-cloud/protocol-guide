#!/usr/bin/env node

/**
 * Data Quality Validation Script
 *
 * Analyzes all protocol data files and identifies:
 * - Missing required fields
 * - Null value patterns
 * - Malformed titles/IDs
 * - Duplicate content
 * - Orphaned metadata
 * - Inconsistent protocol codes
 *
 * Usage: node scripts/validate-data-quality.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Severity levels
const SEVERITY = {
  CRITICAL: 'CRITICAL',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

class DataQualityValidator {
  constructor() {
    this.issues = [];
    this.stats = {
      totalProtocols: 0,
      totalChunks: 0,
      nullFieldCount: 0,
      malformedTitles: 0,
      missingProtocolCodes: 0,
      duplicateIds: 0,
      orphanedMetadata: 0
    };
  }

  /**
   * Add an issue to the report
   */
  addIssue(severity, category, message, details = {}) {
    this.issues.push({
      severity,
      category,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validate protocol-metadata.json
   */
  async validateProtocolMetadata() {
    console.log('\n📋 Validating protocol-metadata.json...');

    const filePath = path.join(ROOT_DIR, 'data', 'protocol-metadata.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    this.stats.totalProtocols = data.length;
    console.log(`   Total entries: ${data.length}`);

    // Track all IDs to detect duplicates
    const idMap = new Map();
    const protocolCodeMap = new Map();

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];

      // Check for duplicate IDs
      if (idMap.has(entry.id)) {
        this.addIssue(
          SEVERITY.ERROR,
          'DUPLICATE_ID',
          `Duplicate ID found: ${entry.id}`,
          { index: i, duplicateIndex: idMap.get(entry.id) }
        );
        this.stats.duplicateIds++;
      } else {
        idMap.set(entry.id, i);
      }

      // Check for malformed titles (starting with numbers like "1011246 911112819signed")
      if (entry.title && /^[0-9]{7,}\s+[0-9]/.test(entry.title)) {
        this.addIssue(
          SEVERITY.ERROR,
          'MALFORMED_TITLE',
          `Malformed title: "${entry.title}"`,
          { id: entry.id, index: i }
        );
        this.stats.malformedTitles++;
      }

      // Check for missing protocol codes in markdown entries
      if (entry.id.startsWith('md:') && (!entry.protocolCodes || entry.protocolCodes.length === 0)) {
        this.addIssue(
          SEVERITY.WARNING,
          'MISSING_PROTOCOL_CODE',
          `Markdown entry missing protocol codes`,
          { id: entry.id, title: entry.title }
        );
        this.stats.missingProtocolCodes++;
      }

      // Count null fields
      const nullFields = this.countNullFields(entry);
      if (nullFields.count > 0) {
        this.stats.nullFieldCount += nullFields.count;

        // Flag critical null fields
        if (nullFields.critical.length > 0) {
          this.addIssue(
            SEVERITY.WARNING,
            'NULL_CRITICAL_FIELDS',
            `Entry has null critical fields: ${nullFields.critical.join(', ')}`,
            { id: entry.id, title: entry.title, nullFields: nullFields.all }
          );
        }
      }

      // Track protocol codes for cross-reference validation
      if (entry.protocolCodes && entry.protocolCodes.length > 0) {
        entry.protocolCodes.forEach(code => {
          if (!protocolCodeMap.has(code)) {
            protocolCodeMap.set(code, []);
          }
          protocolCodeMap.get(code).push(entry.id);
        });
      }
    }

    console.log(`   ✓ ID uniqueness check complete`);
    console.log(`   ✓ Title format validation complete`);
    console.log(`   ✓ Protocol code validation complete`);
    console.log(`   ⚠️  Found ${this.stats.malformedTitles} malformed titles`);
    console.log(`   ⚠️  Found ${this.stats.duplicateIds} duplicate IDs`);
    console.log(`   ⚠️  Found ${this.stats.nullFieldCount} null field values`);

    return protocolCodeMap;
  }

  /**
   * Count null fields in an entry
   */
  countNullFields(entry, prefix = '') {
    let count = 0;
    const all = [];
    const critical = [];

    const criticalFields = ['protocolCodes', 'category'];

    for (const [key, value] of Object.entries(entry)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (value === null) {
        count++;
        all.push(fieldPath);
        if (criticalFields.includes(key)) {
          critical.push(fieldPath);
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = this.countNullFields(value, fieldPath);
        count += nested.count;
        all.push(...nested.all);
        critical.push(...nested.critical);
      }
    }

    return { count, all, critical };
  }

  /**
   * Validate ems_kb_clean.json chunks
   */
  async validateKnowledgeBase() {
    console.log('\n📚 Validating ems_kb_clean.json...');

    const filePath = path.join(ROOT_DIR, 'data', 'ems_kb_clean.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    this.stats.totalChunks = data.length;
    console.log(`   Total chunks: ${data.length}`);

    const idSet = new Set();
    const protocolCodes = new Set();

    for (let i = 0; i < data.length; i++) {
      const chunk = data[i];

      // Check for required fields
      if (!chunk.id || chunk.id.trim() === '') {
        this.addIssue(
          SEVERITY.CRITICAL,
          'MISSING_CHUNK_ID',
          `Chunk at index ${i} missing ID`,
          { index: i, preview: chunk.text?.substring(0, 50) }
        );
      }

      // Check for duplicate IDs
      if (idSet.has(chunk.id)) {
        this.addIssue(
          SEVERITY.ERROR,
          'DUPLICATE_CHUNK_ID',
          `Duplicate chunk ID: ${chunk.id}`,
          { index: i }
        );
      } else {
        idSet.add(chunk.id);
      }

      // Check for empty text content
      if (!chunk.text || chunk.text.trim() === '') {
        this.addIssue(
          SEVERITY.ERROR,
          'EMPTY_CHUNK_TEXT',
          `Chunk has empty text content`,
          { id: chunk.id, index: i }
        );
      }

      // Check text length (chunks should be meaningful)
      if (chunk.text && chunk.text.length < 50) {
        this.addIssue(
          SEVERITY.WARNING,
          'SHORT_CHUNK',
          `Chunk text is very short (${chunk.text.length} chars)`,
          { id: chunk.id, text: chunk.text }
        );
      }

      // Extract protocol codes from chunk IDs
      const protocolMatch = chunk.id.match(/^md:(\d{4})/);
      if (protocolMatch) {
        protocolCodes.add(protocolMatch[1]);
      }
    }

    console.log(`   ✓ Chunk ID validation complete`);
    console.log(`   ✓ Content validation complete`);
    console.log(`   📊 Found ${protocolCodes.size} unique protocol codes in chunks`);

    return { idSet, protocolCodes };
  }

  /**
   * Cross-reference validation between metadata and chunks
   */
  async validateCrossReferences(metadataProtocols, chunkData) {
    console.log('\n🔗 Validating cross-references...');

    const metadataIds = new Set();
    const metadataPath = path.join(ROOT_DIR, 'data', 'protocol-metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    metadata.forEach(entry => metadataIds.add(entry.id));

    // Check for orphaned metadata (metadata entries without corresponding chunks)
    let orphanedCount = 0;
    for (const metadataId of metadataIds) {
      if (!chunkData.idSet.has(metadataId)) {
        this.addIssue(
          SEVERITY.INFO,
          'ORPHANED_METADATA',
          `Metadata entry has no corresponding chunk`,
          { id: metadataId }
        );
        orphanedCount++;
      }
    }

    // Check for chunks without metadata
    let missingMetadataCount = 0;
    for (const chunkId of chunkData.idSet) {
      if (!metadataIds.has(chunkId)) {
        // This is expected for some chunks, only flag if it's a protocol chunk
        if (chunkId.startsWith('md:')) {
          this.addIssue(
            SEVERITY.INFO,
            'MISSING_METADATA',
            `Chunk has no corresponding metadata entry`,
            { id: chunkId }
          );
          missingMetadataCount++;
        }
      }
    }

    this.stats.orphanedMetadata = orphanedCount;

    console.log(`   ⚠️  Found ${orphanedCount} orphaned metadata entries`);
    console.log(`   ℹ️  Found ${missingMetadataCount} chunks without metadata`);
  }

  /**
   * Validate protocol code consistency
   */
  async validateProtocolCodes() {
    console.log('\n🔢 Validating protocol codes...');

    const piPath = path.join(ROOT_DIR, 'data', 'provider_impressions.json');
    const providerImpressions = JSON.parse(fs.readFileSync(piPath, 'utf-8'));

    const validCodes = new Set();
    providerImpressions.forEach(pi => {
      validCodes.add(pi.tp_code);
      if (pi.tp_code_pediatric) {
        validCodes.add(pi.tp_code_pediatric);
      }
    });

    console.log(`   📋 Valid protocol codes: ${validCodes.size}`);

    // Check metadata for invalid protocol codes
    const metadataPath = path.join(ROOT_DIR, 'data', 'protocol-metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    let invalidCodeCount = 0;
    for (const entry of metadata) {
      if (entry.protocolCodes && entry.protocolCodes.length > 0) {
        for (const code of entry.protocolCodes) {
          if (!validCodes.has(code)) {
            this.addIssue(
              SEVERITY.ERROR,
              'INVALID_PROTOCOL_CODE',
              `Invalid protocol code: ${code}`,
              { id: entry.id, title: entry.title, code }
            );
            invalidCodeCount++;
          }
        }
      }
    }

    console.log(`   ⚠️  Found ${invalidCodeCount} invalid protocol codes`);
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATA QUALITY VALIDATION REPORT');
    console.log('='.repeat(80));

    // Summary Statistics
    console.log('\n📈 SUMMARY STATISTICS');
    console.log('-'.repeat(80));
    console.log(`Total Protocol Metadata Entries: ${this.stats.totalProtocols}`);
    console.log(`Total Knowledge Base Chunks:     ${this.stats.totalChunks}`);
    console.log(`Total Null Field Values:         ${this.stats.nullFieldCount}`);
    console.log(`Malformed Titles:                ${this.stats.malformedTitles}`);
    console.log(`Duplicate IDs:                   ${this.stats.duplicateIds}`);
    console.log(`Missing Protocol Codes:          ${this.stats.missingProtocolCodes}`);
    console.log(`Orphaned Metadata:               ${this.stats.orphanedMetadata}`);

    // Issues by Severity
    const bySeverity = {
      [SEVERITY.CRITICAL]: [],
      [SEVERITY.ERROR]: [],
      [SEVERITY.WARNING]: [],
      [SEVERITY.INFO]: []
    };

    this.issues.forEach(issue => {
      bySeverity[issue.severity].push(issue);
    });

    console.log('\n🚨 ISSUES BY SEVERITY');
    console.log('-'.repeat(80));
    console.log(`CRITICAL: ${bySeverity[SEVERITY.CRITICAL].length}`);
    console.log(`ERROR:    ${bySeverity[SEVERITY.ERROR].length}`);
    console.log(`WARNING:  ${bySeverity[SEVERITY.WARNING].length}`);
    console.log(`INFO:     ${bySeverity[SEVERITY.INFO].length}`);
    console.log(`TOTAL:    ${this.issues.length}`);

    // Issues by Category
    const byCategory = {};
    this.issues.forEach(issue => {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = [];
      }
      byCategory[issue.category].push(issue);
    });

    console.log('\n📋 ISSUES BY CATEGORY');
    console.log('-'.repeat(80));
    Object.entries(byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([category, issues]) => {
        console.log(`${category.padEnd(30)} ${issues.length}`);
      });

    // Critical Issues Detail
    if (bySeverity[SEVERITY.CRITICAL].length > 0) {
      console.log('\n🔴 CRITICAL ISSUES (MUST FIX)');
      console.log('-'.repeat(80));
      bySeverity[SEVERITY.CRITICAL].forEach((issue, i) => {
        console.log(`\n${i + 1}. ${issue.message}`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`);
      });
    }

    // Top 10 Errors
    if (bySeverity[SEVERITY.ERROR].length > 0) {
      console.log('\n🟠 TOP ERRORS (Sample)');
      console.log('-'.repeat(80));
      bySeverity[SEVERITY.ERROR].slice(0, 10).forEach((issue, i) => {
        console.log(`\n${i + 1}. ${issue.message}`);
        console.log(`   Category: ${issue.category}`);
        if (issue.details.id) {
          console.log(`   ID: ${issue.details.id}`);
        }
      });
      if (bySeverity[SEVERITY.ERROR].length > 10) {
        console.log(`\n   ... and ${bySeverity[SEVERITY.ERROR].length - 10} more errors`);
      }
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(80));

    if (this.stats.malformedTitles > 0) {
      console.log('1. Fix malformed titles - likely PDF extraction issues');
      console.log('   - Titles should be human-readable, not filename-like');
      console.log('   - Example fix: "1011246 911112819signed" → "Treatment Protocol 1011"');
    }

    if (this.stats.nullFieldCount > 5000) {
      console.log('2. Reduce null values in metadata');
      console.log('   - Consider extracting missing fields from protocol content');
      console.log('   - Set defaults for optional fields instead of null');
    }

    if (this.stats.duplicateIds > 0) {
      console.log('3. Resolve duplicate IDs before migration');
      console.log('   - Duplicates will cause primary key violations in database');
    }

    console.log('\n' + '='.repeat(80));

    // Save detailed report to file
    const reportPath = path.join(ROOT_DIR, 'data-quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: this.stats,
      issuesBySeverity: {
        critical: bySeverity[SEVERITY.CRITICAL].length,
        error: bySeverity[SEVERITY.ERROR].length,
        warning: bySeverity[SEVERITY.WARNING].length,
        info: bySeverity[SEVERITY.INFO].length
      },
      issuesByCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, v.length])
      ),
      issues: this.issues
    }, null, 2));

    console.log(`\n✅ Detailed report saved to: ${reportPath}`);

    return {
      passed: bySeverity[SEVERITY.CRITICAL].length === 0 && bySeverity[SEVERITY.ERROR].length === 0,
      stats: this.stats,
      criticalIssues: bySeverity[SEVERITY.CRITICAL].length,
      errors: bySeverity[SEVERITY.ERROR].length,
      warnings: bySeverity[SEVERITY.WARNING].length
    };
  }

  /**
   * Run all validations
   */
  async runAll() {
    console.log('🔍 Starting Data Quality Validation...');
    console.log('=' .repeat(80));

    const metadataProtocols = await this.validateProtocolMetadata();
    const chunkData = await this.validateKnowledgeBase();
    await this.validateCrossReferences(metadataProtocols, chunkData);
    await this.validateProtocolCodes();

    return this.generateReport();
  }
}

// Run validation
const validator = new DataQualityValidator();
validator.runAll().then(result => {
  if (result.passed) {
    console.log('\n✅ Data quality validation PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ Data quality validation FAILED');
    console.log(`   Critical issues: ${result.criticalIssues}`);
    console.log(`   Errors: ${result.errors}`);
    console.log(`   Warnings: ${result.warnings}`);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Validation script failed:', error);
  process.exit(1);
});
