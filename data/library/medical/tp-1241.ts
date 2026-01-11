
import { Protocol } from '../../../types';

export const tp1241: Protocol = {
  id: "1241",
  refNo: "TP-1241",
  title: "Overdose / Poisoning / Ingestion",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "science",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Overdose / Poisoning", subtitle: "Adult - Standing Order", icon: "science" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "ODPO", content: "Overdose / Poisoning - Intentional or accidental drug/toxin exposure" },
        { title: "ETOH", content: "Alcohol Intoxication - Acute ethanol toxicity" },
        { title: "TOXI", content: "Toxic Ingestion - Non-pharmaceutical substance ingestion" },
        { title: "ENVN", content: "Envenomation - Snake, spider, scorpion, marine" }
      ]
    },
    {
      type: "warning",
      content: "<b>SCENE SAFETY:</b> Consider hazardous materials exposure. If multiple patients with similar symptoms, suspect environmental toxin/contamination. Decontaminate before transport if indicated."
    },
    {
      type: "section",
      title: "Toxidrome Recognition"
    },
    {
      type: "accordion",
      title: "Major Toxidromes",
      items: [
        {
          title: "Opioid Toxidrome",
          content: "<b>Classic Triad:</b><br>- Respiratory depression (RR < 12, apnea)<br>- Miosis (pinpoint pupils)<br>- Decreased LOC<br><br><b>Additional Signs:</b><br>- Hypotension, bradycardia<br>- Hypothermia<br>- Decreased bowel sounds<br>- Track marks (IV drug use)<br><br><b>Common Agents:</b> Heroin, fentanyl, morphine, oxycodone, hydrocodone, methadone",
          icon: "visibility"
        },
        {
          title: "Sympathomimetic Toxidrome",
          content: "<b>Signs (Hyper-adrenergic):</b><br>- Hypertension, tachycardia<br>- Hyperthermia, diaphoresis<br>- Mydriasis (dilated pupils)<br>- Agitation, psychosis, seizures<br>- Chest pain (cocaine)<br><br><b>Common Agents:</b> Cocaine, methamphetamine, MDMA, amphetamines, synthetic cathinones (bath salts)",
          icon: "visibility"
        },
        {
          title: "Anticholinergic Toxidrome",
          content: "<b>Mnemonic:</b> Hot as a hare, blind as a bat, dry as a bone, red as a beet, mad as a hatter<br><br><b>Signs:</b><br>- Hyperthermia (anhydrosis)<br>- Mydriasis, blurred vision<br>- Dry skin and mucous membranes<br>- Flushed skin<br>- Altered mental status, hallucinations<br>- Urinary retention, ileus<br>- Tachycardia<br><br><b>Common Agents:</b> Diphenhydramine, atropine, scopolamine, TCAs, jimsonweed",
          icon: "visibility"
        },
        {
          title: "Cholinergic Toxidrome (SLUDGEM)",
          content: "<b>SLUDGEM:</b><br>- <b>S</b>alivation<br>- <b>L</b>acrimation<br>- <b>U</b>rination<br>- <b>D</b>efecation<br>- <b>G</b>I cramping<br>- <b>E</b>mesis<br>- <b>M</b>iosis<br><br><b>Nicotinic Effects (severe):</b><br>- Muscle fasciculations, weakness, paralysis<br>- Respiratory failure<br><br><b>Common Agents:</b> Organophosphates, carbamates, nerve agents<br><br><b>See:</b> TP-1240 HAZMAT/Nerve Agent",
          icon: "visibility"
        },
        {
          title: "Sedative-Hypnotic Toxidrome",
          content: "<b>Signs:</b><br>- CNS depression (drowsiness to coma)<br>- Respiratory depression<br>- Hypotension<br>- Hypothermia<br>- Normal or small pupils<br>- Slurred speech, ataxia<br><br><b>Common Agents:</b> Benzodiazepines, barbiturates, GHB, zolpidem, alcohol",
          icon: "visibility"
        },
        {
          title: "Serotonin Syndrome",
          content: "<b>Triad:</b> Mental status changes + Autonomic instability + Neuromuscular abnormalities<br><br><b>Signs:</b><br>- Agitation, confusion, hypomania<br>- Hyperthermia, diaphoresis, diarrhea<br>- Tremor, hyperreflexia, clonus (especially lower extremities)<br>- Muscle rigidity<br><br><b>Common Agents:</b> SSRIs, SNRIs, MAOIs, tramadol, meperidine, linezolid + serotonergic drug",
          icon: "visibility"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithms"
    },
    {
      type: "accordion",
      title: "Opioid Overdose",
      items: [
        {
          title: "Initial Management",
          content: "<b>1. Airway management is priority</b><br>- Position, suction, BVM ventilation<br>- Intubation if unable to protect airway<br><br><b>2. Supplemental oxygen</b><br>- High-flow O2 via NRB or BVM<br><br><b>3. Continuous monitoring</b><br>- SpO2, cardiac monitor, capnography if available",
          icon: "medical_services"
        },
        {
          title: "Naloxone (Narcan) Administration",
          content: "<b>Intranasal (preferred for EMS safety):</b><br>- 4 mg IN (2 mg each nostril)<br>- May repeat every 2-3 minutes<br><br><b>Intravenous/Intramuscular:</b><br>- Initial: 0.4 mg IV/IM<br>- Titrate: 0.4-2 mg every 2-3 minutes<br>- Max total dose: 10 mg<br><br><b>Goal:</b> Restore adequate ventilation (RR > 12), NOT full consciousness<br><br><b>Caution:</b> Rapid reversal may precipitate acute withdrawal, agitation, combativeness. Titrate to respiratory effort.",
          icon: "medication"
        },
        {
          title: "Post-Naloxone Considerations",
          content: "<b>Duration of action:</b><br>- Naloxone: 30-90 minutes<br>- Many opioids outlast naloxone<br><br><b>Re-sedation risk:</b> Monitor closely for return of respiratory depression<br><br><b>Fentanyl overdoses:</b> May require higher/repeated naloxone doses due to potency and lipophilicity<br><br><b>Transport recommendation:</b> All patients who received naloxone should be transported for observation"
        }
      ]
    },
    {
      type: "accordion",
      title: "Tricyclic Antidepressant (TCA) Overdose",
      items: [
        {
          title: "Recognition",
          content: "<b>Cardiac toxicity hallmarks:</b><br>- QRS widening > 100 ms (concerning), > 160 ms (high seizure/arrhythmia risk)<br>- Right axis deviation, tall R wave in aVR<br>- QTc prolongation<br><br><b>Other signs:</b><br>- Anticholinergic toxidrome<br>- Hypotension (alpha blockade + myocardial depression)<br>- Seizures<br>- Altered mental status progressing rapidly",
          icon: "monitor_heart"
        },
        {
          title: "Sodium Bicarbonate",
          content: "<b>Indication:</b> QRS > 100 ms or ventricular arrhythmias<br><br><b>Dose:</b> 1-2 mEq/kg IV bolus (50-100 mEq typical adult dose)<br><br><b>May repeat:</b> Every 3-5 minutes until QRS narrows<br><br><b>Goal:</b> Arterial pH 7.50-7.55 (serum sodium loading also therapeutic)<br><br><b>Mechanism:</b> Sodium loading overcomes sodium channel blockade; alkalinization increases protein binding",
          icon: "medication"
        },
        {
          title: "Hypotension Management",
          content: "<b>First-line:</b> IV crystalloid bolus (1-2 L NS)<br><br><b>Vasopressors if refractory:</b><br>- Norepinephrine preferred (alpha effect)<br>- Avoid dopamine (may worsen arrhythmias)<br><br><b>Note:</b> Hypotension often responds to sodium bicarbonate"
        }
      ]
    },
    {
      type: "accordion",
      title: "Calcium Channel Blocker / Beta Blocker Overdose",
      items: [
        {
          title: "Recognition",
          content: "<b>Calcium Channel Blockers:</b><br>- Bradycardia (less pronounced with dihydropyridines like amlodipine)<br>- Hypotension<br>- Hyperglycemia<br>- AV blocks<br><br><b>Beta Blockers:</b><br>- Bradycardia<br>- Hypotension<br>- Hypoglycemia (especially pediatrics)<br>- Bronchospasm<br>- AV blocks, wide QRS (with propranolol)"
        },
        {
          title: "Calcium Administration",
          content: "<b>Calcium Chloride 10%:</b><br>- 1 gram (10 mL) slow IV push over 5 minutes<br>- May repeat every 10-20 minutes<br>- Preferred for central line<br><br><b>Calcium Gluconate 10%:</b><br>- 3 grams (30 mL) IV if peripheral access only<br>- Contains 1/3 elemental calcium of chloride<br><br><b>Monitor:</b> Cardiac rhythm during administration",
          icon: "medication"
        },
        {
          title: "Additional Therapies",
          content: "<b>Glucagon:</b><br>- 3-5 mg IV bolus, may repeat<br>- Bypasses beta receptor blockade<br>- Often causes vomiting; have suction ready<br><br><b>High-Dose Insulin (Hyperinsulinemia-Euglycemia):</b><br>- Insulin 1 unit/kg IV bolus<br>- Infusion 0.5-1 unit/kg/hr<br>- Dextrose bolus and infusion to maintain glucose 100-200<br>- Hospital/base contact typically required<br><br><b>Vasopressors:</b> Norepinephrine or epinephrine for refractory hypotension"
        }
      ]
    },
    {
      type: "accordion",
      title: "Stimulant/Sympathomimetic Toxicity",
      items: [
        {
          title: "Primary Concerns",
          content: "<b>Life-threatening complications:</b><br>- Hyperthermia (can be rapidly fatal)<br>- Seizures<br>- Cardiac arrhythmias<br>- Hypertensive emergency (stroke, aortic dissection)<br>- Excited delirium<br>- Rhabdomyolysis"
        },
        {
          title: "Treatment",
          content: "<b>Benzodiazepines (FIRST-LINE):</b><br>- Midazolam 5-10 mg IM/IV or<br>- Diazepam 5-10 mg IV<br>- Repeat as needed for agitation, seizures<br>- Treats multiple complications simultaneously<br><br><b>Cooling:</b><br>- Aggressive cooling for hyperthermia > 104F<br>- Ice packs, cold IV fluids, evaporative cooling<br><br><b>IV Fluids:</b><br>- Aggressive hydration for rhabdomyolysis prevention<br><br><b>Avoid:</b><br>- Physical restraints alone (worsens hyperthermia, acidosis)<br>- Haloperidol (lowers seizure threshold, QT prolongation)<br>- Beta blockers for cocaine (unopposed alpha stimulation)",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Specific Antidotes"
    },
    {
      type: "accordion",
      title: "Antidote Reference",
      items: [
        {
          title: "Naloxone (Opioids)",
          content: "<b>Dose:</b> 0.4-2 mg IV/IM/IN, may repeat<br><b>Onset:</b> 1-2 min IV, 2-5 min IM/IN<br><b>Duration:</b> 30-90 minutes",
          icon: "medication"
        },
        {
          title: "Flumazenil (Benzodiazepines)",
          content: "<b>Dose:</b> 0.2 mg IV, may repeat 0.3-0.5 mg to max 3 mg<br><b>CAUTION:</b> May precipitate seizures in chronic benzodiazepine users or mixed overdose. Not routinely recommended prehospital.<br><b>Contraindicated:</b> TCA ingestion, seizure history, chronic benzo use",
          icon: "medication"
        },
        {
          title: "Sodium Bicarbonate (TCAs, sodium channel blockers)",
          content: "<b>Dose:</b> 1-2 mEq/kg IV bolus<br><b>Indication:</b> QRS > 100 ms, ventricular arrhythmias<br><b>Also useful for:</b> Aspirin overdose (urinary alkalinization)",
          icon: "medication"
        },
        {
          title: "Calcium (CCB/hyperkalemia)",
          content: "<b>Calcium Chloride:</b> 1 g IV<br><b>Calcium Gluconate:</b> 3 g IV<br><b>Indication:</b> CCB overdose, hyperkalemia with ECG changes",
          icon: "medication"
        },
        {
          title: "Glucagon (Beta blockers, hypoglycemia)",
          content: "<b>Beta blocker overdose:</b> 3-5 mg IV bolus<br><b>Hypoglycemia:</b> 1 mg IM/IV/IN<br><b>Note:</b> Often causes vomiting",
          icon: "medication"
        },
        {
          title: "Atropine (Organophosphates/Carbamates)",
          content: "<b>Dose:</b> 2-4 mg IV, repeat every 5-10 minutes<br><b>Endpoint:</b> Drying of secretions (NOT pupil size)<br><b>Large doses may be needed</b> (20+ mg not uncommon)",
          icon: "medication"
        },
        {
          title: "Hydroxocobalamin (Cyanide)",
          content: "<b>Dose:</b> 5 g IV over 15 minutes<br><b>Indication:</b> Smoke inhalation with AMS, hypotension, cardiac arrest<br><b>See:</b> TP-1240 HAZMAT",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Decontamination"
    },
    {
      type: "accordion",
      title: "GI Decontamination",
      items: [
        {
          title: "Activated Charcoal",
          content: "<b>Dose:</b> 1 g/kg PO (typical adult 50-100 g)<br><br><b>Indications (limited prehospital):</b><br>- Recent ingestion (< 1-2 hours)<br>- Potentially toxic ingestion<br>- Patient is alert, protecting airway<br>- Substance adsorbs to charcoal<br><br><b>Contraindications:</b><br>- Altered mental status / aspiration risk<br>- Caustic ingestion (acids, alkalis)<br>- Hydrocarbon ingestion<br>- GI perforation or obstruction<br><br><b>Not adsorbed by charcoal:</b><br>- Metals (iron, lithium, lead)<br>- Alcohols (ethanol, methanol, ethylene glycol)<br>- Caustics<br>- Hydrocarbons",
          icon: "medication"
        },
        {
          title: "Whole Bowel Irrigation",
          content: "<b>Not prehospital intervention</b><br><br>Hospital consideration for:<br>- Iron overdose<br>- Lithium overdose<br>- Sustained-release medications<br>- Body packers/stuffers"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Naloxone:</b> 0.1 mg/kg IV/IM/IN (max 2 mg), may repeat<br><br><b>Common pediatric ingestions:</b><br>- Exploratory ingestions (typically < 5 years)<br>- Iron (children's vitamins)<br>- Acetaminophen<br>- Antihistamines<br>- Button batteries (not a toxin but critical)<br><br><b>Weight-based dosing essential:</b><br>- Sodium bicarbonate: 1 mEq/kg<br>- Activated charcoal: 1 g/kg<br><br><b>Glucose monitoring:</b> Pediatric patients at higher risk of hypoglycemia with beta blocker toxicity"
    },
    {
      type: "warning",
      content: "<b>HIGH-RISK INGESTIONS REQUIRING IMMEDIATE TRANSPORT:</b><br><br>- Calcium channel blockers (especially sustained-release)<br>- Beta blockers (especially propranolol, sotalol)<br>- TCAs and other sodium channel blockers<br>- Sulfonylureas (delayed hypoglycemia)<br>- Opioids (especially methadone, fentanyl patches)<br>- Clonidine<br>- Digoxin<br>- Caustic ingestions<br>- Button batteries<br>- Organophosphates/Carbamates"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Toxidrome recognition saves lives:</b> Pattern recognition is faster than waiting for history. Let the physical exam guide treatment.<br><br><b>Naloxone titration:</b> Goal is breathing, not waking. Fully reversing a chronic opioid user causes agony and combativeness.<br><br><b>QRS width is your friend:</b> In unknown overdose with wide QRS, give sodium bicarbonate empirically.<br><br><b>Time is critical:</b> Many toxic ingestions have delayed onset. A patient who looks fine now may deteriorate rapidly (beta blockers, CCBs, sustained-release preparations).<br><br><b>Polysubstance is common:</b> Assume mixed ingestion. Treat what you see. One toxidrome may mask another.<br><br><b>Fentanyl is different:</b> Higher doses of naloxone may be needed, and it may wear off faster than fentanyl's effects."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1240 HAZMAT / Nerve Agent / Radiological" },
        { title: "TP-1229 Behavioral Emergencies" },
        { title: "TP-1238 Carbon Monoxide Exposure" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1211 Chest Pain / STEMI" },
        { title: "RS-1405 Medication Reference" }
      ]
    }
  ]
};
