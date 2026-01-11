import { Protocol } from '../../../types';

export const tp1236: Protocol = {
  id: "1236",
  refNo: "TP-1236",
  title: "Inhalation Injury / Smoke Inhalation",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "whatshot",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Inhalation Injury", subtitle: "Adult - Standing Order", icon: "whatshot" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "INHI", content: "Inhalation Injury - Thermal or chemical airway injury" },
        { title: "SMKI", content: "Smoke Inhalation - Structure fire with toxic gas exposure" },
        { title: "CYAN", content: "Cyanide Exposure - Suspected CN poisoning from combustion" },
        { title: "COEX", content: "Carbon Monoxide Exposure - See TP-1238 for isolated CO" }
      ]
    },
    {
      type: "warning",
      content: "<b>AIRWAY EMERGENCY:</b> Inhalation injury can cause rapid, progressive airway edema. Early intubation may be lifesaving - waiting for visible swelling may result in an impossible airway. When in doubt, intubate early."
    },
    {
      type: "section",
      title: "Types of Inhalation Injury"
    },
    {
      type: "accordion",
      title: "Injury Classification",
      items: [
        {
          title: "Thermal Injury (Upper Airway)",
          content: "<b>Mechanism:</b><br>- Direct heat injury to upper airway (above glottis)<br>- Steam carries 4000x more heat than dry air<br>- Lower airway usually protected by reflex laryngospasm and efficient heat exchange<br><br><b>Clinical significance:</b><br>- Rapid development of edema<br>- Supraglottic structures swell first<br>- Can progress to complete airway obstruction<br>- Peak edema typically 24-48 hours",
          icon: "local_fire_department"
        },
        {
          title: "Chemical Injury (Lower Airway)",
          content: "<b>Mechanism:</b><br>- Toxic gases and particles reach lower airways<br>- Chemical irritation causes inflammation<br>- Mucosal sloughing, bronchospasm, ARDS<br><br><b>Common toxic products:</b><br>- Carbon monoxide (all fires)<br>- Hydrogen cyanide (plastics, synthetics, wool, silk)<br>- Acrolein (wood, paper)<br>- Hydrogen chloride (PVC)<br>- Phosgene (refrigerants, plastics)<br>- Nitrogen oxides (various materials)",
          icon: "science"
        },
        {
          title: "Systemic Toxicity",
          content: "<b>Carbon Monoxide:</b><br>- Present in virtually all fires<br>- See TP-1238 for detailed management<br>- SpO2 unreliable<br><br><b>Cyanide:</b><br>- Generated from burning synthetics, wool, silk, plastics<br>- Inhibits cellular respiration<br>- Causes rapid cellular hypoxia<br>- Often coexists with CO poisoning"
        }
      ]
    },
    {
      type: "section",
      title: "Recognition"
    },
    {
      type: "accordion",
      title: "Clinical Assessment",
      items: [
        {
          title: "History Red Flags",
          content: "<b>High-risk mechanism:</b><br>- Enclosed space fire<br>- Prolonged exposure<br>- Loss of consciousness at scene<br>- Explosion or flash burn<br>- Steam exposure (extremely dangerous)<br><br><b>Scene indicators:</b><br>- House/structure fire<br>- Industrial fire with chemicals<br>- Vehicle fire with entrapment<br>- Burning plastics, synthetics visible",
          icon: "warning"
        },
        {
          title: "Signs of Airway Burns",
          content: "<b>Upper airway injury indicators:</b><br>- Facial burns (especially perioral)<br>- Singed nasal hairs, eyebrows, eyelashes<br>- Carbonaceous sputum (soot in sputum)<br>- Soot in nares, oropharynx<br>- Hoarseness, voice changes<br>- Stridor (late, ominous sign)<br>- Drooling (unable to swallow secretions)<br>- Oropharyngeal edema or erythema<br><br><b>Signs of lower airway involvement:</b><br>- Wheezing, bronchospasm<br>- Productive cough<br>- Dyspnea, tachypnea<br>- Chest tightness",
          icon: "visibility"
        },
        {
          title: "Signs of Cyanide Toxicity",
          content: "<b>Clinical presentation:</b><br>- Altered mental status (confusion to coma)<br>- Seizures<br>- Cardiovascular collapse (hypotension, arrhythmias)<br>- Cardiac arrest (especially refractory)<br>- Lactic acidosis out of proportion to clinical picture<br><br><b>Classic but unreliable:</b><br>- Bitter almond odor (only 40% can detect)<br>- Cherry red skin (unreliable)<br><br><b>High suspicion with:</b><br>- Smoke inhalation + AMS<br>- Smoke inhalation + hypotension<br>- Cardiac arrest in fire victim"
        }
      ]
    },
    {
      type: "section",
      title: "Airway Management"
    },
    {
      type: "accordion",
      title: "Airway Decision Making",
      items: [
        {
          title: "Indications for Early Intubation",
          content: "<b>INTUBATE EARLY if ANY of the following:</b><br><br>- Stridor or significant hoarseness<br>- Visible oropharyngeal edema<br>- Deep facial burns or circumferential neck burns<br>- Full-thickness burns to face/neck<br>- Respiratory distress<br>- GCS < 8 or rapidly declining mental status<br>- Inability to swallow secretions<br>- Carbonaceous sputum with any respiratory symptoms<br>- Burns > 40% TBSA (likely will need intubation)<br><br><b>Key principle:</b> If you are considering intubation, do it now. The airway will only get worse.",
          icon: "warning"
        },
        {
          title: "Intubation Considerations",
          content: "<b>Preparation:</b><br>- Have backup airways ready (surgical airway kit)<br>- Smaller ETT may be needed (6.0-7.0)<br>- Expect difficult airway<br>- Video laryngoscopy preferred if available<br><br><b>RSI medications:</b><br>- Ketamine preferred (maintains hemodynamics)<br>- Avoid succinylcholine if burns > 24 hours old (hyperkalemia risk)<br>- Rocuronium 1.2 mg/kg for rapid paralysis<br><br><b>Cricothyrotomy:</b><br>- Must be prepared for surgical airway<br>- May be only option if severe supraglottic edema"
        },
        {
          title: "If NOT Intubating",
          content: "<b>Close monitoring required:</b><br>- Continuous SpO2<br>- Frequent airway reassessment<br>- Position of comfort (sitting if able)<br>- Suction ready<br><br><b>Watch for deterioration:</b><br>- Increasing hoarseness<br>- Worsening stridor<br>- Increased work of breathing<br>- Inability to speak full sentences<br><br><b>Be prepared:</b><br>- Have intubation equipment ready<br>- Short transport time does not eliminate risk"
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
          title: "High-Flow Oxygen",
          content: "<b>100% O2 via NRB at 15 LPM for ALL patients</b><br><br><b>Rationale:</b><br>- Treats CO poisoning (reduces half-life)<br>- Supports oxygenation despite V/Q mismatch<br>- Does NOT worsen cyanide toxicity<br><br><b>Do NOT:</b><br>- Titrate based on SpO2 (unreliable with CO)<br>- Use nasal cannula (inadequate FiO2)<br>- Withhold for any reason<br><br><b>If intubated:</b><br>- FiO2 100%<br>- PEEP 5-10 cmH2O for lower airway injury",
          icon: "medication"
        },
        {
          title: "Bronchospasm Management",
          content: "<b>Albuterol:</b><br>- 2.5-5 mg nebulized<br>- May repeat every 10-15 minutes<br>- Higher doses often needed<br><br><b>Ipratropium (Atrovent):</b><br>- 0.5 mg nebulized with albuterol<br>- Especially useful for chemical irritation<br><br><b>Continuous nebulization:</b><br>- Consider for severe bronchospasm<br><br><b>Note:</b> Use in-line nebulization if intubated",
          icon: "medication"
        },
        {
          title: "Cyanide Antidote",
          content: "<b>Hydroxocobalamin (Cyanokit)</b><br><br><b>Indications (smoke inhalation with any of):</b><br>- Altered mental status<br>- Hypotension (SBP < 90)<br>- Cardiac arrest<br>- Seizures<br>- Lactic acidosis<br><br><b>Dose:</b><br>- Adult: 5 g IV over 15 minutes<br>- Pediatric: 70 mg/kg IV (max 5 g)<br>- May repeat 5 g if severe/no response<br><br><b>Side effects:</b><br>- Red discoloration of skin, urine (harmless)<br>- May interfere with lab colorimetric assays<br><br><b>Do NOT delay for lab confirmation</b>",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "Additional Management",
      items: [
        {
          title: "IV Access and Fluids",
          content: "<b>Establish large-bore IV access</b><br><br><b>Fluid resuscitation:</b><br>- If isolated inhalation injury: cautious fluids<br>- If combined with burns > 20% TBSA: aggressive fluids per burn protocol<br><br><b>Caution:</b> Excessive fluids in isolated inhalation injury may worsen pulmonary edema"
        },
        {
          title: "Cardiac Monitoring",
          content: "<b>Continuous cardiac monitoring essential</b><br><br><b>Watch for:</b><br>- Arrhythmias (hypoxia, cyanide, CO)<br>- ST changes (CO-induced cardiac ischemia)<br>- PEA arrest (cyanide toxicity)<br><br><b>12-lead ECG</b> if hemodynamically stable"
        },
        {
          title: "Pain Management",
          content: "<b>For concurrent burn injuries:</b><br>- Fentanyl 1-2 mcg/kg IV/IN<br>- Morphine 0.1 mg/kg IV<br><br><b>Caution:</b><br>- Respiratory depression in compromised patient<br>- Titrate carefully<br>- Ketamine may be preferred (maintains respiratory drive)"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Anatomic differences:</b><br>- Smaller airway diameter - edema causes greater obstruction<br>- Shorter neck, larger tongue<br>- Airway deterioration may be faster<br><br><b>Lower threshold for intubation:</b><br>- Children compensate until they don't<br>- Err on side of early intubation<br><br><b>Hydroxocobalamin dosing:</b><br>- 70 mg/kg IV (max 5 g)<br><br><b>ETT sizes:</b><br>- (Age/4) + 4 for uncuffed<br>- (Age/4) + 3.5 for cuffed<br>- May need 0.5 size smaller due to edema"
    },
    {
      type: "warning",
      content: "<b>TRANSPORT DESTINATION:</b><br><br>Patients with significant inhalation injury should be transported to a burn center when possible, especially if:<br><br>- Confirmed or suspected airway burns<br>- Combined inhalation + cutaneous burns<br>- Cyanide toxicity suspected<br>- Requiring intubation<br><br>Contact base hospital for burn center destination guidance if patient is stable for transport."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>The airway only gets worse:</b> If you are thinking about intubating, do it now. Peak edema is 24-48 hours out, but significant swelling can occur within hours.<br><br><b>Soot = smoke:</b> Carbonaceous sputum or soot in the airway confirms significant smoke exposure even if patient looks good initially.<br><br><b>Treat the triad:</b> Structure fire patients often have thermal injury + CO + cyanide. Treat all three: early airway, 100% O2, hydroxocobalamin.<br><br><b>SpO2 lies twice:</b> In smoke inhalation, SpO2 can be falsely elevated (CO) or normal despite significant respiratory compromise (chemical injury with intact O2 exchange initially).<br><br><b>Steam is worse than fire:</b> Steam at 100C has 4000x the heat capacity of dry air. Steam burns cause devastating airway injury.<br><br><b>Hoarseness is a gift:</b> Voice changes are an early warning sign giving you time to act. Stridor means you may already be too late for easy intubation."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1238 Carbon Monoxide Exposure" },
        { title: "TP-1220 Burns" },
        { title: "TP-1240 HAZMAT / Nerve Agent / Radiological" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "PP-1304 Rapid Sequence Intubation" }
      ]
    }
  ]
};
