
import { Protocol } from '../../../types';

export const ref1309: Protocol = {
  id: "1309",
  refNo: "MCG 1309",
  title: "Color Code Drug Doses",
  category: "Pediatric",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  icon: "palette",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Color Code Drug Doses", subtitle: "MCG 1309 • Pediatric Reference", icon: "palette" }]
    },
    {
      type: "warning",
      content: "<b>WEIGHT-BASED DOSING IS CRITICAL:</b><br>Medication errors are a leading cause of pediatric harm in EMS. Use a length-based tape (Broselow) to determine weight and color zone for ALL children ≤36 kg.<br><br><b>ALWAYS document both dose in mg AND volume in mL.</b>"
    },
    {
      type: "section",
      title: "Using the Length-Based Tape"
    },
    {
      type: "list",
      title: "Measurement Procedure",
      items: [
        { title: "1. Position Child", content: "Lay child supine on flat surface with legs extended." },
        { title: "2. Measure Length", content: "Place tape at top of head. Extend to heel (not toe). Read color zone at heel." },
        { title: "3. Document", content: "Record color zone, estimated weight, and actual doses given." },
        { title: "4. Reassess", content: "If clinical condition changes or weight seems inaccurate, reassess." }
      ]
    },
    {
      type: "accordion",
      title: "Color Zone Reference",
      items: [
        {
          title: "Gray Zone",
          content: "<b>Length:</b> 46-53 cm<br><b>Weight:</b> 3-5 kg<br><b>Age range:</b> Newborn to ~2 months<br><br><b>Defibrillation:</b> 6-10 J<br><b>ETT:</b> 3.0 uncuffed",
          color: "slate"
        },
        {
          title: "Pink Zone",
          content: "<b>Length:</b> 54-63 cm<br><b>Weight:</b> 6-7 kg<br><b>Age range:</b> ~3-6 months<br><br><b>Defibrillation:</b> 12-14 J<br><b>ETT:</b> 3.5 uncuffed",
          color: "pink"
        },
        {
          title: "Red Zone",
          content: "<b>Length:</b> 64-74 cm<br><b>Weight:</b> 8-9 kg<br><b>Age range:</b> ~6-12 months<br><br><b>Defibrillation:</b> 16-18 J<br><b>ETT:</b> 3.5 uncuffed or 3.0 cuffed",
          color: "red"
        },
        {
          title: "Purple Zone",
          content: "<b>Length:</b> 75-83 cm<br><b>Weight:</b> 10-11 kg<br><b>Age range:</b> ~1-2 years<br><br><b>Defibrillation:</b> 20-22 J<br><b>ETT:</b> 4.0 uncuffed or 3.5 cuffed",
          color: "purple"
        },
        {
          title: "Yellow Zone",
          content: "<b>Length:</b> 84-95 cm<br><b>Weight:</b> 12-14 kg<br><b>Age range:</b> ~2-3 years<br><br><b>Defibrillation:</b> 24-28 J<br><b>ETT:</b> 4.5 uncuffed or 4.0 cuffed",
          color: "yellow"
        },
        {
          title: "White Zone",
          content: "<b>Length:</b> 96-107 cm<br><b>Weight:</b> 15-18 kg<br><b>Age range:</b> ~4-5 years<br><br><b>Defibrillation:</b> 30-36 J<br><b>ETT:</b> 5.0 uncuffed or 4.5 cuffed",
          color: "slate"
        },
        {
          title: "Blue Zone",
          content: "<b>Length:</b> 108-121 cm<br><b>Weight:</b> 19-23 kg<br><b>Age range:</b> ~6-7 years<br><br><b>Defibrillation:</b> 38-46 J<br><b>ETT:</b> 5.5 uncuffed or 5.0 cuffed",
          color: "blue"
        },
        {
          title: "Orange Zone",
          content: "<b>Length:</b> 122-133 cm<br><b>Weight:</b> 24-29 kg<br><b>Age range:</b> ~8-10 years<br><br><b>Defibrillation:</b> 48-58 J<br><b>ETT:</b> 6.0 cuffed",
          color: "orange"
        },
        {
          title: "Green Zone",
          content: "<b>Length:</b> 134-143 cm<br><b>Weight:</b> 30-36 kg<br><b>Age range:</b> ~10-12 years<br><br><b>Defibrillation:</b> 60-72 J<br><b>ETT:</b> 6.5 cuffed",
          color: "green"
        }
      ]
    },
    {
      type: "section",
      title: "Critical Medication Doses"
    },
    {
      type: "pediatric-dosing"
    },
    {
      type: "accordion",
      title: "Resuscitation Medications",
      items: [
        {
          title: "Epinephrine (Cardiac Arrest)",
          content: "<b>Concentration:</b> 1:10,000 (0.1 mg/mL)<br><b>Dose:</b> 0.01 mg/kg (= 0.1 mL/kg)<br><b>Max single dose:</b> 1 mg<br><b>Route:</b> IV/IO<br><b>Frequency:</b> Every 3-5 minutes<br><br><b>Quick reference:</b><br>• 5 kg = 0.5 mL<br>• 10 kg = 1 mL<br>• 20 kg = 2 mL",
          icon: "medication"
        },
        {
          title: "Epinephrine (Anaphylaxis)",
          content: "<b>Concentration:</b> 1:1,000 (1 mg/mL)<br><b>Dose:</b> 0.01 mg/kg (= 0.01 mL/kg)<br><b>Max single dose:</b> 0.3 mg (pediatric), 0.5 mg (adult)<br><b>Route:</b> IM (lateral thigh preferred)<br><br><b>Auto-injector:</b><br>• EpiPen Jr (0.15 mg): 15-30 kg<br>• EpiPen (0.3 mg): > 30 kg",
          icon: "medication"
        },
        {
          title: "Amiodarone (Cardiac Arrest)",
          content: "<b>Dose:</b> 5 mg/kg IV/IO bolus<br><b>Max single dose:</b> 300 mg<br><b>May repeat:</b> Up to 2 times for refractory VF/pVT<br><br><b>Indication:</b> VF/pVT unresponsive to defibrillation",
          icon: "medication"
        },
        {
          title: "Atropine",
          content: "<b>Dose:</b> 0.02 mg/kg IV/IO<br><b>Minimum dose:</b> 0.1 mg<br><b>Max single dose:</b> 0.5 mg (child), 1 mg (adolescent)<br><b>May repeat once</b><br><br><b>Indication:</b> Symptomatic bradycardia, nerve agent/organophosphate (higher doses)",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "Sedation & Seizure Medications",
      items: [
        {
          title: "Midazolam",
          content: "<b>Seizure dose:</b><br>• IV/IO: 0.1 mg/kg (max 4 mg)<br>• IM: 0.2 mg/kg (max 10 mg)<br>• IN: 0.2 mg/kg (max 10 mg)<br><br><b>Sedation dose:</b> 0.05-0.1 mg/kg IV<br><br><b>May repeat</b> seizure dose x1 after 5 minutes if seizure continues",
          icon: "medication"
        },
        {
          title: "Diazepam (Valium)",
          content: "<b>Seizure dose:</b><br>• IV: 0.1-0.2 mg/kg (max 10 mg)<br>• Rectal: 0.5 mg/kg (max 20 mg)<br><br><b>Note:</b> Midazolam preferred in prehospital due to IM/IN routes",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "Other Critical Medications",
      items: [
        {
          title: "Adenosine",
          content: "<b>First dose:</b> 0.1 mg/kg IV rapid push (max 6 mg)<br><b>Second dose:</b> 0.2 mg/kg IV (max 12 mg)<br><br><b>Administration:</b> Rapid push followed by 10-20 mL saline flush. Use IV site closest to heart.<br><br><b>Indication:</b> SVT with narrow complex, hemodynamically stable",
          icon: "medication"
        },
        {
          title: "Dextrose (Hypoglycemia)",
          content: "<b>D10W (preferred for pediatrics):</b> 2-4 mL/kg IV<br><b>D25W:</b> 2 mL/kg IV (neonates use D10 only)<br><b>D50W:</b> 1-2 mL/kg IV (older children, via large bore IV)<br><br><b>Target:</b> Blood glucose > 60 mg/dL<br><br><b>Note:</b> D50 is hyperosmolar – use D10 or D25 when possible in pediatrics",
          icon: "medication"
        },
        {
          title: "Naloxone (Narcan)",
          content: "<b>Dose:</b> 0.1 mg/kg IV/IM/IN<br><b>Max single dose:</b> 2 mg<br><b>May repeat</b> every 2-3 minutes<br><br><b>Titrate to effect:</b> Goal is adequate respirations, not full reversal",
          icon: "medication"
        },
        {
          title: "Albuterol (Nebulized)",
          content: "<b>Dose:</b> 2.5 mg (< 20 kg) or 5 mg (> 20 kg)<br><b>May repeat</b> every 20 minutes x3<br><b>Continuous nebulization</b> for severe bronchospasm<br><br><b>MDI with spacer:</b> 4-8 puffs, may repeat",
          icon: "air"
        },
        {
          title: "Diphenhydramine (Benadryl)",
          content: "<b>Dose:</b> 1-1.25 mg/kg IV/IM/PO<br><b>Max single dose:</b> 50 mg<br><br><b>Indication:</b> Allergic reactions (adjunct to epinephrine for anaphylaxis)",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Fluid Resuscitation"
    },
    {
      type: "accordion",
      title: "IV Fluid Boluses",
      items: [
        {
          title: "Hypovolemia / Shock",
          content: "<b>Dose:</b> 20 mL/kg NS or LR bolus<br><b>May repeat:</b> Up to 60 mL/kg total (3 boluses)<br><b>Reassess</b> after each bolus<br><br><b>Signs requiring fluid:</b><br>• Tachycardia<br>• Delayed capillary refill (> 2 sec)<br>• Altered mental status<br>• Hypotension (late sign)"
        },
        {
          title: "Neonatal Resuscitation",
          content: "<b>Dose:</b> 10 mL/kg NS or O-negative blood<br><b>Indication:</b> Suspected hypovolemia with inadequate response to resuscitation<br><b>Infuse over:</b> 5-10 minutes"
        }
      ]
    },
    {
      type: "info",
      title: "Documentation Requirements",
      content: "<b>For ALL pediatric medication administrations:</b><br><br>1. <b>Color zone</b> from length-based tape<br>2. <b>Estimated weight</b> in kg<br>3. <b>Medication name</b><br>4. <b>Dose in mg</b> (or mcg if applicable)<br>5. <b>Volume in mL</b><br>6. <b>Route</b> of administration<br>7. <b>Time</b> administered<br>8. <b>Response</b> to medication<br><br>Report color zone and weight to Base Hospital with all medical control contacts."
    },
    {
      type: "warning",
      content: "<b>WHEN TO USE ADULT DOSING:</b><br><br>Use adult medication doses for patients who:<br>• Exceed the length of the tape (> 36 kg / > 143 cm)<br>• Are ≥ 14 years old<br>• Have reached puberty (breast development, axillary hair)<br><br><b>Always use pediatric doses</b> for children who appear small for age or have chronic illness affecting growth."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>\"Measure twice, dose once\":</b> Weight-based dosing errors can be catastrophic. Double-check your calculations.<br><br><b>10x overdose risk:</b> Concentration errors (using 1:1,000 instead of 1:10,000 epi) can result in 10x overdose. Know your concentrations.<br><br><b>Color zone = safety:</b> The Broselow tape was designed to reduce cognitive load. Trust it.<br><br><b>Document color:</b> Base hospital needs the color zone to verify doses. Always communicate it."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1216 Newborn Resuscitation" },
        { title: "TP-1219 Allergy/Anaphylaxis" },
        { title: "TP-1231 Seizure" },
        { title: "MCG 1375 Vascular Access" }
      ]
    }
  ]
};
