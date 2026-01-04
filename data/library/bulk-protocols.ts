import { Protocol, ProtocolCategory } from '../../types';

// Helper to generate protocol stubs with reference information
const createStub = (id: string, refNo: string, title: string, category: ProtocolCategory, icon: string, color: string): Protocol => ({
  id, 
  refNo, 
  title, 
  category, 
  type: "Policy", 
  lastUpdated: "2025", 
  icon, 
  color,
  sections: [
    { 
      type: "header", 
      items: [{ title, subtitle: refNo }] 
    },
    {
      type: "text",
      title: "Policy Summary",
      content: `This entry serves as a digital reference for <b>${refNo}: ${title}</b> within the LA County Prehospital Care Manual.<br><br>While this app provides quick access to key protocols, please refer to the official LA County DHS documentation for the full legal text, detailed procedure steps, and administrative nuances associated with this policy.`
    },
    {
        type: "info",
        title: "Official Source",
        content: "The content of this protocol is sourced from the Los Angeles County EMS Agency Prehospital Care Manual. Tap the 'View Official Document' button below to access the full PDF on the DHS website."
    }
  ]
});

export const bulkProtocols: Protocol[] = [
  // --- 100 Series: General ---
  createStub("100", "Ref. 100", "State Law and Regulation", "Administrative", "gavel", "slate"),
  createStub("101", "Ref. 101", "EMS Plan", "Administrative", "description", "slate"),
  
  // --- 200 Series: EMS Agency ---
  createStub("200", "Ref. 200", "EMS Agency Role", "Administrative", "apartment", "slate"),
  createStub("201", "Ref. 201", "Medical Management of Prehospital Care", "Administrative", "medical_services", "slate"),
  createStub("202", "Ref. 202", "Policy Development", "Administrative", "policy", "slate"),
  createStub("206", "Ref. 206", "EMS Commission Ordinance", "Administrative", "policy", "slate"),
  createStub("208", "Ref. 208", "Standards for EMS Personnel", "Administrative", "badge", "slate"),
  createStub("210", "Ref. 210", "EMS Agency Org Chart", "Administrative", "account_tree", "slate"),
  createStub("212", "Ref. 212", "Ambulance Ordinance", "Administrative", "ambulance", "slate"),
  createStub("214", "Ref. 214", "Base Hospital Reporting", "Administrative", "call", "slate"),
  createStub("216", "Ref. 216", "Advanced Provider Reporting", "Administrative", "call", "slate"),
  createStub("218", "Ref. 218", "EMS Quality Improvement", "Administrative", "analytics", "slate"),
  createStub("226", "Ref. 226", "Private Provider Agreements", "Administrative", "contract", "slate"),
  createStub("228", "Ref. 228", "ReddiNet Utilization", "Administrative", "wifi_tethering", "slate"),

  // --- 300 Series: Base Hospitals (Removed promoted protocols) ---
  createStub("304", "Ref. 304", "Paramedic Base Hospital Standards", "Base Hospital", "emergency", "blue"),
  createStub("308", "Ref. 308", "Trauma Center Standards", "Base Hospital", "personal_injury", "orange"),
  createStub("310", "Ref. 310", "Burn Center Standards", "Base Hospital", "local_fire_department", "orange"),
  createStub("312", "Ref. 312", "Pediatric Critical Care Center", "Base Hospital", "child_care", "purple"),
  createStub("314", "Ref. 314", "Perinatal Center Standards", "Base Hospital", "pregnant_woman", "pink"),
  createStub("316", "Ref. 316", "EDAP Standards", "Base Hospital", "child_care", "purple"),
  createStub("318", "Ref. 318", "PMC Standards", "Base Hospital", "child_care", "purple"),
  createStub("320", "Ref. 320", "STEMI Receiving Center", "Base Hospital", "monitor_heart", "red"),
  createStub("322", "Ref. 322", "Stroke Receiving Center", "Base Hospital", "neurology", "indigo"),
  createStub("324", "Ref. 324", "SART Standards", "Base Hospital", "support", "blue"),
  createStub("326", "Ref. 326", "Psych Urgent Care Standards", "Base Hospital", "psychology", "indigo"),

  // --- 400 Series: Provider Agencies ---
  createStub("401", "Ref. 401", "Provider Agency Directory", "Provider Agencies", "contact_phone", "slate"),
  createStub("406", "Ref. 406", "Paramedic Provider Authorization", "Provider Agencies", "badge", "slate"),
  createStub("408", "Ref. 408", "ALS Unit Staffing", "Provider Agencies", "groups", "slate"),
  createStub("411", "Ref. 411", "Provider Medical Director", "Provider Agencies", "person", "slate"),
  createStub("412", "Ref. 412", "EMT Provider Authorization", "Provider Agencies", "badge", "slate"),
  createStub("413", "Ref. 413", "Mobile Intensive Care Nurse", "Provider Agencies", "badge", "slate"),
  createStub("414", "Ref. 414", "Critical Care Transport", "Provider Agencies", "ambulance", "slate"),
  createStub("416", "Ref. 416", "Paramedic Assessment Unit", "Provider Agencies", "ambulance", "slate"),
  createStub("418", "Ref. 418", "EMS Aircraft", "Provider Agencies", "helicopter", "slate"),
  createStub("419", "Ref. 419", "Public Safety First Aid", "Provider Agencies", "medical_services", "slate"),
  createStub("420", "Ref. 420", "Tactical EMS", "Provider Agencies", "military_tech", "slate"),
  createStub("450", "Ref. 450", "Ambulance Ordinance", "Provider Agencies", "ambulance", "slate"),

  // --- 500 Series: Operations / Transport ---
  createStub("501", "Ref. 501", "Hospital Directory", "Administrative", "apartment", "blue"),
  createStub("509", "Ref. 509", "Service Area Hospital", "Administrative", "map", "blue"),
  createStub("514", "Ref. 514", "Hospital Helipad Status", "Administrative", "helicopter", "slate"),
  createStub("517", "Ref. 517", "Private Provider Transport", "Administrative", "ambulance", "slate"),
  createStub("518", "Ref. 518", "Deceased Patient Destination", "Administrative", "church", "gray"),
  createStub("524", "Ref. 524", "End of Life Option Act", "Administrative", "description", "gray"),

  // --- 600 Series: Record Keeping ---
  createStub("600", "Ref. 600", "Record Keeping Audit", "Record Keeping", "folder", "slate"),
  createStub("602", "Ref. 602", "Confidentiality", "Record Keeping", "lock", "slate"),
  createStub("604", "Ref. 604", "Data Collection", "Record Keeping", "database", "slate"),
  createStub("606", "Ref. 606", "Documentation of Care", "Record Keeping", "edit_document", "slate"),
  createStub("608", "Ref. 608", "Retention of Records", "Record Keeping", "inventory_2", "slate"),

  // --- 700 Series: Equipment ---
  createStub("701", "Ref. 701", "Supply and Resupply", "Equipment", "inventory", "slate"),
  createStub("702", "Ref. 702", "Controlled Drugs", "Equipment", "medication", "slate"),
  createStub("703", "Ref. 703", "ALS Unit Inventory", "Equipment", "inventory_2", "slate"),
  createStub("704", "Ref. 704", "Assessment Unit Inventory", "Equipment", "inventory_2", "slate"),
  createStub("706", "Ref. 706", "ALS Cart Inventory", "Equipment", "shopping_cart", "slate"),
  createStub("710", "Ref. 710", "BLS Ambulance Inventory", "Equipment", "medical_services", "slate"),
  createStub("712", "Ref. 712", "EMS Aircraft Inventory", "Equipment", "helicopter", "slate"),

  // --- 800 Series: Field Policies ---
  createStub("805", "Ref. 805", "Poison Control", "Policies", "call", "slate"),
  createStub("807", "Ref. 807", "Medical Control HazMat", "Policies", "warning", "slate"),
  createStub("810", "Ref. 810", "Biological Agent Exposure", "Policies", "coronavirus", "slate"),
  createStub("811", "Ref. 811", "Communicable Disease", "Policies", "sick", "slate"),
  createStub("813", "Ref. 813", "Organ Donor", "Policies", "volunteer_activism", "slate"),
  createStub("818", "Ref. 818", "HEAR Radio Use", "Policies", "radio", "slate"),
  createStub("820", "Ref. 820", "Safe Transport", "Policies", "seat_belt", "slate"),
  createStub("822", "Ref. 822", "Child Abuse Reporting", "Policies", "shield", "slate"),
  createStub("823", "Ref. 823", "Elder Abuse Reporting", "Policies", "elderly", "slate"),
  createStub("830", "Ref. 830", "Trial Studies", "Policies", "science", "slate"),
  createStub("832", "Ref. 832", "Refusal of Care", "Policies", "cancel", "slate"),
  createStub("834", "Ref. 834", "Patient Restraint", "Policies", "lock", "slate"),
  createStub("836", "Ref. 836", "Interfacility Transport", "Policies", "ambulance", "slate"),
  createStub("838", "Ref. 838", "Taser / CED", "Policies", "flash_on", "slate"),
  createStub("840", "Ref. 840", "Safe Surrender", "Policies", "child_care", "pink"),
  createStub("842", "Ref. 842", "Transport of Service Animals", "Policies", "pets", "slate"),

  // --- 900 Series: Training ---
  createStub("901", "Ref. 901", "Paramedic Training", "Training", "school", "slate"),
  createStub("903", "Ref. 903", "Paramedic Intern", "Training", "school", "slate"),
  createStub("904", "Ref. 904", "MICN Development", "Training", "school", "slate"),
  createStub("905", "Ref. 905", "EMT Training", "Training", "school", "slate"),
  
  // --- 1000 Series: Certification ---
  createStub("1006", "Ref. 1006", "Paramedic Accreditation", "Training", "badge", "slate"),
  createStub("1010", "Ref. 1010", "MICN Certification", "Training", "badge", "slate"),
  createStub("1012", "Ref. 1012", "EMT Certification", "Training", "badge", "slate"),
  createStub("1013", "Ref. 1013", "CE Requirements", "Training", "school", "slate"),
  createStub("1014", "Ref. 1014", "Paramedic Inactivity", "Training", "hourglass_empty", "slate"),

  // --- 1100 Series: Disaster ---
  createStub("1104", "Ref. 1104", "MCI Management", "Disaster", "groups", "red"),
  createStub("1106", "Ref. 1106", "NDMS Activation", "Disaster", "public", "red"),
  createStub("1108", "Ref. 1108", "Chempack", "Disaster", "science", "red"),
  createStub("1110", "Ref. 1110", "Disaster Data", "Disaster", "analytics", "red"),
  
  // --- 1200 Series: Additional Protocols ---
  createStub("1247", "TP-1247", "Active Shooter / TECC", "Trauma", "swords", "orange"),
  createStub("1275", "TP-1275", "Impalement", "Trauma", "personal_injury", "orange"),
  createStub("1290", "TP-1290", "VAD / LVAD", "Cardiovascular", "monitor_heart", "red"),
  createStub("1291", "TP-1291", "Total Artificial Heart", "Cardiovascular", "monitor_heart", "red"),
  
  // --- 1300 Series: Reference / Peds ---
  createStub("1302", "Ref. 1302", "Airway Management MCG", "General", "pulmonology", "blue"),
  createStub("1317", "Ref. 1317", "Drug Reference", "Pharmacology", "menu_book", "slate"),
  createStub("1373", "Ref. 1373", "Data Dictionary", "Administrative", "analytics", "slate"),
];