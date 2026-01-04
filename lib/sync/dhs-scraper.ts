/**
 * LA County DHS EMS Policy Scraper
 *
 * Scrapes the LA County DHS EMS Prehospital Care Manual website
 * to extract policy information, modification dates, and PDF links.
 */

import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import {
  ScrapedPolicy,
  ScrapeResult,
  ScrapeError,
  SyncConfig,
  DEFAULT_SYNC_CONFIG,
  RSI_DRUGS,
  UNAUTHORIZED_PROCEDURES
} from './types';

/**
 * Main scraper class for LA County DHS EMS policies
 */
export class DHSScraper {
  private config: SyncConfig;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * Scrape all configured reference series
   */
  async scrapeAll(): Promise<ScrapeResult> {
    const startTime = Date.now();
    const policies: ScrapedPolicy[] = [];
    const errors: ScrapeError[] = [];

    console.log(`Starting DHS policy scrape at ${new Date().toISOString()}`);
    console.log(`Scraping ${this.config.seriesToScrape.length} series...`);

    for (const series of this.config.seriesToScrape) {
      const seriesUrl = `${this.config.baseUrl}/${series}/`;
      console.log(`\nScraping series: ${series}`);

      try {
        // First, get the series index page to find all policies
        const seriesPolicies = await this.scrapeSeriesPage(seriesUrl, series);
        policies.push(...seriesPolicies);
        console.log(`  Found ${seriesPolicies.length} policies in ${series}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  Error scraping ${series}: ${errorMsg}`);
        errors.push({
          url: seriesUrl,
          refNo: series,
          error: errorMsg
        });
      }

      // Respect rate limiting
      await this.delay(this.config.requestDelayMs);
    }

    const result: ScrapeResult = {
      policies,
      errors,
      scrapedAt: new Date(),
      durationMs: Date.now() - startTime
    };

    console.log(`\nScrape complete:`);
    console.log(`  Total policies: ${policies.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Duration: ${result.durationMs}ms`);

    return result;
  }

  /**
   * Scrape a single series page (e.g., /ref-1200/)
   */
  async scrapeSeriesPage(url: string, seriesId: string): Promise<ScrapedPolicy[]> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const policies: ScrapedPolicy[] = [];

    // Extract the last modified date from meta tags
    const lastModified = this.extractLastModified($);

    // Extract page title
    const pageTitle = $('title').text().replace(' - Emergency Medical Services Agency', '').trim();

    // Look for policy links within the page content
    // LA County DHS pages typically have links to individual policies or PDFs
    const pdfLinks = this.extractPdfLinks($);
    const policyLinks = this.extractPolicyLinks($, url);

    // If we found individual policy links, scrape each one
    if (policyLinks.length > 0) {
      for (const link of policyLinks) {
        try {
          const policy = await this.scrapePolicyPage(link.url, link.refNo);
          if (policy) {
            policies.push(policy);
          }
          await this.delay(this.config.requestDelayMs);
        } catch (error) {
          console.error(`    Error scraping ${link.refNo}: ${error}`);
        }
      }
    } else {
      // Treat the series page itself as a policy container
      const content = this.extractMainContent($);
      const medications = this.extractMedications(content);
      const procedures = this.extractProcedures(content);

      policies.push({
        refNo: this.normalizeRefNo(seriesId),
        fullRefNo: seriesId.toUpperCase().replace('REF-', 'Ref. '),
        title: pageTitle,
        sourceUrl: url,
        pdfUrl: pdfLinks.length > 0 ? pdfLinks[0] : null,
        lastModified,
        contentHash: this.hashContent(content),
        content: content.substring(0, 5000), // Limit content size
        medications,
        procedures,
        scrapedAt: new Date(),
        rawHtml: html
      });
    }

