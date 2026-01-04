
import { Protocol } from '../../../types';

export const tocAdmin: Protocol[] = [
  // --- Series 200: EMS Agency ---
  { 
    id: "214", refNo: "Ref. 214", title: "Base Hospital Reporting", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "report", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Base Reporting", subtitle: "Ref. 214" }] },
      { type: "text", content: "Paramedics must contact Base Hospital for all patients meeting Base Contact criteria (Ref. 808). Report includes: Age, Sex, CC, Vitals, Treatment, ETA." }
    ] 
  },
  { 
    id: "228", refNo: "Ref. 228", title: "ReddiNet Utilization", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "wifi_tethering", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "ReddiNet", subtitle: "Ref. 228" }] },
      { type: "text", content: "ReddiNet is used for MCI management and hospital diversion status tracking. ED Saturation, CT diversion, and Trauma diversion statuses are updated here." }
    ] 
  },

  // --- Series 300: Base Hospitals ---
  { 
    id: "300", refNo: "Ref. 300", title: "Base Hospital Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "blue", 
    sections: [{ type: "header", items: [{ title: "Base Standards", subtitle: "Ref. 300" }] }] 
  },
  { 
    id: "308", refNo: "Ref. 308", title: "Trauma Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "personal_injury", color: "orange", 
    sections: [{ type: "header", items: [{ title: "Trauma Standards", subtitle: "Ref. 308" }] }] 
  },
  { 
    id: "316", refNo: "Ref. 316", title: "EDAP Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "blue", 
    sections: [
      { type: "header", items: [{ title: "EDAP Standards", subtitle: "Ref. 316" }] },
      { type: "text", content: "Emergency Departments Approved for Pediatrics (EDAP) must meet staffing, equipment, and training requirements to receive 9-1-1 pediatric patients." }
    ] 
  },
  { 
    id: "320", refNo: "Ref. 320", title: "STEMI Receiving Center", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "monitor_heart", color: "red", 
    sections: [
      { type: "header", items: [{ title: "SRC Standards", subtitle: "Ref. 320" }] },
      { type: "text", content: "STEMI Receiving Centers (SRC) must have 24/7 Cath Lab availability and accept all STEMI patients regardless of bed status." }
    ] 
  },
  { 
    id: "322", refNo: "Ref. 322", title: "Stroke Receiving Center", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "neurology", color: "blue", 
    sections: [
      { type: "header", items: [{ title: "Stroke Center", subtitle: "Ref. 322" }] },
      { type: "text", content: "Primary Stroke Centers (PSC) and Comprehensive Stroke Centers (CSC) must have 24/7 CT and Neurology capability." }
    ] 
  },

  // --- Series 400: Provider Agencies ---
  { 
    id: "406", refNo: "Ref. 406", title: "Paramedic Provider Authorization", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate", 
    sections: [{ type: "header", items: [{ title: "Provider Auth", subtitle: "Ref. 406" }] }] 
  },
  { 
    id: "414", refNo: "Ref. 414", title: "Critical Care Transport (CCT)", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "ambulance", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "CCT", subtitle: "Ref. 414" }] },
      { type: "text", content: "CCT units are staffed by an RN + EMT/Paramedic. Used for interfacility transport of patients exceeding paramedic scope (e.g. Ventilators, drips)." }
    ] 
  },
  { 
    id: "418", refNo: "Ref. 418", title: "EMS Aircraft Authorization", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "helicopter", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "EMS Aircraft", subtitle: "Ref. 418" }] },
      { type: "text", content: "Air squads must be authorized by the EMS Agency. Classification: Air Ambulance (Transport) vs Rescue Aircraft (Hoist)." }
    ] 
  },
  
  // Fillers for completeness without full detail
  { id: "100", refNo: "Ref. 100", title: "State Law and Regulation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate", sections: [] },
  { id: "200", refNo: "Ref. 200", title: "Local EMS Agency", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "apartment", color: "slate", sections: [] },
  { id: "202", refNo: "Ref. 202", title: "Policy Development", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "policy", color: "slate", sections: [] },
  { id: "408", refNo: "Ref. 408", title: "ALS Unit Staffing", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "groups", color: "slate", sections: [] }
];
