
import { Protocol } from '../../types';

export const medications: Protocol[] = [
  {
    id: "MED-ADEN", refNo: "Adenosine", title: "Adenosine", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "science", color: "purple",
    sections: [{ type: "header", items: [{ title: "Adenosine", subtitle: "Antiarrhythmic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose (Adult)", content: "6mg -> 12mg rapid IV push with 20mL flush." }, { title: "Pediatric", content: "0.1mg/kg (Max 6mg) -> 0.2mg/kg (Max 12mg)." }] }]
  },
  {
    id: "MED-ALB", refNo: "Albuterol", title: "Albuterol", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "air", color: "blue",
    sections: [{ type: "header", items: [{ title: "Albuterol", subtitle: "Bronchodilator" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "5mg (6mL) Nebulized. May be continuous." }] }]
  },
  {
    id: "MED-AMIO", refNo: "Amiodarone", title: "Amiodarone", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "monitor_heart", color: "purple",
    sections: [{ type: "header", items: [{ title: "Amiodarone", subtitle: "Antiarrhythmic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Arrest Dose", content: "300mg IV/IO -> 150mg." }, { title: "Tachycardia", content: "150mg IV over 10 min." }] }]
  },
  {
    id: "MED-ASA", refNo: "Aspirin", title: "Aspirin", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "pill", color: "red",
    sections: [{ type: "header", items: [{ title: "Aspirin", subtitle: "Antiplatelet" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "324mg (4 x 81mg chewable tablets) PO." }, { title: "Contraindication", content: "Active GI Bleed, Allergy." }] }]
  },
  {
    id: "MED-ATROP", refNo: "Atropine", title: "Atropine Sulfate", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "monitor_heart", color: "red",
    sections: [{ type: "header", items: [{ title: "Atropine", subtitle: "Anticholinergic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Bradycardia", content: "1mg IV/IO q 3-5 min. Max 3mg." }, { title: "Organophosphate", content: "2mg IV/IO q 5 min until dry secretions." }] }]
  },
  {
    id: "MED-ATRO", refNo: "Atrovent", title: "Atrovent (Ipratropium)", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "air", color: "blue",
    sections: [{ type: "header", items: [{ title: "Atrovent", subtitle: "Bronchodilator" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "0.5mg (2.5mL) Nebulized. Added to first Albuterol dose only." }] }]
  },
  {
    id: "MED-CALC", refNo: "Calcium", title: "Calcium Chloride", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "red",
    sections: [{ type: "header", items: [{ title: "Calcium Chloride", subtitle: "Electrolyte" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Indications", content: "Hyperkalemia, Calcium Channel Blocker OD, Crush Injury." }, { title: "Dose", content: "1g (10mL of 10%) slow IV push." }] }]
  },
  {
    id: "MED-D10", refNo: "Dextrose", title: "Dextrose 10% (D10)", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "water_drop", color: "blue",
    sections: [{ type: "header", items: [{ title: "Dextrose 10%", subtitle: "Carbohydrate" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Hypoglycemia", content: "125mL (12.5g) IV bolus. Recheck BG." }, { title: "Pediatric", content: "5mL/kg IV bolus." }] }]
  },
  {
    id: "MED-BENY", refNo: "Benadryl", title: "Diphenhydramine", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "pill", color: "teal",
    sections: [{ type: "header", items: [{ title: "Diphenhydramine", subtitle: "Antihistamine" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "50mg IV/IM." }, { title: "Indications", content: "Anaphylaxis (adjunct), Dystonic Reaction." }] }]
  },
  {
    id: "MED-EPI1", refNo: "Epinephrine 1:1,000", title: "Epinephrine (1mg/mL)", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "red",
    sections: [{ type: "header", items: [{ title: "Epinephrine 1:1,000", subtitle: "Anaphylaxis / Asthma" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Anaphylaxis", content: "0.5mg IM (Lateral Thigh)." }, { title: "Pediatric", content: "0.01mg/kg IM (Max 0.5mg)." }] }]
  },
  {
    id: "MED-EPI10", refNo: "Epinephrine 1:10,000", title: "Epinephrine (0.1mg/mL)", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "red",
    sections: [{ type: "header", items: [{ title: "Epinephrine 1:10,000", subtitle: "Cardiac Arrest / Push-dose" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Arrest Dose", content: "1mg IV/IO q 3-5 min." }, { title: "Push Dose", content: "1mL (10mcg) q 1-3 min for Shock." }] }]
  },
  {
    id: "MED-FENT", refNo: "Fentanyl", title: "Fentanyl", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "purple",
    sections: [{ type: "header", items: [{ title: "Fentanyl", subtitle: "Analgesic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "50mcg IV/IM/IN slow push." }, { title: "Max", content: "200mcg total." }] }]
  },
  {
    id: "MED-GLUC", refNo: "Glucagon", title: "Glucagon", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "orange",
    sections: [{ type: "header", items: [{ title: "Glucagon", subtitle: "Hormone" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Hypoglycemia", content: "1mg IM (if no IV access)." }, { title: "Beta Blocker OD", content: "1mg IV/IM." }] }]
  },
  {
    id: "MED-GLUCO", refNo: "Oral Glucose", title: "Glucose (Oral)", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "blue",
    sections: [{ type: "header", items: [{ title: "Oral Glucose", subtitle: "Carbohydrate" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "15-30g PO (1 tube)." }, { title: "Note", content: "Patient must be awake and able to swallow." }] }]
  },
  {
    id: "MED-CYANO", refNo: "Cyanokit", title: "Hydroxocobalamin", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2026", icon: "medication", color: "red",
    sections: [{ type: "header", items: [{ title: "Hydroxocobalamin", subtitle: "Cyanide Antidote" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "5g IV over 15 min." }] }]
  },
  {
    id: "MED-TORADOL", refNo: "Toradol", title: "Ketorolac", category: "Pharmacology", type: "Formulary", lastUpdated: "Jul 1, 2024", icon: "pill", color: "blue",
    sections: [{ type: "header", items: [{ title: "Ketorolac", subtitle: "NSAID Analgesic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "15mg IV/IM." }, { title: "Contraindications", content: "Pregnancy, Renal Failure, Active Bleed, Age > 65 (Relative)." }] }]
  },
  {
    id: "MED-LIDO", refNo: "Lidocaine", title: "Lidocaine 2%", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "red",
    sections: [{ type: "header", items: [{ title: "Lidocaine", subtitle: "Antiarrhythmic / Anesthetic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "IO Pain", content: "40mg (2mL) slow IO push before flush in conscious patient." }, { title: "Cardiac Arrest", content: "1.5mg/kg IV/IO (Alternative to Amiodarone)." }] }]
  },
  {
    id: "MED-MID", refNo: "Midazolam", title: "Midazolam", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 2024", icon: "psychology", color: "purple",
    sections: [{ type: "header", items: [{ title: "Midazolam (Versed)", subtitle: "Benzodiazepine" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Seizure/Sedation", content: "5mg IM/IN/IV. May repeat x1 in 3-5 min." }, { title: "Peds", content: "0.1mg/kg IV or 0.2mg/kg IM/IN." }] }]
  },
  {
    id: "MED-MOR", refNo: "Morphine", title: "Morphine Sulfate", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "purple",
    sections: [{ type: "header", items: [{ title: "Morphine", subtitle: "Analgesic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "4mg IV/IM. Repeat q 5 min." }, { title: "Max", content: "20mg total." }] }]
  },
  {
    id: "MED-NAL", refNo: "Naloxone", title: "Naloxone", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "orange",
    sections: [{ type: "header", items: [{ title: "Naloxone", subtitle: "Opioid Antagonist" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "2-4mg IN or 0.4-2mg IV/IM." }, { title: "Goal", content: "Titrate to respiratory rate, not full wakefulness." }] }]
  },
  {
    id: "MED-NTG", refNo: "Nitroglycerin", title: "Nitroglycerin", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "monitor_heart", color: "red",
    sections: [{ type: "header", items: [{ title: "Nitroglycerin", subtitle: "Vasodilator" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "0.4mg SL spray/tablet q 5 min." }, { title: "CHF", content: "May use high dose (0.8mg or 1.2mg) based on SBP." }] }]
  },
  {
    id: "MED-NS", refNo: "Normal Saline", title: "Normal Saline 0.9%", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "water_drop", color: "blue",
    sections: [{ type: "header", items: [{ title: "Normal Saline", subtitle: "Crystalloid" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Bolus", content: "1L Rapid IV/IO for hypotension." }, { title: "Peds", content: "20mL/kg Bolus." }] }]
  },
  {
    id: "MED-ZYPREXA", refNo: "Zyprexa", title: "Olanzapine", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2026", icon: "psychology", color: "yellow",
    sections: [{ type: "header", items: [{ title: "Olanzapine", subtitle: "Antipsychotic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "10mg ODT." }, { title: "Indication", content: "Agitated Delirium / Behavioral." }] }]
  },
  {
    id: "MED-ZOFRAN", refNo: "Ondansetron", title: "Ondansetron", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "pill", color: "teal",
    sections: [{ type: "header", items: [{ title: "Ondansetron", subtitle: "Antiemetic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Dose", content: "4mg IV/IM/ODT." }, { title: "Peds", content: "4mg ODT if > 4 years old." }] }]
  },
  {
    id: "MED-O2", refNo: "Oxygen", title: "Oxygen", category: "Pharmacology", type: "Formulary", lastUpdated: "Jul 1, 2024", icon: "air", color: "blue",
    sections: [{ type: "header", items: [{ title: "Oxygen", subtitle: "Gas" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Target SpO2", content: "94-98%." }, { title: "COPD", content: "88-92%." }] }]
  },
  {
    id: "MED-DUODOTE", refNo: "DuoDote", title: "Pralidoxime Chloride", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2026", icon: "science", color: "green",
    sections: [{ type: "header", items: [{ title: "Pralidoxime (2-PAM)", subtitle: "Cholinesterase Reactivator" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Indication", content: "Organophosphate Poisoning." }, { title: "Dose", content: "Auto-injector (Mark I / DuoDote)." }] }]
  },
  {
    id: "MED-BICARB", refNo: "Sodium Bicarb", title: "Sodium Bicarbonate", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2024", icon: "medication", color: "yellow",
    sections: [{ type: "header", items: [{ title: "Sodium Bicarbonate", subtitle: "Alkalinizing Agent" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Indications", content: "Hyperkalemia, TCA Overdose, Crush Injury, Prolonged Arrest." }, { title: "Dose", content: "50mEq IV push." }] }]
  },
  {
    id: "MED-TXA", refNo: "TXA", title: "Transexamic Acid", category: "Pharmacology", type: "Formulary", lastUpdated: "Jan 1, 2026", icon: "medication", color: "slate",
    sections: [{ type: "header", items: [{ title: "Transexamic Acid", subtitle: "Antifibrinolytic" }] }, { type: "accordion", title: "Key Info", items: [{ title: "Indication", content: "Major Trauma with Signs of Shock < 3 hrs." }, { title: "Dose", content: "1g in 100mL NS over 10 min." }] }]
  }
];