
import { Protocol } from '../../../types';

export const procAirway: Protocol = {
  id: "PROC-AIRWAY",
  refNo: "MCG 1302",
  title: "Airway Management and Monitoring",
  category: "Procedures",
  type: "Medical Control Guideline",
  lastUpdated: "Oct 1, 2025",
  icon: "pulmonology",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Airway Management", subtitle: "MCG 1302 • Medical Control Guideline", icon: "pulmonology" }]
    },
    {
      type: "warning",
      content: "<b>AIRWAY FIRST:</b> No patient ever died from lack of an advanced airway. Patients die from hypoxia.<br><br>Prioritize <b>oxygenation and ventilation</b> over tube placement. BVM with good technique is life-saving."
    },
    {
      type: "section",
      title: "Basic Airway Management (BLS)"
    },
    {
      type: "accordion",
      title: "Positioning and Maneuvers",
      items: [
        {
          title: "Head-Tilt Chin-Lift",
          content: "<b>Indication:</b> Any unresponsive patient without suspected C-spine injury<br><br><b>Technique:</b><br>• Place one hand on forehead, tilt head back<br>• Lift chin with fingers of other hand<br>• Do NOT press on soft tissue under chin<br><br><b>Opens airway by:</b> Lifting tongue off posterior pharynx",
          icon: "accessibility"
        },
        {
          title: "Jaw Thrust",
          content: "<b>Indication:</b> Suspected C-spine injury, trauma, or when head-tilt contraindicated<br><br><b>Technique:</b><br>• Stabilize head in neutral position<br>• Place fingers behind angle of mandible<br>• Thrust jaw anteriorly (forward)<br>• May use thumbs to open mouth<br><br><b>Advantage:</b> Opens airway without neck extension",
          icon: "accessibility"
        },
        {
          title: "Recovery Position",
          content: "<b>Indication:</b> Spontaneously breathing, unresponsive patient without trauma<br><br>Place on side to allow secretions to drain. Monitor airway continuously.",
          icon: "airline_seat_flat"
        }
      ]
    },
    {
      type: "accordion",
      title: "Airway Adjuncts",
      items: [
        {
          title: "Oropharyngeal Airway (OPA)",
          content: "<b>Indication:</b> Unconscious patient with no gag reflex<br><br><b>Sizing:</b> Corner of mouth to angle of mandible<br><br><b>Insertion:</b> Insert upside down (concave up), rotate 180° as you advance past tongue. Or use tongue depressor and insert with curve following tongue.<br><br><b>Contraindication:</b> Presence of gag reflex (will cause vomiting)"
        },
        {
          title: "Nasopharyngeal Airway (NPA)",
          content: "<b>Indication:</b> Semi-conscious patient, trismus, or unable to tolerate OPA<br><br><b>Sizing:</b> Tip of nose to earlobe. Diameter = patient's little finger<br><br><b>Insertion:</b> Lubricate. Insert into nostril perpendicular to face (NOT aimed toward brain). Bevel toward septum. Advance gently along floor of nasal cavity.<br><br><b>Relative Contraindication:</b> Severe facial trauma, suspected basilar skull fracture (relative – can still use in life-threatening airway emergency)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Bag-Valve-Mask (BVM) Ventilation",
      items: [
        {
          title: "Technique",
          content: "<b>Mask Seal:</b><br>• 'C-E' grip – thumb and index form C around mask, remaining fingers form E on mandible<br>• Ensure mask covers nose and mouth with no air leak<br><br><b>Ventilation:</b><br>• Squeeze bag over 1 second<br>• Deliver just enough for visible chest rise<br>• Rate: 10-12 breaths/min (adult), 12-20 (pediatric)<br>• Allow complete exhalation between breaths<br><br><b>Two-Person Technique (preferred):</b><br>• One person holds mask with two hands (bilateral E-C grip)<br>• Second person squeezes bag"
        },
        {
          title: "Oxygen Flow",
          content: "<b>High-flow oxygen:</b> 15 LPM with reservoir<br><br><b>With reservoir:</b> Delivers near 100% FiO2<br><b>Without reservoir:</b> Only 40-60% FiO2<br><br><b>Always attach reservoir and O2</b> unless patient is apneic with spontaneous circulation (then titrate to SpO2 94-98%)"
        },
        {
          title: "Troubleshooting Poor Ventilation",
          content: "<b>Poor chest rise:</b><br>• Reposition head/jaw<br>• Check mask seal<br>• Add OPA/NPA<br>• Two-person technique<br>• Suction if secretions<br>• Consider obstruction – direct laryngoscopy<br><br><b>Gastric insufflation:</b><br>• Slow ventilations (over 1 second)<br>• Avoid excessive tidal volume<br>• Consider cricoid pressure (controversial)"
        }
      ]
    },
    {
      type: "section",
      title: "Advanced Airway Management (ALS)"
    },
    {
      type: "accordion",
      title: "Supraglottic Airways (Rescue Devices)",
      items: [
        {
          title: "iGel",
          content: "<b>Sizing:</b><br>• Size 3: 30-60 kg<br>• Size 4: 50-90 kg<br>• Size 5: > 90 kg<br><br><b>Insertion:</b><br>1. Lubricate back of device<br>2. Open mouth, insert with cuff facing chin<br>3. Advance along hard palate until resistance felt<br>4. Confirm placement with auscultation and capnography<br><br><b>No cuff inflation needed</b> – gel conforms to anatomy"
        },
        {
          title: "King Airway (LT-D)",
          content: "<b>Sizing (by height):</b><br>• Size 3: 4-5 feet<br>• Size 4: 5-6 feet<br>• Size 5: > 6 feet<br><br><b>Insertion:</b><br>1. Lubricate device<br>2. Insert in midline, rotate if needed<br>3. Advance until base of connector reaches teeth<br>4. Inflate cuff (60-80 mL for adult sizes)<br>5. Ventilate through larger lumen, confirm with capnography"
        },
        {
          title: "When to Use Supraglottic Airway",
          content: "<b>First-line in cardiac arrest:</b> Faster placement, comparable outcomes to ETT<br><br><b>Rescue device:</b> After failed intubation attempts<br><br><b>Cannot intubate:</b> Difficult airway, limited resources<br><br><b>Note:</b> Does not provide complete aspiration protection but acceptable in arrest"
        }
      ]
    },
    {
      type: "accordion",
      title: "Endotracheal Intubation (ETI)",
      items: [
        {
          title: "Indications",
          content: "• Failure to oxygenate/ventilate with BLS methods<br>• Airway protection needed (GCS ≤ 8, absent gag)<br>• Anticipated clinical course (impending airway compromise)<br>• Therapeutic hyperventilation (head injury with herniation)"
        },
        {
          title: "Procedure Summary",
          content: "<b>Preparation:</b> Equipment check, preoxygenation, sedation if indicated<br><b>Laryngoscopy:</b> Mac or Miller blade, visualize cords<br><b>Tube Placement:</b> Pass tube through cords, inflate cuff<br><b>Confirmation:</b> Waveform capnography (REQUIRED), auscultation<br><br><b>See PROC-ETI for detailed intubation procedure</b>"
        },
        {
          title: "LA County EMS Sedation",
          content: "<b>LA County does NOT authorize RSI (no paralytics).</b><br><br><b>Sedation options:</b><br>• Midazolam 0.1-0.2 mg/kg IV<br>• Fentanyl 1-2 mcg/kg IV<br><br>Intubate during periods of apnea or with light sedation in patients with diminished consciousness."
        }
      ]
    },
    {
      type: "section",
      title: "Monitoring and Confirmation"
    },
    {
      type: "accordion",
      title: "Capnography",
      items: [
        {
          title: "Waveform Capnography (REQUIRED)",
          content: "<b>MANDATORY for all advanced airways.</b><br><br><b>Normal waveform:</b> Square wave pattern with plateau<br><b>Normal ETCO2:</b> 35-45 mmHg<br><br><b>Confirms:</b><br>• Tracheal tube placement (not esophageal)<br>• Effective CPR (ETCO2 > 10 suggests adequate compressions)<br>• ROSC (sudden ETCO2 rise)"
        },
        {
          title: "ETCO2 Targets",
          content: "<b>Normal ventilation:</b> 35-45 mmHg<br><b>Hyperventilation (herniation):</b> 30-35 mmHg<br><b>Cardiac arrest:</b> ETCO2 > 10 indicates adequate CPR<br><b>ROSC indicator:</b> Sudden rise in ETCO2 (often > 40)"
        },
        {
          title: "Colorimetric CO2 Detector",
          content: "<b>Use only if waveform capnography unavailable.</b><br><br>• Purple/blue = no CO2 (esophageal)<br>• Yellow = CO2 present (tracheal)<br><br><b>Limitations:</b> Does not provide continuous monitoring, may be unreliable in low-flow states"
        }
      ]
    },
    {
      type: "accordion",
      title: "Pulse Oximetry",
      items: [
        {
          title: "SpO2 Targets",
          content: "<b>General:</b> SpO2 94-98% (avoid hyperoxia)<br><b>COPD:</b> SpO2 88-92%<br><b>Cardiac Arrest:</b> Titrate O2 after ROSC<br><b>Carbon Monoxide:</b> SpO2 unreliable (reads falsely high)"
        },
        {
          title: "Limitations",
          content: "• Poor perfusion (shock, hypothermia) – may not read<br>• Motion artifact<br>• Nail polish (dark colors)<br>• Carbon monoxide poisoning (falsely elevated)<br>• Methemoglobinemia (reads ~85%)"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Anatomic differences:</b><br>• Larger tongue, smaller mouth<br>• Anterior/cephalad larynx<br>• Shorter trachea (easy right mainstem)<br>• Narrowest point at cricoid (not cords)<br><br><b>ETT Size:</b><br>• Uncuffed: (Age/4) + 4<br>• Cuffed: (Age/4) + 3<br>• Depth: (Age/2) + 12 cm at lips<br><br><b>Blade:</b> Straight (Miller) preferred in infants/young children"
    },
    {
      type: "warning",
      content: "<b>FAILED AIRWAY:</b><br><br>If unable to intubate after 2 attempts OR SpO2 < 90%:<br>1. Resume BVM ventilation<br>2. Reoxygenate to SpO2 > 95%<br>3. Insert supraglottic airway (iGel/King)<br>4. Do NOT exceed 3 intubation attempts<br>5. Consider surgical airway ONLY if cannot ventilate by any means"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>BVM is often all you need.</b> With good technique (two-person, airway adjuncts, proper positioning), BVM ventilation is effective for most patients.<br><br><b>Hyperventilation kills.</b> Avoid rapid ventilations – causes gastric insufflation, decreases venous return, and worsens outcomes in cardiac arrest.<br><br><b>Waveform capnography is your friend.</b> It tells you if your tube is in the right place, if CPR is effective, and when you get ROSC.<br><br><b>Don't be a hero.</b> If you can't intubate, go to your rescue airway. A supraglottic device is better than repeated failed attempts."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "PROC-ETI Endotracheal Intubation" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1243 Traumatic Arrest" },
        { title: "MCG 1335 Needle Thoracostomy" },
        { title: "TP-1234 Airway Obstruction" }
      ]
    }
  ]
};
