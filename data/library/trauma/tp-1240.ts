
import { Protocol } from '../../../types';

export const tp1240: Protocol = {
  id: "1240",
  refNo: "TP-1240",
  title: "HAZMAT / Nerve Agent / Radiological",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Apr 1, 2025",
  icon: "warning",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "HAZMAT / Nerve Agent", subtitle: "Adult • Standing Order", icon: "warning" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "DCON", content: "HAZMAT Exposure – Decontamination needed" },
        { title: "NRVA", content: "Nerve Agent / Organophosphate Exposure" },
        { title: "RDEX", content: "Radiological Exposure" },
        { title: "CYAN", content: "Cyanide Exposure / Smoke Inhalation with suspected CN poisoning" }
      ]
    },
    {
      type: "warning",
      content: "<b>SCENE SAFETY FIRST:</b><br>• Do NOT enter contaminated area without proper PPE<br>• Establish hot/warm/cold zones<br>• Decontamination BEFORE transport (except life-threatening emergencies)<br>• Notify receiving hospital of HAZMAT exposure EARLY<br>• Consider mass casualty protocols if multiple patients"
    },
    {
      type: "section",
      title: "Nerve Agent / Organophosphate"
    },
    {
      type: "accordion",
      title: "Recognition (SLUDGEM / DUMBELS)",
      items: [
        {
          title: "Cholinergic Toxidrome",
          content: "<b>SLUDGEM:</b><br>• <b>S</b>alivation<br>• <b>L</b>acrimation (tearing)<br>• <b>U</b>rination<br>• <b>D</b>efecation<br>• <b>G</b>I upset/cramping<br>• <b>E</b>mesis<br>• <b>M</b>iosis (pinpoint pupils)<br><br><b>DUMBELS:</b><br>• <b>D</b>iaphoresis/Diarrhea<br>• <b>U</b>rination<br>• <b>M</b>iosis<br>• <b>B</b>radycardia/Bronchorrhea/Bronchospasm<br>• <b>E</b>mesis<br>• <b>L</b>acrimation<br>• <b>S</b>alivation",
          icon: "visibility"
        },
        {
          title: "Severe Symptoms (Nicotinic)",
          content: "• Muscle fasciculations<br>• Weakness / paralysis<br>• Respiratory failure<br>• Seizures<br>• Altered mental status<br>• Cardiac arrhythmias"
        },
        {
          title: "Agents",
          content: "<b>Military nerve agents:</b> Sarin (GB), VX, Tabun, Soman<br><br><b>Organophosphate pesticides:</b> Malathion, Parathion, Diazinon<br><br><b>Carbamate pesticides:</b> Aldicarb, Carbaryl (reversible cholinesterase inhibition)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Nerve Agent Treatment",
      items: [
        {
          title: "Atropine (First-Line)",
          content: "<b>Indication:</b> Cholinergic symptoms, especially respiratory secretions<br><br><b>Adult Dose:</b><br>• <b>Mild:</b> 2 mg IM/IV<br>• <b>Moderate:</b> 4 mg IM/IV<br>• <b>Severe:</b> 6 mg IM/IV<br><br><b>Repeat every 5-10 minutes</b> until secretions dry (\"atropinization\")<br><br><b>Endpoint:</b> Drying of secretions, improved breathing. <b>NOT</b> pupil dilation.<br><br><b>Pediatric:</b> 0.05-0.1 mg/kg IV/IM (min 0.1 mg, max 2 mg per dose)<br><br><b>Large doses may be needed</b> – some patients require 20+ mg",
          icon: "medication"
        },
        {
          title: "Pralidoxime (2-PAM)",
          content: "<b>Indication:</b> Reactivates cholinesterase if given early (before \"aging\")<br><br><b>Adult Dose:</b><br>• <b>1-2 g IV</b> over 15-30 minutes, OR<br>• <b>600 mg IM</b> (DuoDote autoinjector contains 600 mg)<br><br><b>Repeat:</b> 1 g IV every hour if symptoms persist<br><br><b>Pediatric:</b> 25-50 mg/kg IV over 15-30 min (max 1 g)<br><br><b>Time-sensitive:</b> Most effective if given within 24-36 hours of exposure. Some agents (Soman) \"age\" in minutes.",
          icon: "medication"
        },
        {
          title: "DuoDote Autoinjector",
          content: "<b>Contains:</b> Atropine 2.1 mg + Pralidoxime 600 mg<br><br><b>Adult:</b><br>• <b>Mild:</b> 1 DuoDote IM<br>• <b>Moderate:</b> 2 DuoDotes IM<br>• <b>Severe:</b> 3 DuoDotes IM<br><br><b>Pediatric (weight-based):</b><br>• < 7 kg: Not recommended (use individual drugs)<br>• 7-18 kg: 0.5 DuoDote<br>• 18-41 kg: 1 DuoDote<br>• > 41 kg: Adult dosing<br><br><b>Inject into lateral thigh</b> (through clothing if needed)",
          icon: "vaccines"
        },
        {
          title: "Benzodiazepine (Seizures)",
          content: "<b>Indication:</b> Seizure activity (common in severe exposure)<br><br><b>Midazolam:</b> 5 mg IM/IN or 2 mg IV, may repeat<br><br><b>Diazepam:</b> 5-10 mg IV/IM<br><br><b>Treat aggressively:</b> Nerve agent seizures are often refractory and may require high doses",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Cyanide Poisoning"
    },
    {
      type: "accordion",
      title: "Cyanide Recognition and Treatment",
      items: [
        {
          title: "Recognition",
          content: "<b>Sources:</b><br>• Smoke inhalation (burning plastics, synthetics, wool, silk)<br>• Industrial exposure (metal plating, photography, fumigation)<br>• Intentional poisoning<br><br><b>Signs:</b><br>• Altered mental status, confusion, seizures<br>• Hypotension, cardiovascular collapse<br>• Cherry red skin (late, unreliable)<br>• Bitter almond odor (only 40% can detect)<br>• Lactic acidosis out of proportion to hypoxia"
        },
        {
          title: "Hydroxocobalamin (Cyanokit)",
          content: "<b>FIRST-LINE antidote for suspected cyanide poisoning</b><br><br><b>Adult Dose:</b> 5 g IV over 15 minutes<br><br><b>May repeat:</b> Additional 5 g if severe or no response<br><br><b>Pediatric:</b> 70 mg/kg IV (max 5 g)<br><br><b>Mechanism:</b> Binds cyanide to form cyanocobalamin (Vitamin B12)<br><br><b>Side effects:</b> Red discoloration of skin, urine, mucous membranes (harmless). May interfere with lab colorimetric assays.",
          icon: "medication"
        },
        {
          title: "High-Flow Oxygen",
          content: "100% O2 for all suspected cyanide exposures. Hyperbaric oxygen may be considered for combined CO/CN poisoning."
        }
      ]
    },
    {
      type: "section",
      title: "Radiological Exposure"
    },
    {
      type: "accordion",
      title: "Radiological Emergency",
      items: [
        {
          title: "Types of Exposure",
          content: "<b>External contamination:</b> Radioactive material on skin/clothing<br><b>Internal contamination:</b> Inhalation, ingestion, wound absorption<br><b>Radiation exposure:</b> Exposure to source without contamination (no decon needed)<br><br><b>Dirty bomb:</b> Conventional explosive + radioactive material – treat as trauma + contamination"
        },
        {
          title: "Acute Radiation Syndrome",
          content: "<b>Prodromal phase</b> (hours-days): Nausea, vomiting, diarrhea, fatigue<br><br><b>Latent phase:</b> Symptoms may temporarily improve<br><br><b>Manifest illness:</b> Bone marrow suppression, GI damage, CNS effects (high dose)<br><br><b>Severity indicators:</b><br>• Vomiting within 1 hour = significant exposure<br>• Vomiting within 10 minutes = potentially lethal dose"
        },
        {
          title: "Treatment",
          content: "<b>Decontamination:</b> Remove clothing (eliminates 90% of contamination), gentle washing with soap and water<br><br><b>Supportive care:</b> IV fluids, antiemetics, monitor for bone marrow suppression<br><br><b>Potassium Iodide (KI):</b> Only for radioactive iodine exposure (nuclear plant accident). 130 mg PO adult, must be given within 24 hours of exposure.<br><br><b>Specialty consultation:</b> Contact radiation emergency assistance center (REAC/TS) for guidance"
        }
      ]
    },
    {
      type: "section",
      title: "General HAZMAT"
    },
    {
      type: "accordion",
      title: "Decontamination Principles",
      items: [
        {
          title: "Gross Decontamination",
          content: "<b>Remove clothing:</b> Eliminates 80-90% of contamination<br><br><b>Dry decon:</b> Brush off powders/solids before wet decon<br><br><b>Water flush:</b> Copious water irrigation for liquids, chemicals<br>• Avoid contaminated runoff entering wounds<br>• Lukewarm water preferred<br>• 15-20 minutes for chemical exposure<br><br><b>Eye irrigation:</b> Morgan lens or continuous flush for ocular exposure"
        },
        {
          title: "Special Considerations",
          content: "<b>Corrosive chemicals:</b> Immediate water irrigation, prolonged (30+ minutes)<br><br><b>Dry chemicals:</b> Brush off before water (some react with water)<br><br><b>Phenol:</b> Use polyethylene glycol (PEG) if available, then water<br><br><b>Hydrofluoric acid:</b> Calcium gluconate gel topically, may need IV/IA calcium<br><br><b>White phosphorus:</b> Keep wet (ignites when dry), copious water irrigation"
        }
      ]
    },
    {
      type: "warning",
      content: "<b>MASS CASUALTY CONSIDERATIONS:</b><br><br>• Implement MCI protocol if multiple patients<br>• Establish decon corridor before treatment<br>• Notify hospitals of incoming HAZMAT patients<br>• Consider hospital decon capabilities<br>• Document exposure type, duration, symptoms for all patients<br>• Law enforcement/fire HAZMAT team for scene control"
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Higher surface area:volume ratio:</b> More susceptible to dermal absorption, hypothermia during decon<br><br><b>Respiratory:</b> Higher minute ventilation = more inhalation exposure<br><br><b>Decontamination:</b> Keep warm during decon, dry quickly<br><br><b>Atropine dosing:</b> 0.05-0.1 mg/kg (larger doses than typical pediatric atropine use)"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Nerve agent antidote sequence:</b> Atropine first, then Pralidoxime. Don't wait for pralidoxime to give atropine.<br><br><b>\"Dry the secretions\":</b> The endpoint for atropine is drying of pulmonary secretions, NOT pupil dilation or heart rate.<br><br><b>Smoke inhalation = cyanide:</b> Any structure fire patient with altered mental status should be treated for presumptive cyanide poisoning with hydroxocobalamin.<br><br><b>Decon delays treatment:</b> In life-threatening emergencies, minimal decon (clothing removal) may allow rapid transport. Balance decon vs treatment urgency."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1241 Overdose/Poisoning" },
        { title: "TP-1238 Carbon Monoxide Exposure" },
        { title: "TP-1236 Inhalation Injury" },
        { title: "TP-1220 Burns" },
        { title: "TP-1210 Cardiac Arrest" }
      ]
    }
  ]
};
