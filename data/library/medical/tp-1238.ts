import { Protocol } from '../../../types';

export const tp1238: Protocol = {
  id: "1238",
  refNo: "TP-1238",
  title: "Carbon Monoxide Exposure",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "air",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Carbon Monoxide Exposure", subtitle: "Adult - Standing Order", icon: "air" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "COEX", content: "Carbon Monoxide Exposure - Confirmed or suspected CO poisoning" },
        { title: "SMKI", content: "Smoke Inhalation - Fire-related CO exposure (consider concurrent cyanide)" },
        { title: "ENVX", content: "Environmental Exposure - Enclosed space, generator, vehicle exhaust" }
      ]
    },
    {
      type: "warning",
      content: "<b>SCENE SAFETY CRITICAL:</b><br>- Remove patient from exposure source IMMEDIATELY<br>- Do NOT enter enclosed space without SCBA or appropriate respiratory protection<br>- Consider multiple victims - CO affects everyone in the environment<br>- Notify fire department for environmental monitoring and ventilation"
    },
    {
      type: "section",
      title: "Pathophysiology"
    },
    {
      type: "accordion",
      title: "Understanding CO Toxicity",
      items: [
        {
          title: "Mechanism of Toxicity",
          content: "<b>Carboxyhemoglobin (COHb) formation:</b><br>- CO binds hemoglobin with 200-250x affinity vs oxygen<br>- Displaces O2 from hemoglobin<br>- Shifts oxyhemoglobin dissociation curve LEFT<br>- Results in tissue hypoxia despite adequate O2 content<br><br><b>Cellular toxicity:</b><br>- Binds cytochrome oxidase, impairing cellular respiration<br>- Causes oxidative stress and lipid peroxidation<br>- Delayed neurological effects from demyelination",
          icon: "science"
        },
        {
          title: "Common Sources",
          content: "<b>Fire/Smoke:</b> Structure fires, vehicle fires<br><br><b>Combustion appliances:</b><br>- Furnaces, water heaters, stoves<br>- Wood-burning stoves, fireplaces<br>- Charcoal grills (indoor use)<br><br><b>Vehicles:</b><br>- Running car in enclosed garage<br>- Blocked exhaust pipes (snow, leaves)<br><br><b>Generators:</b> Extremely common cause during power outages<br><br><b>Industrial:</b> Welding, forklift operation in warehouses"
        }
      ]
    },
    {
      type: "section",
      title: "Recognition"
    },
    {
      type: "accordion",
      title: "Clinical Presentation",
      items: [
        {
          title: "Symptoms by Severity",
          content: "<b>Mild (COHb 10-20%):</b><br>- Headache (most common, throbbing)<br>- Nausea, vomiting<br>- Dizziness, lightheadedness<br>- Fatigue<br><br><b>Moderate (COHb 20-40%):</b><br>- Confusion, impaired judgment<br>- Ataxia, visual disturbances<br>- Dyspnea on exertion<br>- Chest pain (especially in CAD patients)<br>- Tachycardia<br><br><b>Severe (COHb > 40%):</b><br>- Syncope, seizures<br>- Coma<br>- Cardiac arrhythmias, myocardial ischemia<br>- Respiratory failure<br>- Death",
          icon: "visibility"
        },
        {
          title: "High-Risk Presentations",
          content: "<b>Red flags for CO poisoning:</b><br>- Multiple family members with flu-like symptoms<br>- Symptoms improve when away from home<br>- Pets also affected/ill<br>- Winter months + enclosed space heating<br>- Power outage + generator use<br>- Running vehicle in garage<br><br><b>High-risk populations:</b><br>- Pregnant women (fetal Hgb has higher CO affinity)<br>- Pediatric patients (higher metabolic rate)<br>- Elderly with CAD<br>- Patients with anemia"
        },
        {
          title: "Physical Exam Findings",
          content: "<b>Classic (but unreliable) finding:</b><br>- Cherry red skin (late, often only postmortem)<br><br><b>More common findings:</b><br>- Tachycardia, tachypnea<br>- Altered mental status<br>- Headache, irritability<br>- Normal or pale skin<br><br><b>Severe poisoning:</b><br>- Hypotension, arrhythmias<br>- Pulmonary edema<br>- Rhabdomyolysis<br>- Retinal hemorrhages"
        }
      ]
    },
    {
      type: "section",
      title: "Monitoring Limitations"
    },
    {
      type: "accordion",
      title: "Critical Monitoring Considerations",
      items: [
        {
          title: "SpO2 Limitations - CRITICAL",
          content: "<b>PULSE OXIMETRY IS UNRELIABLE IN CO POISONING</b><br><br><b>Why SpO2 is falsely normal/high:</b><br>- Standard pulse ox measures light absorption at 2 wavelengths<br>- Cannot distinguish oxyhemoglobin from carboxyhemoglobin<br>- COHb absorbs light similarly to O2Hb at standard wavelengths<br>- Patient may have SpO2 of 98-100% while severely hypoxic<br><br><b>Clinical implication:</b><br>- Normal SpO2 does NOT rule out CO poisoning<br>- Treat based on clinical presentation and history<br>- Do NOT withhold oxygen based on SpO2",
          icon: "warning"
        },
        {
          title: "CO-Oximetry (SpCO)",
          content: "<b>If available (Masimo Rad-57 or similar):</b><br>- Measures carboxyhemoglobin noninvasively<br>- Uses multiple wavelengths of light<br>- Provides SpCO% reading<br><br><b>Interpretation:</b><br>- Non-smokers: < 3% normal<br>- Smokers: up to 10-15% may be baseline<br>- > 10% non-smoker or > 20% smoker: significant exposure<br>- > 25%: severe poisoning<br><br><b>Limitations:</b><br>- Less accurate at extremes<br>- Motion artifact<br>- Does not measure tissue/cellular toxicity"
        },
        {
          title: "Blood Gas Analysis",
          content: "<b>Hospital confirmation:</b><br>- CO-oximetry on ABG/VBG<br>- Direct measurement of COHb%<br>- Most accurate assessment<br><br><b>Note:</b> Standard ABG calculated O2 sat is also falsely normal (calculated from PaO2, not measured)"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment"
    },
    {
      type: "accordion",
      title: "Prehospital Management",
      items: [
        {
          title: "Immediate Actions",
          content: "<b>1. Remove from exposure</b><br>- Fresh air environment<br>- Open windows/doors if entering structure<br><br><b>2. Airway/Breathing assessment</b><br>- BVM ventilation if needed<br>- Intubation for airway protection if GCS < 8<br><br><b>3. Cardiac monitoring</b><br>- 12-lead ECG<br>- Monitor for arrhythmias, ischemia",
          icon: "medical_services"
        },
        {
          title: "High-Flow Oxygen - CRITICAL",
          content: "<b>100% Oxygen via NRB at 15 LPM</b><br><br><b>Rationale:</b><br>- CO half-life on room air: 4-6 hours<br>- CO half-life on 100% O2: 60-90 minutes<br>- CO half-life on HBO (3 ATA): 20-30 minutes<br><br><b>Duration:</b><br>- Continue high-flow O2 regardless of SpO2<br>- Maintain until hospital evaluation<br><br><b>Do NOT:</b><br>- Titrate down based on SpO2<br>- Use nasal cannula (inadequate FiO2)<br>- Withhold oxygen for any reason",
          icon: "medication"
        },
        {
          title: "Additional Treatments",
          content: "<b>IV Access:</b><br>- Large bore IV<br>- NS bolus if hypotensive<br><br><b>Glucose:</b><br>- Check blood glucose<br>- Treat hypoglycemia if present<br><br><b>Seizures:</b><br>- Benzodiazepines per seizure protocol<br>- Midazolam 5 mg IM/IV or Diazepam 5-10 mg IV<br><br><b>Cardiac arrest:</b><br>- Standard ACLS with continued high-flow O2<br>- Consider prolonged resuscitation in young patients"
        }
      ]
    },
    {
      type: "section",
      title: "Hyperbaric Oxygen (HBO) Criteria"
    },
    {
      type: "accordion",
      title: "HBO Referral Considerations",
      items: [
        {
          title: "Indications for HBO Therapy",
          content: "<b>Strong indications:</b><br>- Loss of consciousness at any point<br>- Neurological symptoms (confusion, ataxia, seizure)<br>- COHb > 25% (> 15% in pregnancy)<br>- Cardiac ischemia or arrhythmias<br>- Severe metabolic acidosis<br><br><b>Relative indications:</b><br>- Persistent symptoms despite normobaric O2<br>- Pregnancy (lower threshold)<br>- Age extremes (pediatric, elderly)<br>- Prolonged exposure<br>- COHb > 15% with symptoms",
          icon: "local_hospital"
        },
        {
          title: "HBO Mechanism",
          content: "<b>Benefits:</b><br>- Rapidly eliminates CO (20-30 min half-life)<br>- Increases dissolved O2 in plasma<br>- Reduces lipid peroxidation<br>- May reduce delayed neurological sequelae<br><br><b>Time-sensitive:</b><br>- Greatest benefit if initiated within 6 hours<br>- Can still be beneficial up to 24 hours"
        },
        {
          title: "LA County HBO Resources",
          content: "<b>Identify facilities with hyperbaric capability:</b><br>- Not all hospitals have HBO chambers<br>- Contact base hospital for guidance<br>- Consider direct transport if criteria met<br><br><b>Transport considerations:</b><br>- Do NOT delay transport for HBO evaluation<br>- Continue 100% O2 during transport<br>- Notify receiving facility of suspected CO poisoning"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Increased susceptibility:</b><br>- Higher metabolic rate, increased ventilation<br>- Fetal hemoglobin has even higher CO affinity<br><br><b>Presentation differences:</b><br>- May present with irritability, lethargy<br>- Seizures more common<br>- May not verbalize headache<br><br><b>Treatment:</b><br>- 100% O2 via appropriately sized NRB or BVM<br>- Lower threshold for HBO referral<br><br><b>Pregnancy:</b><br>- Treat aggressively regardless of maternal symptoms<br>- Fetal COHb is higher and clears slower than maternal<br>- HBO strongly indicated if any maternal symptoms"
    },
    {
      type: "warning",
      content: "<b>COMBINED CO + CYANIDE POISONING:</b><br><br>Structure fire patients may have BOTH CO and cyanide toxicity. If smoke inhalation with altered mental status, hypotension, or cardiac arrest:<br><br>- Continue high-flow O2<br>- Administer Hydroxocobalamin (Cyanokit) 5 g IV<br>- See TP-1236 Inhalation Injury<br><br>Cyanide toxicity may be present even with low/normal COHb levels"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Trust the history, not the SpO2:</b> A patient with headache after running a generator in the garage needs high-flow O2 regardless of pulse ox reading.<br><br><b>Multiple victims = environmental:</b> If several people in a household are symptomatic, suspect CO. Check the environment before entering.<br><br><b>Flu-like symptoms in winter:</b> CO poisoning is called the great mimicker. Ask about heating sources, recent power outages, and improvement when away from home.<br><br><b>Pregnancy lowers the bar:</b> Pregnant patients should receive HBO for any symptomatic exposure due to fetal risk.<br><br><b>Delayed neurological syndrome:</b> Warn patients that neurological symptoms (memory problems, personality changes, movement disorders) can develop 2-40 days after exposure even with appropriate treatment.<br><br><b>Cherry red is a myth:</b> Most living patients with CO poisoning are pale or normal. Cherry red coloring is typically only seen in postmortem examinations."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1236 Inhalation Injury" },
        { title: "TP-1240 HAZMAT / Nerve Agent / Radiological" },
        { title: "TP-1220 Burns" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1241 Overdose / Poisoning" }
      ]
    }
  ]
};
