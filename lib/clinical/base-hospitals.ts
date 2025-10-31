/**
 * LA County EMS Base Hospital Contact Directory
 * 
 * Central repository for all LA County base hospital contact numbers.
 * Base hospitals provide online medical direction and authorization for paramedics.
 * 
 * Reference: LA County EMS Agency Base Hospital Documentation Manual (Ref No. 644)
 * Last Updated: 2025
 */

export interface BaseHospital {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  hospitalCode: string; // Two-letter code used in base hospital forms
  region: 'Central' | 'North' | 'South' | 'East' | 'West';
  address: string;
  capabilities: string[]; // Trauma Center, Stroke Center, STEMI, etc.
  available24_7: boolean;
}

export const BASE_HOSPITALS: BaseHospital[] = [
  {
    id: 'LAC-USC',
    name: 'Los Angeles General Medical Center (LAC+USC)',
    shortName: 'LAC+USC',
    phone: '(323) 881-2411',
    hospitalCode: 'LAC',
    region: 'Central',
    address: '2051 Marengo St, Los Angeles, CA 90033',
    capabilities: ['Level I Trauma Center', 'Stroke Center', 'STEMI Center', 'Burn Center'],
    available24_7: true
  },
  {
    id: 'HARBOR-UCLA',
    name: 'Harbor-UCLA Medical Center',
    shortName: 'Harbor-UCLA',
    phone: '(310) 222-3345',
    hospitalCode: 'HAR',
    region: 'South',
    address: '1000 W Carson St, Torrance, CA 90502',
    capabilities: ['Level I Trauma Center', 'Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'OLIVE-VIEW',
    name: 'Olive View-UCLA Medical Center',
    shortName: 'Olive View',
    phone: '(818) 364-3050',
    hospitalCode: 'OLV',
    region: 'North',
    address: '14445 Olive View Dr, Sylmar, CA 91342',
    capabilities: ['Trauma Center', 'Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'RONALD-REAGAN-UCLA',
    name: 'Ronald Reagan UCLA Medical Center',
    shortName: 'UCLA Medical Center',
    phone: '(310) 825-6301',
    hospitalCode: 'UCL',
    region: 'West',
    address: '757 Westwood Plaza, Los Angeles, CA 90095',
    capabilities: ['Level I Trauma Center', 'Stroke Center', 'STEMI Center', 'ECMO Center'],
    available24_7: true
  },
  {
    id: 'CEDARS-SINAI',
    name: 'Cedars-Sinai Medical Center',
    shortName: 'Cedars-Sinai',
    phone: '(310) 887-0599',
    hospitalCode: 'CED',
    region: 'West',
    address: '8700 Beverly Blvd, Los Angeles, CA 90048',
    capabilities: ['Level I Trauma Center', 'Stroke Center', 'STEMI Center', 'ECMO Center'],
    available24_7: true
  },
  {
    id: 'HUNTINGTON-MEMORIAL',
    name: 'Huntington Memorial Hospital',
    shortName: 'Huntington',
    phone: '(626) 397-5330',
    hospitalCode: 'HUN',
    region: 'East',
    address: '100 W California Blvd, Pasadena, CA 91105',
    capabilities: ['Trauma Center', 'Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'LONG-BEACH-MEMORIAL',
    name: 'MemorialCare Long Beach Medical Center',
    shortName: 'Long Beach Memorial',
    phone: '(562) 933-2000',
    hospitalCode: 'LBM',
    region: 'South',
    address: '2801 Atlantic Ave, Long Beach, CA 90806',
    capabilities: ['Level II Trauma Center', 'Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'TORRANCE-MEMORIAL',
    name: 'Torrance Memorial Medical Center',
    shortName: 'Torrance Memorial',
    phone: '(310) 325-9110',
    hospitalCode: 'TOR',
    region: 'South',
    address: '3330 Lomita Blvd, Torrance, CA 90505',
    capabilities: ['Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'PROVIDENCE-LITTLE-COMPANY',
    name: 'Providence Little Company of Mary Medical Center',
    shortName: 'Little Company',
    phone: '(310) 303-3333',
    hospitalCode: 'LCM',
    region: 'South',
    address: '4101 Torrance Blvd, Torrance, CA 90503',
    capabilities: ['Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'HENRY-MAYO',
    name: 'Henry Mayo Newhall Hospital',
    shortName: 'Henry Mayo',
    phone: '(661) 253-8000',
    hospitalCode: 'HEN',
    region: 'North',
    address: '23845 McBean Pkwy, Valencia, CA 91355',
    capabilities: ['Trauma Center', 'Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'PROVIDENCE-HOLY-CROSS',
    name: 'Providence Holy Cross Medical Center',
    shortName: 'Holy Cross',
    phone: '(818) 496-4360',
    hospitalCode: 'HOL',
    region: 'North',
    address: '15031 Rinaldi St, Mission Hills, CA 91345',
    capabilities: ['Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'PROVIDENCE-ST-JOHNS',
    name: "Providence Saint John's Health Center",
    shortName: "St. John's",
    phone: '(310) 829-5511',
    hospitalCode: 'STJ',
    region: 'West',
    address: '2121 Santa Monica Blvd, Santa Monica, CA 90404',
    capabilities: ['Stroke Center', 'STEMI Center'],
    available24_7: true
  },
  {
    id: 'GLENDALE-ADVENTIST',
    name: 'Glendale Adventist Medical Center',
    shortName: 'Glendale Adventist',
    phone: '(818) 409-8000',
    hospitalCode: 'GLE',
    region: 'North',
    address: '1509 Wilson Terrace, Glendale, CA 91206',
    capabilities: ['Stroke Center', 'STEMI Center'],
    available24_7: true
  }
];

/**
 * Medical Alert Center (MAC) - For specialized consultations
 * Used for hyperbaric emergencies, ECMO center contacts, etc.
 */
export const MEDICAL_ALERT_CENTER = {
  name: 'Medical Alert Center (MAC)',
  phone: '(562) 347-1789',
  alternatePhone: '(866) 940-4401',
  usage: 'For specialized consultations (ECMO, hyperbaric emergencies, disease outbreaks)',
  available24_7: true
};

/**
 * Specialized Emergency Contacts
 */
export const SPECIALIZED_CONTACTS = {
  catalinaHyperbaric: {
    name: 'Catalina Hyperbaric Chamber',
    phone: '(310) 510-1053',
    usage: 'Decompression emergencies'
  },
  emsAgency: {
    name: 'LA County EMS Agency',
    phone: '(562) 378-1641',
    address: '10100 Pioneer Blvd, Suite 200, Santa Fe Springs, CA 90670',
    usage: 'Administrative inquiries, policy waivers'
  }
};

// Helper functions for quick lookups
export function getBaseHospitalByCode(code: string): BaseHospital | undefined {
  return BASE_HOSPITALS.find(h => h.hospitalCode === code);
}

export function getBaseHospitalsByRegion(region: string): BaseHospital[] {
  return BASE_HOSPITALS.filter(h => h.region === region);
}

export function getBaseHospitalById(id: string): BaseHospital | undefined {
  return BASE_HOSPITALS.find(h => h.id === id);
}

export function formatPhoneForDisplay(phone: string): string {
  // Returns formatted phone number for display
  return phone;
}

export function formatPhoneForDialing(phone: string): string {
  // Removes formatting for tel: links
  return phone.replace(/[^0-9]/g, '');
}

export function getAllBaseHospitalsByCapability(capability: string): BaseHospital[] {
  return BASE_HOSPITALS.filter(h => 
    h.capabilities.some(cap => 
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
}

/**
 * Get the nearest/most appropriate base hospital based on region
 * This is a simplified version - in production, this would use GPS coordinates
 */
export function getRecommendedBaseHospital(region?: string): BaseHospital {
  if (region) {
    const regionalHospitals = getBaseHospitalsByRegion(region);
    if (regionalHospitals.length > 0) {
      return regionalHospitals[0];
    }
  }
  // Default to LAC+USC as central base hospital
  return BASE_HOSPITALS[0];
}