    return policies;
  }

  /**
   * Scrape an individual policy page
   */
  async scrapePolicyPage(url: string, refNo: string): Promise<ScrapedPolicy | null> {
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      const lastModified = this.extractLastModified($);
      const title = $('h1').first().text().trim() ||
                    $('title').text().replace(' - Emergency Medical Services Agency', '').trim();
      const content = this.extractMainContent($);
      const pdfLinks = this.extractPdfLinks($);
      const medications = this.extractMedications(content);
      const procedures = this.extractProcedures(content);

      return {
        refNo: this.normalizeRefNo(refNo),
        fullRefNo: refNo,
        title,
        sourceUrl: url,
        pdfUrl: pdfLinks.length > 0 ? pdfLinks[0] : null,
        lastModified,
        contentHash: this.hashContent(content),
        content: content.substring(0, 5000),
        medications,
        procedures,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error(`Failed to scrape policy page ${url}: ${error}`);
      return null;
    }
  }

  /**
   * Fetch a page with retry logic
   */
  private async fetchPage(url: string, retries = 0): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ProtocolGuide-Sync/1.0 (LA County EMS Policy Monitor)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (retries < this.config.maxRetries) {
        console.log(`  Retrying ${url} (attempt ${retries + 2}/${this.config.maxRetries + 1})`);
        await this.delay(this.config.requestDelayMs * 2);
        return this.fetchPage(url, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Extract last modified date from meta tags
   */
  private extractLastModified($: cheerio.CheerioAPI): Date | null {
    // Try article:modified_time first (most reliable)
    const modifiedTime = $('meta[property="article:modified_time"]').attr('content');
    if (modifiedTime) {
      return new Date(modifiedTime);
    }

    // Try og:updated_time
    const updatedTime = $('meta[property="og:updated_time"]').attr('content');
    if (updatedTime) {
      return new Date(updatedTime);
    }

    // Try dateModified in JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.dateModified) {
          return new Date(data.dateModified);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return null;
  }

  /**
   * Extract PDF links from the page
   */
  private extractPdfLinks($: cheerio.CheerioAPI): string[] {
    const pdfLinks: string[] = [];

    $('a[href*=".pdf"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        // Normalize to absolute URL
        if (href.startsWith('http')) {
          pdfLinks.push(href);
        } else if (href.startsWith('//')) {
          pdfLinks.push('https:' + href);
        }
      }
    });

    // Also check for file.lacounty.gov links specifically
    $('a[href*="file.lacounty.gov"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !pdfLinks.includes(href)) {
        pdfLinks.push(href);
      }
    });

    return pdfLinks;
  }

  /**
   * Extract links to individual policy pages
   */
  private extractPolicyLinks($: cheerio.CheerioAPI, baseUrl: string): Array<{ url: string; refNo: string }> {
    const links: Array<{ url: string; refNo: string }> = [];

    // Look for links that match policy patterns (Ref. XXX, TP-XXXX, etc.)
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (href && this.looksLikePolicyLink(text, href)) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        const refNo = this.extractRefNoFromText(text) || this.extractRefNoFromUrl(href);

        if (refNo) {
          links.push({ url: fullUrl, refNo });
        }
      }
    });

    return links;
  }

  /**
   * Check if a link looks like it points to a policy
   */
  private looksLikePolicyLink(text: string, href: string): boolean {
    const policyPatterns = [
      /ref\.?\s*\d+/i,
      /tp-?\d+/i,
      /mcg-?\d+/i,
      /protocol\s+\d+/i
    ];

    return policyPatterns.some(pattern =>
      pattern.test(text) || pattern.test(href)
    );
  }

  /**
   * Extract reference number from text
   */
  private extractRefNoFromText(text: string): string | null {
    const patterns = [
      /ref\.?\s*(\d+(?:\.\d+)?)/i,
      /tp-?(\d+(?:-p)?)/i,
      /mcg-?(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract reference number from URL
   */
  private extractRefNoFromUrl(url: string): string | null {
    const match = url.match(/ref-?(\d+)/i) || url.match(/(\d{3,4})/);
    return match ? match[1] : null;
  }

  /**
   * Normalize reference number to consistent format
   */
  private normalizeRefNo(refNo: string): string {
    return refNo
      .replace(/^(ref\.?|tp-?|mcg-?)\s*/i, '')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * Extract main content from page
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Remove navigation, footer, scripts, styles
    $('nav, footer, script, style, header, .sidebar, .menu').remove();

    // Get main content area
    const mainContent = $('.grve-section, .entry-content, main, article, .content').first();

    if (mainContent.length) {
      return mainContent.text().replace(/\s+/g, ' ').trim();
    }

    // Fallback to body content
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract medication names from content
   */
  private extractMedications(content: string): string[] {
    const medications: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for each known medication (approved + prohibited)
    const allMedications = [
      // Approved
      'adenosine', 'albuterol', 'amiodarone', 'aspirin', 'atropine',
      'ipratropium', 'calcium chloride', 'dextrose', 'diphenhydramine',
      'dobutamine', 'dopamine', 'epinephrine', 'fentanyl', 'glucagon',
      'hydroxocobalamin', 'lidocaine', 'magnesium sulfate', 'mannitol',
      'midazolam', 'morphine', 'naloxone', 'nitroglycerin', 'ondansetron',
      'pralidoxime', 'procainamide', 'sodium bicarbonate', 'tranexamic acid',
      // Prohibited RSI drugs (important to detect)
      'succinylcholine', 'rocuronium', 'vecuronium', 'etomidate', 'ketamine', 'propofol'
    ];

    for (const med of allMedications) {
      if (lowerContent.includes(med)) {
        medications.push(med);
      }
    }

    return [...new Set(medications)]; // Remove duplicates
  }

  /**
   * Extract procedure names from content
   */
  private extractProcedures(content: string): string[] {
    const procedures: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for both authorized and unauthorized procedures
    const allProcedures = [
      // Authorized
      'intubation', 'defibrillation', 'cardioversion', 'transcutaneous pacing',
      'iv access', 'io access', 'intraosseous', 'cpap', 'bvm', 'bag valve mask',
      'supraglottic airway', 'igel', 'king airway', '12-lead', '12 lead',
      // Unauthorized (important to detect)
      'cricothyrotomy', 'needle cricothyrotomy', 'surgical cricothyrotomy',
      'cricothyroidotomy', 'surgical airway', 'chest tube', 'central line'
    ];

    for (const proc of allProcedures) {
      if (lowerContent.includes(proc)) {
        procedures.push(proc);
      }
    }

    return [...new Set(procedures)];
  }

  /**
   * Generate SHA-256 hash of content
   */
  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Convenience function to run a full scrape
 */
export async function scrapeAllPolicies(config?: Partial<SyncConfig>): Promise<ScrapeResult> {
  const scraper = new DHSScraper(config);
  return scraper.scrapeAll();
}

/**
 * Save scrape results to JSON file
 */
export function formatScrapeResultsAsJson(result: ScrapeResult): string {
  return JSON.stringify({
    scrapedAt: result.scrapedAt.toISOString(),
    durationMs: result.durationMs,
    totalPolicies: result.policies.length,
    totalErrors: result.errors.length,
    policies: result.policies.map(p => ({
      refNo: p.refNo,
      fullRefNo: p.fullRefNo,
      title: p.title,
      sourceUrl: p.sourceUrl,
      pdfUrl: p.pdfUrl,
      lastModified: p.lastModified?.toISOString() || null,
      contentHash: p.contentHash,
      medications: p.medications,
      procedures: p.procedures,
      scrapedAt: p.scrapedAt.toISOString()
    })),
    errors: result.errors
  }, null, 2);
}
