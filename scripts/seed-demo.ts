import { drizzle } from "drizzle-orm/mysql2";
import { counties, protocolChunks } from "../drizzle/schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("Seeding demo data...");

  // Create Demo County
  const [countyResult] = await db.insert(counties).values({
    name: "Demo County",
    state: "CA",
    usesStateProtocols: false,
    protocolVersion: "2024.1",
  });

  const countyId = countyResult.insertId;
  console.log(`Created Demo County with ID: ${countyId}`);

  // Sample protocols
  const sampleProtocols = [
    // Respiratory protocols
    {
      countyId,
      protocolNumber: "R-001",
      protocolTitle: "Respiratory Distress - Adult",
      section: "Assessment",
      content: `Adult Respiratory Distress Protocol
Assessment:
- Assess airway patency and breathing effort
- Obtain SpO2, ETCO2 if available
- Auscultate lung sounds bilaterally
- Assess for signs of respiratory failure: accessory muscle use, tripod positioning, inability to speak full sentences

Treatment:
- Position of comfort (usually sitting upright)
- High-flow oxygen via non-rebreather mask to maintain SpO2 > 94%
- If wheezing present: Albuterol 2.5mg via nebulizer, may repeat x2
- If severe distress: Consider CPAP 5-10 cmH2O
- Establish IV access

Transport:
- Monitor continuously
- Be prepared for deterioration and possible intubation`,
    },
    {
      countyId,
      protocolNumber: "R-002",
      protocolTitle: "Asthma/COPD Exacerbation",
      section: "Treatment",
      content: `Asthma/COPD Exacerbation Protocol
Indications: Wheezing, prolonged expiratory phase, history of asthma or COPD

Treatment - Mild to Moderate:
- Albuterol 2.5mg nebulized, may repeat every 5-10 minutes x3
- Ipratropium 0.5mg nebulized (may combine with albuterol)
- Oxygen to maintain SpO2 > 92% (COPD: 88-92%)

Treatment - Severe:
- Continuous albuterol nebulization
- Methylprednisolone 125mg IV or Dexamethasone 10mg IV
- Magnesium Sulfate 2g IV over 20 minutes for severe refractory bronchospasm
- Consider epinephrine 0.3mg IM for severe bronchospasm unresponsive to nebulizers

CPAP:
- Consider CPAP 5-10 cmH2O for moderate to severe distress
- Contraindicated in altered mental status, vomiting, or pneumothorax`,
    },
    // Cardiac protocols
    {
      countyId,
      protocolNumber: "C-001",
      protocolTitle: "Chest Pain - Cardiac Suspected",
      section: "Assessment and Treatment",
      content: `Chest Pain - Suspected Cardiac Origin Protocol
Assessment:
- 12-lead ECG within 10 minutes of patient contact
- Assess for STEMI criteria
- OPQRST pain assessment
- Vital signs including SpO2

Treatment:
- Aspirin 324mg PO (chewed) if no contraindications
- Nitroglycerin 0.4mg SL every 5 minutes x3 (hold if SBP < 90 or if right ventricular infarction suspected)
- Oxygen only if SpO2 < 94%
- IV access
- Continuous cardiac monitoring

STEMI Identified:
- Activate cardiac cath lab
- Transport to PCI-capable facility
- Consider Heparin per medical control

Contraindications to Nitroglycerin:
- SBP < 90 mmHg
- Phosphodiesterase inhibitor use within 24-48 hours
- Right ventricular infarction (inferior STEMI with RV involvement)`,
    },
    {
      countyId,
      protocolNumber: "C-002",
      protocolTitle: "Cardiac Arrest - Adult",
      section: "Treatment",
      content: `Adult Cardiac Arrest Protocol
Immediate Actions:
- Confirm unresponsiveness and absence of pulse
- Begin high-quality CPR immediately
- Apply AED/defibrillator

VF/Pulseless VT:
- Defibrillate 200J biphasic
- Resume CPR immediately for 2 minutes
- Epinephrine 1mg IV/IO every 3-5 minutes
- Amiodarone 300mg IV/IO first dose, 150mg second dose
- Consider reversible causes (H's and T's)

Asystole/PEA:
- CPR for 2 minutes
- Epinephrine 1mg IV/IO every 3-5 minutes
- Identify and treat reversible causes

H's and T's:
- Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia
- Tension pneumothorax, Tamponade, Toxins, Thrombosis (pulmonary/coronary)

Post-ROSC:
- 12-lead ECG
- Targeted temperature management consideration
- Transport to appropriate facility`,
    },
    // Pediatric protocols
    {
      countyId,
      protocolNumber: "P-001",
      protocolTitle: "Pediatric Respiratory Distress",
      section: "Assessment and Treatment",
      content: `Pediatric Respiratory Distress Protocol
Assessment:
- Pediatric Assessment Triangle (Appearance, Work of Breathing, Circulation)
- Obtain weight in kg (use Broselow tape if needed)
- SpO2, respiratory rate, heart rate
- Assess for retractions, nasal flaring, grunting

Treatment - All Ages:
- Position of comfort (allow child to remain with caregiver)
- Blow-by oxygen or non-rebreather as tolerated
- Target SpO2 > 94%

Bronchospasm/Wheezing:
- Albuterol nebulized:
  * < 20 kg: 2.5mg
  * ≥ 20 kg: 5mg
- May repeat every 20 minutes x3

Croup (Stridor):
- Dexamethasone 0.6mg/kg PO/IM (max 10mg)
- Nebulized epinephrine 0.5mg/kg (max 5mg) for severe stridor

Severe Distress:
- Prepare for advanced airway management
- BVM ventilation if needed
- Contact medical control for additional orders`,
    },
    {
      countyId,
      protocolNumber: "P-002",
      protocolTitle: "Pediatric Medication Dosing",
      section: "Reference",
      content: `Pediatric Medication Dosing Reference
ALWAYS use weight-based dosing for pediatric patients.
Use actual weight when available; estimate with Broselow tape if needed.

Common Medications:
- Epinephrine (anaphylaxis): 0.01mg/kg IM (max 0.3mg for child, 0.5mg for adult)
- Epinephrine (cardiac arrest): 0.01mg/kg IV/IO (max 1mg)
- Albuterol: 2.5mg if <20kg, 5mg if ≥20kg
- Dexamethasone: 0.6mg/kg PO/IM (max 10mg)
- Diphenhydramine: 1mg/kg IV/IM (max 50mg)
- Ondansetron: 0.1mg/kg IV (max 4mg)
- Acetaminophen: 15mg/kg PO (max 1000mg)
- Ibuprofen: 10mg/kg PO (max 800mg)

Fluid Resuscitation:
- Normal Saline bolus: 20mL/kg, may repeat x2
- Reassess after each bolus

Glucose:
- D10W: 5mL/kg IV (preferred for pediatrics)
- D25W: 2mL/kg IV (if D10 unavailable)

ALWAYS verify dose calculations before administration.
When in doubt, contact medical control.`,
    },
  ];

  // Insert protocols
  for (const protocol of sampleProtocols) {
    await db.insert(protocolChunks).values(protocol);
    console.log(`Created protocol: ${protocol.protocolNumber} - ${protocol.protocolTitle}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
