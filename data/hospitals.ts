

export type Capability = 
  | 'Trauma Level I' 
  | 'Trauma Level II' 
  | 'STEMI' 
  | 'Stroke Comprehensive' 
  | 'Stroke Primary' 
  | 'Pediatric Trauma' 
  | 'Pediatric Medical' 
  | 'Burn' 
  | 'ECMO' 
  | 'Perinatal'
  | 'EDAP'
  | 'Disaster Resource';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  capabilities: Capability[];
  lat?: number;
  lng?: number;
}

export const hospitals: Hospital[] = [
  // --- Trauma Level I Centers ---
  {
    id: "lac-usc",
    name: "LAC+USC Medical Center",
    address: "2051 Marengo St, Los Angeles, CA 90033",
    phone: "(323) 409-1000",
    capabilities: ['Trauma Level I', 'Pediatric Trauma', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'Burn', 'ECMO', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.056, lng: -118.208
  },
  {
    id: "harbor-ucla",
    name: "Harbor-UCLA Medical Center",
    address: "1000 W Carson St, Torrance, CA 90509",
    phone: "(310) 222-2345",
    capabilities: ['Trauma Level I', 'Pediatric Trauma', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'ECMO', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 33.829, lng: -118.288
  },
  {
    id: "cedars",
    name: "Cedars-Sinai Medical Center",
    address: "8700 Beverly Blvd, Los Angeles, CA 90048",
    phone: "(310) 423-3277",
    capabilities: ['Trauma Level I', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'ECMO', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.075, lng: -118.380
  },
  {
    id: "ucla-reagan",
    name: "Ronald Reagan UCLA Medical Center",
    address: "757 Westwood Plaza, Los Angeles, CA 90095",
    phone: "(310) 825-9111",
    capabilities: ['Trauma Level I', 'Pediatric Trauma', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'ECMO', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.066, lng: -118.445
  },
  {
    id: "long-beach-memorial",
    name: "Long Beach Memorial Medical Center",
    address: "2801 Atlantic Ave, Long Beach, CA 90806",
    phone: "(562) 933-2000",
    capabilities: ['Trauma Level II', 'Pediatric Trauma', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 33.808, lng: -118.186
  },

  // --- Trauma Level II Centers ---
  {
    id: "antelope-valley",
    name: "Antelope Valley Hospital",
    address: "1600 W Avenue J, Lancaster, CA 93534",
    phone: "(661) 949-5000",
    capabilities: ['Trauma Level II', 'Pediatric Medical', 'STEMI', 'Stroke Primary', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.692, lng: -118.146
  },
  {
    id: "henry-mayo",
    name: "Henry Mayo Newhall Hospital",
    address: "23845 McBean Pkwy, Valencia, CA 91355",
    phone: "(661) 200-2000",
    capabilities: ['Trauma Level II', 'STEMI', 'Stroke Primary', 'EDAP', 'Disaster Resource'],
    lat: 34.408, lng: -118.556
  },
  {
    id: "holy-cross",
    name: "Providence Holy Cross Medical Center",
    address: "15031 Rinaldi St, Mission Hills, CA 91345",
    phone: "(818) 365-8051",
    capabilities: ['Trauma Level II', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource'],
    lat: 34.279, lng: -118.468
  },
  {
    id: "huntington",
    name: "Huntington Hospital",
    address: "100 W California Blvd, Pasadena, CA 91105",
    phone: "(626) 397-5000",
    capabilities: ['Trauma Level II', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.135, lng: -118.150
  },
  {
    id: "northridge",
    name: "Northridge Hospital Medical Center",
    address: "18300 Roscoe Blvd, Northridge, CA 91325",
    phone: "(818) 885-8500",
    capabilities: ['Trauma Level II', 'Pediatric Trauma', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource'],
    lat: 34.221, lng: -118.538
  },
  {
    id: "pomona-valley",
    name: "Pomona Valley Hospital Medical Center",
    address: "1798 N Garey Ave, Pomona, CA 91767",
    phone: "(909) 865-9500",
    capabilities: ['Trauma Level II', 'Pediatric Medical', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 34.078, lng: -117.760
  },
  {
    id: "st-francis",
    name: "St. Francis Medical Center",
    address: "3630 E Imperial Hwy, Lynwood, CA 90262",
    phone: "(310) 900-8900",
    // Updated Feb 2025: Now Comprehensive Stroke Center per LA County EMS Agency
    capabilities: ['Trauma Level II', 'STEMI', 'Stroke Comprehensive', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 33.928, lng: -118.204
  },
  {
    id: "st-mary",
    name: "St. Mary Medical Center",
    address: "1050 Linden Ave, Long Beach, CA 90813",
    phone: "(562) 491-9000",
    capabilities: ['Trauma Level II', 'STEMI', 'Stroke Primary', 'EDAP', 'Disaster Resource'],
    lat: 33.780, lng: -118.188
  },
  {
    id: "california-hospital",
    name: "Dignity Health - California Hospital",
    address: "1401 S Grand Ave, Los Angeles, CA 90015",
    phone: "(213) 748-2411",
    capabilities: ['Trauma Level II', 'STEMI', 'Stroke Primary', 'Perinatal'],
    lat: 34.038, lng: -118.261
  },

  // --- Specialized Pediatric Centers ---
  {
    id: "chla",
    name: "Children's Hospital Los Angeles",
    address: "4650 Sunset Blvd, Los Angeles, CA 90027",
    phone: "(323) 660-2450",
    capabilities: ['Pediatric Trauma', 'Pediatric Medical', 'ECMO', 'EDAP', 'Disaster Resource'],
    lat: 34.097, lng: -118.290
  },
  {
    id: "miller-childrens",
    name: "Miller Children's Hospital",
    address: "2801 Atlantic Ave, Long Beach, CA 90806",
    phone: "(562) 933-5437",
    capabilities: ['Pediatric Trauma', 'Pediatric Medical', 'EDAP', 'Perinatal'],
    lat: 33.808, lng: -118.186
  },

  // --- Other Key Specialty Centers ---
  {
    id: "torrance-memorial",
    name: "Torrance Memorial Medical Center",
    address: "3330 Lomita Blvd, Torrance, CA 90505",
    phone: "(310) 325-9110",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'Burn', 'EDAP', 'Disaster Resource', 'Perinatal'],
    lat: 33.816, lng: -118.342
  },
  {
    id: "west-hills",
    name: "West Hills Hospital",
    address: "7300 Medical Center Dr, West Hills, CA 91307",
    phone: "(818) 676-4000",
    capabilities: ['STEMI', 'Stroke Primary', 'Burn', 'EDAP'],
    lat: 34.200, lng: -118.632
  },
  {
    id: "usc-arcadia",
    name: "USC Arcadia Hospital",
    address: "300 W Huntington Dr, Arcadia, CA 91007",
    phone: "(626) 898-8000",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'EDAP', 'Perinatal'],
    lat: 34.136, lng: -118.040
  },
  {
    id: "good-sam",
    name: "Good Samaritan Hospital",
    address: "1225 Wilshire Blvd, Los Angeles, CA 90017",
    phone: "(213) 977-2121",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'Perinatal'],
    lat: 34.053, lng: -118.262
  },
  {
    id: "white-memorial",
    name: "White Memorial Medical Center",
    address: "1720 Cesar E Chavez Ave, Los Angeles, CA 90033",
    phone: "(323) 268-5000",
    capabilities: ['STEMI', 'Stroke Primary', 'EDAP', 'Perinatal'],
    lat: 34.048, lng: -118.212
  },
  {
    id: "presbyterian-intercommunity",
    name: "PIH Health - Whittier",
    address: "12401 Washington Blvd, Whittier, CA 90602",
    phone: "(562) 698-0811",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'EDAP', 'Perinatal'],
    lat: 33.969, lng: -118.033
  },
  {
    id: "kaiser-sunset",
    name: "Kaiser Permanente LAMC",
    address: "4867 Sunset Blvd, Los Angeles, CA 90027",
    phone: "(800) 954-8000",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'EDAP'],
    lat: 34.098, lng: -118.293
  },
  {
    id: "valley-pres",
    name: "Valley Presbyterian Hospital",
    address: "15107 Vanowen St, Van Nuys, CA 91405",
    phone: "(818) 782-6600",
    capabilities: ['STEMI', 'Stroke Primary', 'EDAP', 'Perinatal'],
    lat: 34.193, lng: -118.460
  },
  {
    id: "providence-tarzana",
    name: "Providence Cedars-Sinai Tarzana",
    address: "18321 Clark St, Tarzana, CA 91356",
    phone: "(818) 881-0800",
    capabilities: ['STEMI', 'Stroke Primary', 'Pediatric Medical', 'EDAP', 'Perinatal'],
    lat: 34.171, lng: -118.538
  },
  {
    id: "glendale-adventist",
    name: "Adventist Health Glendale",
    address: "1509 Wilson Terrace, Glendale, CA 91206",
    phone: "(818) 409-8000",
    capabilities: ['STEMI', 'Stroke Comprehensive', 'EDAP'],
    lat: 34.150, lng: -118.239
  }
];
