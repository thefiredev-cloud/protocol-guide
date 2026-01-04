/**
 * LA County DHS EMS Policy Sync Types
 *
 * Type definitions for scraping, comparing, and validating
 * LA County DHS EMS policies against the Protocol Guide app.
 */

// ============================================
// Scraped Policy Types
// ============================================

export interface ScrapedPolicy {
  /** Reference number (e.g., "1210", "814", "1317.29") */
  refNo: string;

  /** Full reference number with prefix (e.g., "Ref. 1210", "TP-1243") */
  fullRefNo: string;

  /** Policy title */
  title: string;

  /** Source URL on LA County DHS website */
  sourceUrl: string;

  /** PDF download URL if available */
  pdfUrl: string | null;

  /** Last modified date from meta tag */
  lastModified: Date | null;

  /** SHA-256 hash of content for change detection */
  contentHash: string;

  /** Extracted text content (from HTML or PDF) */
  content: string;

  /** Extracted medication names found in policy */
  medications: string[];

  /** Extracted procedure names found in policy */
  procedures: string[];

  /** When this policy was scraped */
  scrapedAt: Date;

  /** Raw HTML for debugging/fallback */
  rawHtml?: string;
}

export interface ScrapeResult {
  /** Successfully scraped policies */
  policies: ScrapedPolicy[];

  /** URLs that failed to scrape */
  errors: ScrapeError[];

  /** When the scrape started */
  scrapedAt: Date;

  /** Total duration in milliseconds */
  durationMs: number;
}

export interface ScrapeError {
  url: string;
  refNo?: string;
  error: string;
  statusCode?: number;
}

// ============================================
// Diff Types
// ============================================

export type DiffType = 'new' | 'updated' | 'removed' | 'unchanged';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type ChangeType = 'addition' | 'deletion' | 'modification';

export interface PolicyDiff {
  /** Reference number */
  refNo: string;

  /** Type of difference */
  diffType: DiffType;

  /** Severity level for prioritization */
  severity: Severity;

  /** App version info (if exists in app) */
  appVersion?: {
    title: string;
    lastUpdated: string;
    contentHash: string;
  };

  /** Source version info (from DHS website) */
  sourceVersion?: {
    title: string;
    lastModified: Date;
    contentHash: string;
    sourceUrl: string;
  };

  /** Detailed content changes (for updated policies) */
  changes?: ContentChange[];

  /** Validation errors found */
  validationErrors?: ValidationError[];

  /** Whether admin review is required */
  requiresReview: boolean;

  /** Summary description of the diff */
  summary: string;
}

export interface ContentChange {
  /** Section or field that changed */
  section: string;

  /** Type of change */
  changeType: ChangeType;

  /** Previous value */
  before?: string;

  /** New value */
  after?: string;

  /** Clinical impact assessment */
  clinicalImpact: 'high' | 'medium' | 'low' | 'none';
}

export interface DiffReport {
  /** When the diff was generated */
  timestamp: Date;

  /** Total policies scraped from source */
  totalScraped: number;

  /** Total policies in app */
  totalInApp: number;

  /** All diffs found */
  diffs: PolicyDiff[];

  /** Summary statistics */
  summary: DiffSummary;
}

export interface DiffSummary {
  newPolicies: number;
  updatedPolicies: number;
  removedPolicies: number;
  unchangedPolicies: number;
  criticalIssues: number;
  highPriorityReviews: number;
  medicationChanges: number;
  procedureChanges: number;
}

// ============================================
// Validation Types
// ============================================

export type ValidationErrorType =
  | 'rsi_drug_detected'
  | 'unauthorized_procedure'
  | 'unauthorized_medication'
  | 'invalid_dose'
  | 'missing_contraindication'
  | 'reference_mismatch';

export interface ValidationError {
  /** Type of validation error */
  type: ValidationErrorType;

  /** Severity level */
  severity: 'critical' | 'error' | 'warning';

  /** Human-readable error message */
  message: string;

  /** Where in the content the issue was found */
  location?: string;

  /** Additional context */
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  /** Whether the policy passed validation */
  valid: boolean;

  /** All errors found */
  errors: ValidationError[];

  /** Medications extracted and validated */
  medications: MedicationCheck[];

  /** Procedures extracted and validated */
  procedures: ProcedureCheck[];
}

export interface MedicationCheck {
  /** Medication name found */
  medication: string;

  /** Status in formulary */
  status: 'approved' | 'prohibited' | 'unknown';

  /** Severity if there's an issue */
  severity?: 'critical' | 'error' | 'warning';

  /** Message explaining status */
  message?: string;

  /** Dose found (if any) */
  dose?: string;

  /** Route found (if any) */
  route?: string;
}

export interface ProcedureCheck {
  /** Procedure name found */
  procedure: string;

  /** Whether authorized in LA County */
  authorized: boolean;

  /** Severity if unauthorized */
  severity?: 'critical' | 'error' | 'warning';

  /** Message explaining status */
  message?: string;
}

// ============================================
// Configuration Types
// ============================================

export interface SyncConfig {
  /** Base URL for LA County DHS EMS website */
  baseUrl: string;

  /** Reference series to scrape */
  seriesToScrape: string[];

  /** Delay between requests in milliseconds */
  requestDelayMs: number;

  /** Maximum retries for failed requests */
  maxRetries: number;

  /** Whether to download and parse PDFs */
  parsePdfs: boolean;

  /** Email for notifications */
  adminEmail?: string;

  /** GitHub repo for committing reports */
  githubRepo?: string;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  baseUrl: 'https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual',
  seriesToScrape: [
    'ref-100',
    'ref-200',
    'ref-400',
    'ref-500',
    'ref-700',
    'ref-800',
    'ref-1100',
    'ref-1200',
    'ref-1300'
  ],
  requestDelayMs: 2000,
  maxRetries: 3,
  parsePdfs: false, // Start with HTML-only
};

// ============================================
// LA County Formulary Constants
// ============================================

/** RSI drugs that are NEVER authorized in LA County EMS */
export const RSI_DRUGS = new Set([
  'succinylcholine',
  'rocuronium',
  'vecuronium',
  'cisatracurium',
  'etomidate',
  'ketamine',
  'propofol'
]);

/** Procedures NOT authorized in LA County EMS */
export const UNAUTHORIZED_PROCEDURES = new Set([
  'cricothyrotomy',
  'needle cricothyrotomy',
  'surgical cricothyrotomy',
  'cricothyroidotomy',
  'surgical airway',
  'finger thoracostomy',
  'chest tube',
  'central line',
  'pericardiocentesis'
]);

/** Approved LA County EMS Formulary */
export const APPROVED_FORMULARY = new Set([
  'adenosine',
  'albuterol',
  'amiodarone',
  'aspirin',
  'atropine',
  'ipratropium',
  'atrovent',
  'calcium chloride',
  'dextrose',
  'd10',
  'd50',
  'diphenhydramine',
  'benadryl',
  'dobutamine',
  'dopamine',
  'epinephrine',
  'fentanyl',
  'glucagon',
  'hydroxocobalamin',
  'cyanokit',
  'lidocaine',
  'magnesium sulfate',
  'mannitol',
  'midazolam',
  'versed',
  'morphine',
  'naloxone',
  'narcan',
  'nitroglycerin',
  'nitro',
  'ondansetron',
  'zofran',
  'pralidoxime',
  '2-pam',
  'procainamide',
  'sodium bicarbonate',
  'tranexamic acid',
  'txa'
]);
