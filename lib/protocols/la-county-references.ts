/**
 * LA County EMS Agency Reference Number Mapping
 * Maps 500-series destination policies and other key references
 *
 * Source: LA County 2024 Prehospital Care Manual (PCM)
 * https://file.lacounty.gov/SDSInter/dhs/1143706_2024PCMPublic.pdf
 */

export type ReferenceCategory = "destination" | "policy" | "procedure" | "administrative";

export type ReferenceInfo = {
  title: string;
  category: ReferenceCategory;
  description: string;
  pdfSearchTerm?: string;
};

/**
 * LA County Reference number to protocol information mapping
 */
export const LA_COUNTY_REFERENCES: Record<string, ReferenceInfo> = {
  // Destination Policies (500 series)
  "502": {
    title: "Patient Destination",
    category: "destination",
    description: "General patient destination criteria",
  },
  "506": {
    title: "Trauma Triage",
    category: "destination",
    description: "Trauma center criteria and triage decision",
  },
  "508": {
    title: "SART Center",
    category: "destination",
    description: "Sexual Assault Response Team centers - within 120 hours",
  },
  "510": {
    title: "Pediatric Patient Destination",
    category: "destination",
    description: "PMC, EDAP, PTC criteria for patients ≤14 years",
  },
  "511": {
    title: "Perinatal Center",
    category: "destination",
    description: "OB emergency and perinatal transport",
  },
  "512": {
    title: "Burn Center",
    category: "destination",
    description: "Major and minor burn criteria - TBSA thresholds",
  },
  "513": {
    title: "STEMI Receiving Center",
    category: "destination",
    description: "STEMI receiving center criteria - 12-lead required",
  },
  "516": {
    title: "Cardiac Arrest Destination",
    category: "destination",
    description: "Post-arrest and ECPR routing criteria",
  },
  "518": {
    title: "Decompression Emergency",
    category: "destination",
    description: "Hyperbaric chamber routing for diving emergencies",
  },
  "521": {
    title: "Stroke Center",
    category: "destination",
    description: "PSC and CSC routing - mLAPSS/LAMS scoring",
  },
  "526": {
    title: "Psychiatric Urgent Care (PUCC)",
    category: "destination",
    description: "Behavioral/psychiatric crisis - TAD training required",
  },
  "528": {
    title: "Sobering Center",
    category: "destination",
    description: "Alcohol intoxication - TAD training required",
  },

  // Key Policy References
  "802": {
    title: "EMT Scope of Practice",
    category: "policy",
    description: "EMT scope of practice limitations and capabilities",
  },
  "803": {
    title: "Paramedic Scope of Practice",
    category: "policy",
    description: "Paramedic scope of practice and authorized medications",
  },
  "814": {
    title: "Determination of Death",
    category: "policy",
    description: "Field pronouncement criteria and 20-minute asystole rule",
  },
  "832": {
    title: "Treatment of Minors",
    category: "policy",
    description: "Consent requirements for patients <18 years",
  },
  "834": {
    title: "Patient Refusal",
    category: "policy",
    description: "AMA documentation requirements - base contact required",
  },

  // Base Hospital Contact
  "1200.2": {
    title: "Base Hospital Contact",
    category: "policy",
    description: "Mandatory base contact criteria by category",
  },
};

/**
 * Get LA County PCM landing page URL
 */
export function getReferencePCMUrl(): string {
  return "https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/";
}

/**
 * @deprecated Use getReferencePCMUrl() instead
 * Get LA County PCM PDF URL with search anchor (legacy)
 */
export function getReferencePDFUrl(refNumber: string): string {
  const ref = LA_COUNTY_REFERENCES[refNumber];
  const searchTerm = ref?.pdfSearchTerm || `Reference ${refNumber}`;
  return `https://file.lacounty.gov/SDSInter/dhs/1143706_2024PCMPublic.pdf#search=${encodeURIComponent(searchTerm)}`;
}

/**
 * Get reference info by number
 */
export function getReferenceInfo(refNumber: string): ReferenceInfo | undefined {
  return LA_COUNTY_REFERENCES[refNumber];
}

/**
 * Get all destination protocol references
 */
export function getDestinationReferences(): Array<{ number: string } & ReferenceInfo> {
  return Object.entries(LA_COUNTY_REFERENCES)
    .filter(([, info]) => info.category === "destination")
    .map(([number, info]) => ({ number, ...info }));
}
