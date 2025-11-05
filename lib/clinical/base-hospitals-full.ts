/* eslint-disable max-lines */
/**
 * LA County EMS Complete Hospital Directory
 * Auto-generated from LA County EMS Agency Reference No. 501
 *
 * This is the COMPLETE directory of all 9-1-1 receiving hospitals in LA County.
 * Last Updated: 2025-11-04
 */

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  hospitalCode: string;
  region: 'Central' | 'North' | 'South' | 'East' | 'West';
  address: string;
  capabilities: string[];
  available24_7: boolean;
}

export const ALL_HOSPITALS: Hospital[] = [
  {
    "id": "GWT",
    "name": "Adventist Health Glendale",
    "shortName": "Adventist Glendale",
    "phone": "(818) 409-8000",
    "hospitalCode": "GWT",
    "region": "North",
    "address": "1509 East Wilson Terrace, Glendale, CA  91206",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "WMH",
    "name": "Adventist Health White Memorial",
    "shortName": "Adventist White Memorial",
    "phone": "(323) 268-5000",
    "hospitalCode": "WMH",
    "region": "Central",
    "address": "1720 Caesar Chavez Avenue, Los Angeles, CA  90033",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "BEV",
    "name": "Montebello",
    "shortName": "Montebello",
    "phone": "(323) 725-5035",
    "hospitalCode": "BEV",
    "region": "East",
    "address": "309 W. Beverly Boulevard, Montebello, CA 90640",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "ACH",
    "name": "Alhambra Hospital Medical Center",
    "shortName": "Alhambra",
    "phone": "(626) 570-1606",
    "hospitalCode": "ACH",
    "region": "East",
    "address": "100 South Raymond Avenue, Alhambra, CA 91801",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "AVH",
    "name": "Antelope Valley Medical Center",
    "shortName": "Antelope Valley",
    "phone": "(661) 949-5000",
    "hospitalCode": "AVH",
    "region": "North",
    "address": "1600 West Avenue J, Lancaster, CA 93534",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "AHM",
    "name": "Catalina Island Medical Center",
    "shortName": "Catalina Island",
    "phone": "(310) 510-0700",
    "hospitalCode": "AHM",
    "region": "South",
    "address": "100 Falls Canyon Road, Avalon, CA 90704",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "CSM",
    "name": "Cedars Sinai Medical Center",
    "shortName": "Cedars Sinai",
    "phone": "(310) 855-5000",
    "hospitalCode": "CSM",
    "region": "West",
    "address": "8700 Beverly Boulevard, Los Angeles, CA  90048",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "DFM",
    "name": "Cedars Sinai Marina Del Rey Hospital",
    "shortName": "Cedars Sinai Marina Del Rey",
    "phone": "(310) 823-8911",
    "hospitalCode": "DFM",
    "region": "West",
    "address": "4650 Lincoln Boulevard, Marina Del Rey, CA  90291",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "CNT",
    "name": "Centinela Hospital Medical Center",
    "shortName": "Centinela",
    "phone": "(310) 673-4660",
    "hospitalCode": "CNT",
    "region": "South",
    "address": "555 East Hardy Street, Inglewood, CA  90301",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "CHH",
    "name": "Children’s Hospital Los Angeles",
    "shortName": "Children’s Los Angeles",
    "phone": "(323) 660-2450",
    "hospitalCode": "CHH",
    "region": "Central",
    "address": "4650 Sunset Boulevard, Los Angeles, CA  90027",
    "capabilities": [
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "CPM",
    "name": "Coast Plaza Hospital",
    "shortName": "Coast Plaza",
    "phone": "(562) 868-3751",
    "hospitalCode": "CPM",
    "region": "South",
    "address": "13100 Studebaker Road, Norwalk, CA  90650",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "PLB",
    "name": "College Medical Center",
    "shortName": "College",
    "phone": "(562) 595-1911",
    "hospitalCode": "PLB",
    "region": "South",
    "address": "2776 Pacific Avenue, Long Beach, CA  90806",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "CHP",
    "name": "Community Hospital of Huntington Park",
    "shortName": "Community of Huntington Park",
    "phone": "(323) 583-1931",
    "hospitalCode": "CHP",
    "region": "Central",
    "address": "2623 E. Slauson Ave., Huntington Park, CA 90023",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "CAL",
    "name": "Medical Center",
    "shortName": "",
    "phone": "(213) 748-2411",
    "hospitalCode": "CAL",
    "region": "Central",
    "address": "1401 South Grand Avenue, Los Angeles, CA  90015",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "GMH",
    "name": "Hospital and Health Center",
    "shortName": "and",
    "phone": "(818) 502-1900",
    "hospitalCode": "GMH",
    "region": "North",
    "address": "1420 South Central Avenue, Glendale, CA  91204",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "NRH",
    "name": "Medical Center",
    "shortName": "",
    "phone": "(818) 885-8500",
    "hospitalCode": "NRH",
    "region": "North",
    "address": "18300 Roscoe Boulevard, Northridge, CA  91328",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "SMM",
    "name": "Dignity Health-St. Mary Medical Center",
    "shortName": "Dignity -St. Mary",
    "phone": "(562) 491-9000",
    "hospitalCode": "SMM",
    "region": "South",
    "address": "1050 Linden Avenue, Long Beach, CA  90813",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "ELA",
    "name": "East Los Angeles Doctors Hospital",
    "shortName": "East Los Angeles Doctors",
    "phone": "(323) 268-5514",
    "hospitalCode": "ELA",
    "region": "Central",
    "address": "4060 East Whittier Boulevard, Los Angeles, CA 90023",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "FPH",
    "name": "Hospital",
    "shortName": "",
    "phone": "(626) 963-8411",
    "hospitalCode": "FPH",
    "region": "East",
    "address": "250 South Grand Avenue, Glendora, CA  91749",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "ICH",
    "name": "Hospital",
    "shortName": "",
    "phone": "(626) 331-7331",
    "hospitalCode": "ICH",
    "region": "East",
    "address": "210 West San Bernardino Road, Covina, CA  91723",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "QVH",
    "name": "Hospital",
    "shortName": "",
    "phone": "(626) 962-4011",
    "hospitalCode": "QVH",
    "region": "East",
    "address": "1115 South Sunset Avenue, West Covina, CA 91790",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "ENH",
    "name": "Encino Hospital Medical Center",
    "shortName": "Encino",
    "phone": "(818) 995-5000",
    "hospitalCode": "ENH",
    "region": "North",
    "address": "16237 Ventura Boulevard, Encino, CA  91436",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "GAR",
    "name": "Garfield Medical Center",
    "shortName": "Garfield",
    "phone": "(626) 573-2222",
    "hospitalCode": "GAR",
    "region": "East",
    "address": "525 North Garfield Avenue, Monterey Park, CA  91754",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "GEM",
    "name": "Greater El Monte Community Hospital",
    "shortName": "Greater El Monte Community",
    "phone": "(626) 579-7777",
    "hospitalCode": "GEM",
    "region": "East",
    "address": "1701 Santa Anita Avenue, South El Monte, CA  91733",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "HGH",
    "name": "Harbor-UCLA Medical Center",
    "shortName": "Harbor-UCLA",
    "phone": "(424) 306-4000",
    "hospitalCode": "HGH",
    "region": "South",
    "address": "1000 West Carson Street, Torrance, CA  90502",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "HMN",
    "name": "Henry Mayo Newhall Hospital",
    "shortName": "Henry Mayo Newhall",
    "phone": "(661) 253-8000",
    "hospitalCode": "HMN",
    "region": "North",
    "address": "23845 West McBean Parkway, Valencia, CA  91355",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "QOA",
    "name": "Hollywood Presbyterian Medical Center",
    "shortName": "Hollywood Presbyterian",
    "phone": "(323) 413-3000",
    "hospitalCode": "QOA",
    "region": "Central",
    "address": "1300 North Vermont Avenue, Los Angeles, CA  90027",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "HMH",
    "name": "Huntington Hospital",
    "shortName": "Huntington",
    "phone": "(626) 397-5000",
    "hospitalCode": "HMH",
    "region": "East",
    "address": "100 West California Boulevard, Pasadena, CA  91105",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "KFA",
    "name": "Baldwin Park",
    "shortName": "Baldwin Park",
    "phone": "(626) 851-1011",
    "hospitalCode": "KFA",
    "region": "East",
    "address": "1011 Baldwin Park Boulevard, Baldwin Park, CA  91706",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "KFB",
    "name": "Kaiser Foundation Hospital - Downey",
    "shortName": "Kaiser Foundation - Downey",
    "phone": "(562) 920-3023",
    "hospitalCode": "KFB",
    "region": "East",
    "address": "9333 Imperial Highway, Downey, CA  90242",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "KFL",
    "name": "Angeles",
    "shortName": "Angeles",
    "phone": "(323) 783-4011",
    "hospitalCode": "KFL",
    "region": "Central",
    "address": "4867 Sunset Boulevard, Los Angeles, CA  90027",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "KFP",
    "name": "Panorama City",
    "shortName": "Panorama City",
    "phone": "(818) 375-2000",
    "hospitalCode": "KFP",
    "region": "North",
    "address": "13652 Cantara Street, Panorama City, CA  91402",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "KFH",
    "name": "South Bay",
    "shortName": "South Bay",
    "phone": "(310) 325-5111",
    "hospitalCode": "KFH",
    "region": "South",
    "address": "25825 South Vermont Avenue, Harbor City, CA  90710",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "KFW",
    "name": "West Los Angeles",
    "shortName": "West Los Angeles",
    "phone": "(323) 857-2000",
    "hospitalCode": "KFW",
    "region": "West",
    "address": "6041 Cadillac Avenue, Los Angeles, CA  90034",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "KFO",
    "name": "Woodland Hills",
    "shortName": "Woodland Hills",
    "phone": "(818) 719-2000",
    "hospitalCode": "KFO",
    "region": "North",
    "address": "5601 De Soto Avenue, Woodland Hills, CA  91367",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "LMC",
    "name": "Los Angeles General Medical Center",
    "shortName": "Los Angeles General",
    "phone": "(323) 409-2800",
    "hospitalCode": "LMC",
    "region": "Central",
    "address": "1200 North State Street, Los Angeles, CA  90033",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "MLK",
    "name": "Street",
    "shortName": "Street",
    "phone": "(424) 388-8000",
    "hospitalCode": "MLK",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "MHG",
    "name": "Memorial Hospital of Gardena",
    "shortName": "Memorial of Gardena",
    "phone": "(310) 532-4200",
    "hospitalCode": "MHG",
    "region": "South",
    "address": "1145 West Redondo Beach Boulevard, Gardena, CA  90247",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "LBM",
    "name": "Center",
    "shortName": "Center",
    "phone": "(562) 933-2000",
    "hospitalCode": "LBM",
    "region": "South",
    "address": "2801 Atlantic Avenue, Long Beach, CA  90806",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "MCP",
    "name": "Mission Community Hospital",
    "shortName": "Mission Community",
    "phone": "(818) 787-2222",
    "hospitalCode": "MCP",
    "region": "North",
    "address": "14850 Roscoe Boulevard, Panorama City, CA  91402",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "MPH",
    "name": "Monterey Park Hospital",
    "shortName": "Monterey Park",
    "phone": "(626) 570-9000",
    "hospitalCode": "MPH",
    "region": "East",
    "address": "900 South Atlantic Boulevard, Monterey Park, CA  91754",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "NOR",
    "name": "Norwalk Community Hospital",
    "shortName": "Norwalk Community",
    "phone": "(562) 863-4763",
    "hospitalCode": "NOR",
    "region": "South",
    "address": "13222 Bloomfield Avenue, Norwalk, CA 90650",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "OVM",
    "name": "Olive View Medical Center",
    "shortName": "Olive View",
    "phone": "(747) 210-3000",
    "hospitalCode": "OVM",
    "region": "North",
    "address": "14445 Olive View Drive, Sylmar, CA  91342",
    "capabilities": [
      "Base Hospital",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "PAC",
    "name": "Pacifica Hospital of the Valley",
    "shortName": "Pacifica of the Valley",
    "phone": "(818) 767-3310",
    "hospitalCode": "PAC",
    "region": "North",
    "address": "9449 San Fernando Road, Sun Valley, CA  91352",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "LCH",
    "name": "Palmdale Regional Medical Center",
    "shortName": "Palmdale Regional",
    "phone": "(661) 382-5000",
    "hospitalCode": "LCH",
    "region": "North",
    "address": "38600 Medical Center Drive, Palmdale, CA 93551",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "DCH",
    "name": "Downey, CA 90241",
    "shortName": "Downey, CA 90241",
    "phone": "(562) 904-5000",
    "hospitalCode": "DCH",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "GSH",
    "name": "PIH Health Good Samaritan Hospital",
    "shortName": "PIH Good Samaritan",
    "phone": "(213) 977-2121",
    "hospitalCode": "GSH",
    "region": "Central",
    "address": "1225 Wilshire Blvd., Los Angeles, CA  90017",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "PIH",
    "name": "PIH Health Whittier Hospital",
    "shortName": "PIH Whittier",
    "phone": "(562) 698-0811",
    "hospitalCode": "PIH",
    "region": "East",
    "address": "12401 East Washington Boulevard, Whittier, CA  90602",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "PVC",
    "name": "Medical Center",
    "shortName": "",
    "phone": "(909) 623-8715",
    "hospitalCode": "PVC",
    "region": "East",
    "address": "1798 North Garey Avenue, Pomona, CA  91767",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "TRM",
    "name": "Medical Center",
    "shortName": "",
    "phone": "(818) 881-0800",
    "hospitalCode": "TRM",
    "region": "North",
    "address": "18321 Clark Street, Tarzana, CA  91356",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "HCH",
    "name": "Providence Holy Cross Medical Center",
    "shortName": "Providence Holy Cross",
    "phone": "(818) 365-8051",
    "hospitalCode": "HCH",
    "region": "North",
    "address": "15031 Rinaldi Street, Mission Hills, CA  91345",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "SPP",
    "name": "Medical Center - San Pedro",
    "shortName": "- San Pedro",
    "phone": "(310) 832-3311",
    "hospitalCode": "SPP",
    "region": "South",
    "address": "1300 West Seventh Street, San Pedro, CA  90732",
    "capabilities": [
      "Base Hospital",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "LCM",
    "name": "Medical Center - Torrance",
    "shortName": "- Torrance",
    "phone": "(310) 540-7676",
    "hospitalCode": "LCM",
    "region": "South",
    "address": "4101 Torrance Boulevard, Torrance, CA  90503",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "SJH",
    "name": "Providence Saint John's Health Center",
    "shortName": "Providence Saint John's",
    "phone": "(310) 829-5511",
    "hospitalCode": "SJH",
    "region": "West",
    "address": "2121 Santa Monica Blvd., Santa Monica, CA  90404",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "SJS",
    "name": "Center",
    "shortName": "Center",
    "phone": "(818) 843-5111",
    "hospitalCode": "SJS",
    "region": "North",
    "address": "501 South Buena Vista Street, Burbank, CA  91505",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "UCL",
    "name": "Ronald Reagan UCLA Medical Center",
    "shortName": "Ronald Reagan UCLA",
    "phone": "(310) 825-9111",
    "hospitalCode": "UCL",
    "region": "West",
    "address": "757 Westwood Plaza, Los Angeles, CA  90095",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "Pediatric Trauma Center",
      "Pediatric Trauma Center (PTC)",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "SDC",
    "name": "San Dimas Community Hospital",
    "shortName": "San Dimas Community",
    "phone": "(909) 599-6811",
    "hospitalCode": "SDC",
    "region": "East",
    "address": "1350 West Covina Boulevard, San Dimas, CA  91773",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "SGC",
    "name": "San Gabriel Valley Medical Center",
    "shortName": "San Gabriel Valley",
    "phone": "(626) 289-5454",
    "hospitalCode": "SGC",
    "region": "East",
    "address": "438 West La Tunas Drive, San Gabriel, CA  91776",
    "capabilities": [
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "SMH",
    "name": "Santa Monica-UCLA Medical Center",
    "shortName": "Santa Monica-UCLA",
    "phone": "(310) 319-4000",
    "hospitalCode": "SMH",
    "region": "West",
    "address": "1250 16th Street, Santa Monica, CA  90404",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center",
      "SART Center"
    ],
    "available24_7": true
  },
  {
    "id": "SOC",
    "name": "Sherman Oaks Hospital",
    "shortName": "Sherman Oaks",
    "phone": "(818) 981-7111",
    "hospitalCode": "SOC",
    "region": "North",
    "address": "4929 Van Nuys Boulevard, Sherman Oaks, CA  91403",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "BMC",
    "name": "Culver City",
    "shortName": "Culver City",
    "phone": "(310) 836-7000",
    "hospitalCode": "BMC",
    "region": "West",
    "address": "3828 Delmas Terrace, Culver City, CA  90231",
    "capabilities": [],
    "available24_7": true
  },
  {
    "id": "SFM",
    "name": "St. Francis Medical Center",
    "shortName": "St. Francis",
    "phone": "(310) 900-8900",
    "hospitalCode": "SFM",
    "region": "South",
    "address": "3630 East Imperial Highway, Lynwood, CA  90262",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "TOR",
    "name": "Torrance Memorial Medical Center",
    "shortName": "Torrance Memorial",
    "phone": "(310) 325-9110",
    "hospitalCode": "TOR",
    "region": "Central",
    "address": "3330 West Lomita Boulevard, Torrance, CA  90505",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "DHL",
    "name": "UCI Health – Lakewood",
    "shortName": "UCI – Lakewood",
    "phone": "(562) 531-2550",
    "hospitalCode": "DHL",
    "region": "South",
    "address": "3700 S. Street, Lakewood, CA  90712",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "HWH",
    "name": "UCLA West Valley Medical Center",
    "shortName": "UCLA West Valley",
    "phone": "(818) 676-4000",
    "hospitalCode": "HWH",
    "region": "North",
    "address": "7300 Medical Center Drive, West Hills, CA  91307",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "AMH",
    "name": "USC Arcadia Hospital",
    "shortName": "USC Arcadia",
    "phone": "(626) 898-8000",
    "hospitalCode": "AMH",
    "region": "East",
    "address": "300 West Huntington Drive, Arcadia, CA  91007",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "VHH",
    "name": "USC Verdugo Hills Hospital",
    "shortName": "USC Verdugo Hills",
    "phone": "(818) 790-7100",
    "hospitalCode": "VHH",
    "region": "North",
    "address": "1812 Verdugo Boulevard, Glendale, CA  91208",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "VPH",
    "name": "Valley Presbyterian Hospital",
    "shortName": "Valley Presbyterian",
    "phone": "(818) 782-6600",
    "hospitalCode": "VPH",
    "region": "North",
    "address": "15107 Van Owen Street, Van Nuys, CA  91405",
    "capabilities": [
      "Base Hospital",
      "Pediatric Medical Center (PMC)"
    ],
    "available24_7": true
  },
  {
    "id": "WHH",
    "name": "Whittier Hospital Medical Center",
    "shortName": "Whittier",
    "phone": "(562) 945-3561",
    "hospitalCode": "WHH",
    "region": "East",
    "address": "9080 Colima Road, Whittier, CA  90605",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "LPI",
    "name": "La Palma, CA  90623",
    "shortName": "La Palma, CA  90623",
    "phone": "(714) 670-7400",
    "hospitalCode": "LPI",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  },
  {
    "id": "LRR",
    "name": "Thousand Oaks, CA  91360",
    "shortName": "Thousand Oaks, CA  91360",
    "phone": "(805) 497-2727",
    "hospitalCode": "LRR",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "SJD",
    "name": "Fullerton, CA  92635",
    "shortName": "Fullerton, CA  92635",
    "phone": "(714) 871-3280",
    "hospitalCode": "SJD",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "LAG",
    "name": "Los Alamitos, CA  90720",
    "shortName": "Los Alamitos, CA  90720",
    "phone": "(562) 598-1311",
    "hospitalCode": "LAG",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital",
      "Level I Trauma Center"
    ],
    "available24_7": true
  },
  {
    "id": "UCI",
    "name": "Orange, CA  92868",
    "shortName": "Orange, CA  92868",
    "phone": "(714) 456-6011",
    "hospitalCode": "UCI",
    "region": "Central",
    "address": "Address not available",
    "capabilities": [
      "Base Hospital"
    ],
    "available24_7": true
  }
];

// Base hospitals (those with Base Hospital capability)
export const BASE_HOSPITALS = ALL_HOSPITALS.filter(h =>
  h.capabilities.includes('Base Hospital')
);

// Helper functions
export function getHospitalByCode(code: string): Hospital | undefined {
  return ALL_HOSPITALS.find(h => h.hospitalCode === code);
}

export function getHospitalsByRegion(region: string): Hospital[] {
  return ALL_HOSPITALS.filter(h => h.region === region);
}

export function getHospitalsByCapability(capability: string): Hospital[] {
  return ALL_HOSPITALS.filter(h =>
    h.capabilities.some(cap =>
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
}

export const MEDICAL_ALERT_CENTER = {
  name: 'Medical Alert Center (MAC)',
  phone: '(562) 347-1789',
  alternatePhone: '(866) 940-4401',
  usage: 'For specialized consultations (ECMO, hyperbaric emergencies, disease outbreaks)',
  available24_7: true
};
