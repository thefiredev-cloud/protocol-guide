
import { Protocol } from '../../../types';

export const tocPolicies: Protocol[] = [
  // --- Series 500: Operations / Transport ---
  { 
    id: "503", refNo: "Ref. 503", title: "Hospital Diversion Guidelines", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "traffic", color: "red", 
    sections: [
      { type: "header", items: [{ title: "Hospital Diversion", subtitle: "Ref. 503" }] },
      { type: "accordion", title: "Diversion Categories", items: [
        { title: "ED Saturation", content: "Emergency Dept is fully committed. Ambulance traffic diverted to next open MAR." },
        { title: "CT Scanner Failure", content: "Divert Stroke/Trauma patients requiring CT." },
        { title: "Internal Disaster", content: "Facility physically compromised (fire, flood, power loss). CLOSED to all traffic." },
        { title: "Trauma Center Overload", content: "Trauma Service fully committed. Trauma patients diverted." }
      ]}
    ] 
  },
  { 
    id: "504", refNo: "Ref. 504", title: "Trauma Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "personal_injury", color: "orange", 
    sections: [
      { type: "header", items: [{ title: "Trauma Destination", subtitle: "Ref. 504" }] },
      { type: "text", title: "Principle", content: "Patients meeting Trauma Criteria (Ref. 506) shall be transported to the designated Trauma Center." },
      { type: "accordion", title: "Special Circumstances", items: [
        { title: "Extremis", content: "Unmanageable airway or uncontrollable hemorrhage: Transport to MAR." },
        { title: "Pediatrics", content: "Steps:<br>1. Pediatric Trauma Center (PTC)<br>2. Adult Trauma Center (if PTC > 30 min)<br>3. PMC (if Trauma Centers > 30 min)" }
      ]}
    ] 
  },
  { 
    id: "508", refNo: "Ref. 508", title: "Sexual Assault Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "support", color: "blue", 
    sections: [
      { type: "header", items: [{ title: "SART Destination", subtitle: "Ref. 508" }] },
      { type: "text", content: "Patients requesting exam/evidence collection should be transported to a SART (Sexual Assault Response Team) Center if medical stability allows." }
    ] 
  },
  { 
    id: "515", refNo: "Ref. 515", title: "Air Ambulance Activation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "helicopter", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Air Ambulance", subtitle: "Ref. 515" }] },
      { type: "list", title: "Activation Criteria", items: [
        { title: "Time Critical", content: "Ground transport > 30 mins to required specialty center (Trauma, STEMI, Stroke)." },
        { title: "Inaccessible", content: "Location inaccessible by ground (mountains, canyons)." },
        { title: "MCI", content: "Multi-Casualty Incident requiring rapid distribution." }
      ]}
    ] 
  },
  { 
    id: "522", refNo: "Ref. 522", title: "Patient Offload", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "timer", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Patient Offload (APOT)", subtitle: "Ref. 522" }] },
      { type: "text", content: "Standard offload time is < 20 minutes. Providers must monitor patient until transfer of care (report given + bed assigned)." }
    ] 
  },
  { 
    id: "526", refNo: "Ref. 526", title: "Behavioral Health Transport", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "psychology", color: "indigo", 
    sections: [
      { type: "header", items: [{ title: "Psych Transport", subtitle: "Ref. 526" }] },
      { type: "text", content: "Patients on 5150 hold generally go to MAR. May go directly to Psychiatric Urgent Care Center (PUCC) if medical clearance criteria are met (Vitals normal, no active medical complaint)." }
    ] 
  },

  // --- Series 800: Field Policies ---
  { 
    id: "806", refNo: "Ref. 806", title: "Procedures Prior to Base Contact", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "call", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Prior to Base Contact", subtitle: "Ref. 806" }] },
      { type: "text", content: "Paramedics may perform Standing Order interventions prior to Base contact. Base contact should be made as soon as practical." }
    ] 
  },
  { 
    id: "812", refNo: "Ref. 812", title: "Scene Management", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Scene Management", subtitle: "Ref. 812" }] },
      { type: "text", content: "The most qualified medical provider on scene (typically the Paramedic) has authority over patient care management, unless a Physician is present." }
    ] 
  },
  { 
    id: "823", refNo: "Ref. 823", title: "Elder/Dependent Adult Abuse", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "elderly", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Elder Abuse", subtitle: "Ref. 823" }] },
      { type: "text", content: "Mandated reporting for physical abuse, neglect, financial abuse of elders (65+) or dependent adults." },
      { type: "info", title: "Reporting", content: "Verbal report ASAP. Written report (SOC 341) within 2 working days." }
    ] 
  },
  { 
    id: "834", refNo: "Ref. 834", title: "Patient Restraint", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "lock", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Patient Restraint", subtitle: "Ref. 834" }] },
      { type: "warning", content: "NEVER restrain patient in prone position (risk of positional asphyxia)." },
      { type: "list", title: "Guidelines", items: [
        { title: "Type", content: "Soft restraints (leather/cloth). Handcuffs only by Law Enforcement." },
        { title: "Monitoring", content: "Check Circulation/Motor/Sensation (CMS) every 15 minutes." },
        { title: "Chemical", content: "Utilize Midazolam (5mg) for severe agitation per TP-1229." }
      ]}
    ] 
  },
  { 
    id: "836", refNo: "Ref. 836", title: "Interfacility Transport", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "ambulance", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "IFT", subtitle: "Ref. 836" }] },
      { type: "text", content: "Paramedics may transport patients between facilities if the patient requires monitoring/therapy within the Paramedic Scope of Practice." }
    ] 
  },
  { 
    id: "838", refNo: "Ref. 838", title: "Taser / Conducted Energy Device", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "flash_on", color: "slate", 
    sections: [
      { type: "header", items: [{ title: "Taser/CED", subtitle: "Ref. 838" }] },
      { type: "accordion", title: "Management", items: [
        { title: "Probe Removal", content: "Paramedics may remove probes unless in face, neck, groin, or spine." },
        { title: "Assessment", content: "Eval for falls/trauma. Monitor ECG (risk of dysrhythmia is low but possible)." }
      ]}
    ] 
  },
  { 
    id: "840", refNo: "Ref. 840", title: "Safe Surrender of Infants", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "pink", 
    sections: [
      { type: "header", items: [{ title: "Safe Surrender", subtitle: "Ref. 840" }] },
      { type: "text", content: "Fire Stations and Hospitals are Safe Surrender sites for infants <= 72 hours old. Anonymity is guaranteed if infant has no signs of abuse." }
    ] 
  },
  // --- Disaster & Training (Brief) ---
  { 
    id: "1100", refNo: "Ref. 1100", title: "Disaster Management", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "warning", color: "red", 
    sections: [{ type: "header", items: [{ title: "Disaster Program", subtitle: "Ref. 1100" }] }] 
  },
  { 
    id: "1006", refNo: "Ref. 1006", title: "Paramedic Accreditation", category: "Training", type: "Policy", lastUpdated: "2024", icon: "verified", color: "slate", 
    sections: [{ type: "header", items: [{ title: "Accreditation", subtitle: "Ref. 1006" }] }] 
  }
];
