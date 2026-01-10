
import { Protocol } from '../../../types';

export const tp1216: Protocol = {
  id: "1216",
  refNo: "TP-1216",
  title: "Newborn / Neonatal Resuscitation",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2026",
  icon: "child_care",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Newborn Resuscitation", subtitle: "Neonatal • Standing Order", icon: "child_care" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "BABY", content: "Newborn (use for all newborn deliveries requiring assessment or resuscitation)" },
        { title: "PREM", content: "Premature infant < 37 weeks gestational age" }
      ]
    },
    {
      type: "warning",
      content: "<b>CRITICAL FIRST MINUTE:</b><br>Most newborns respond to warming, drying, and stimulation alone.<br><br><b>Only 1% of newborns require CPR.</b> Ventilation is the MOST important intervention.<br><br><b>DO NOT delay PPV</b> for suctioning, cord clamping, or other interventions if baby is not breathing."
    },
    {
      type: "section",
      title: "Initial Assessment"
    },
    {
      type: "accordion",
      title: "Rapid Evaluation (First 30 Seconds)",
      items: [
        {
          title: "Three Questions",
          content: "<b>1. Term gestation?</b> (≥37 weeks)<br><b>2. Good muscle tone?</b><br><b>3. Breathing or crying?</b><br><br><b>YES to ALL:</b> Routine care (skin-to-skin, dry, warm, delayed cord clamping)<br><b>NO to ANY:</b> Proceed to initial steps",
          icon: "checklist"
        },
        {
          title: "Initial Steps - All Newborns",
          content: "<b>W</b>arm - Prevent heat loss (radiant warmer, plastic wrap for preterm)<br><b>D</b>ry - Thoroughly with warm towels, remove wet linen<br><b>S</b>timulate - Rub back firmly, flick soles of feet<br><b>P</b>osition - Sniffing position, neutral neck (towel roll under shoulders if needed)<br><b>C</b>lear - Suction mouth then nose ONLY if obstructed (bulb syringe or suction catheter)<br><b>R</b>eplace - Wet towels with dry, hat for heat retention",
          icon: "thermostat"
        },
        {
          title: "Assess at 30 Seconds",
          content: "<b>Heart Rate:</b> Auscultate or palpate umbilical pulse (6-second count x 10)<br><b>Respirations:</b> Breathing effectively? Good cry?<br><br><b>HR ≥ 100 + Breathing:</b> Continue supportive care, monitor<br><b>HR < 100 OR Apnea/Gasping:</b> Begin PPV immediately",
          icon: "favorite"
        }
      ]
    },
    {
      type: "section",
      title: "Resuscitation Algorithm"
    },
    {
      type: "list",
      title: "Step 1: Positive Pressure Ventilation (PPV)",
      items: [
        { title: "Indication", content: "Apnea, gasping, OR HR < 100 after initial steps" },
        { title: "Equipment", content: "Self-inflating bag with reservoir OR flow-inflating bag. Appropriate size mask (covers nose, mouth, and chin tip)." },
        { title: "Oxygen", content: "<b>Term infant:</b> Start with 21% (room air)<br><b>Preterm < 35 weeks:</b> Start with 21-30%<br>Titrate to SpO2 targets (see below)" },
        { title: "Rate", content: "<b>40-60 breaths/minute</b> (squeeze-two-three pattern)" },
        { title: "Pressure", content: "Gentle puffs – just enough for visible chest rise. Initial PIP 20-25 cmH2O." },
        { title: "Reassess", content: "After 30 seconds of effective PPV: HR rising? Chest rise? SpO2 improving?" }
      ]
    },
    {
      type: "accordion",
      title: "Step 2: PPV Corrective Steps (MR. SOPA)",
      items: [
        {
          title: "If HR Not Improving with PPV",
          content: "<b>M</b>ask adjustment – Ensure proper seal, no air leak<br><b>R</b>eposition airway – Neutral sniffing position, shoulder roll<br><b>S</b>uction – Clear secretions from mouth and nose<br><b>O</b>pen mouth – Jaw thrust, open mouth slightly during ventilation<br><b>P</b>ressure increase – Increase PIP incrementally until chest rise<br><b>A</b>irway alternative – Consider LMA (≥34 weeks, ≥2kg) or ETT",
          icon: "settings"
        }
      ]
    },
    {
      type: "list",
      title: "Step 3: Chest Compressions",
      items: [
        { title: "Indication", content: "<b>HR < 60 despite 30 seconds of effective PPV</b> (with chest rise)" },
        { title: "Technique", content: "<b>Two-thumb encircling technique preferred.</b> Place thumbs on lower 1/3 of sternum, fingers encircling chest. Compress 1/3 AP diameter." },
        { title: "Ratio", content: "<b>3:1</b> (3 compressions : 1 ventilation). 120 events/minute = 90 compressions + 30 breaths." },
        { title: "Oxygen", content: "Increase to <b>100% O2</b> when starting compressions." },
        { title: "Reassess", content: "Every 60 seconds. If HR ≥ 60, stop compressions, continue PPV." }
      ]
    },
    {
      type: "accordion",
      title: "Step 4: Medications",
      items: [
        {
          title: "Epinephrine",
          content: "<b>Indication:</b> HR < 60 despite 60+ seconds of effective CPR + PPV<br><br><b>IV/IO Route (preferred):</b><br>• <b>0.01-0.03 mg/kg</b> (1:10,000)<br>• <b>0.1-0.3 mL/kg</b><br>• May repeat every 3-5 minutes<br><br><b>ET Route (while establishing access):</b><br>• <b>0.05-0.1 mg/kg</b> (1:10,000)<br>• <b>0.5-1 mL/kg</b><br>• Less reliable absorption",
          icon: "medication"
        },
        {
          title: "Volume Expansion",
          content: "<b>Indication:</b> Suspected blood loss (placental abruption, placenta previa, cord tear) with hypovolemia despite resuscitation<br><br><b>Fluid:</b> Normal saline or O-negative blood<br><b>Dose:</b> 10 mL/kg IV/IO over 5-10 minutes<br><b>May repeat</b> if poor response",
          icon: "water_drop"
        },
        {
          title: "Umbilical Vein Catheterization",
          content: "Preferred vascular access in neonates.<br><br><b>Technique:</b><br>• Cut cord 1-2 cm from skin<br>• Identify single large thin-walled vein (vs 2 thick-walled arteries)<br>• Insert catheter 2-4 cm until blood return<br>• Avoid advancing too far (liver injection)",
          icon: "medical_services"
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Meconium-Stained Amniotic Fluid",
      items: [
        {
          title: "Current Guidelines (NRP 8th Edition)",
          content: "<b>DO NOT routinely suction</b> trachea for meconium.<br><br><b>Vigorous Newborn (crying, good tone):</b> Routine care. Suction mouth/nose only if obstructed.<br><br><b>Non-vigorous Newborn:</b> Begin PPV. Intubate and suction ONLY if airway is obstructed and ventilation is ineffective.<br><br><b>Key Change:</b> Routine intubation for meconium is no longer recommended."
        }
      ]
    },
    {
      type: "accordion",
      title: "Preterm Infant (<37 weeks)",
      items: [
        {
          title: "Special Considerations",
          content: "<b>Temperature:</b> High risk of hypothermia. Use polyethylene wrap/bag (don't dry first). Increase room temp. Cover head.<br><br><b>Oxygen:</b> Start with 21-30%. Avoid hyperoxia (target SpO2 per minute-of-life goals).<br><br><b>Ventilation:</b> May need lower pressures. High risk for pneumothorax.<br><br><b>Surfactant:</b> May be needed; hospital decision.<br><br><b>Transport:</b> Notify NICU early. Maintain normothermia during transport."
        }
      ]
    },
    {
      type: "accordion",
      title: "Cord Issues",
      items: [
        {
          title: "Nuchal Cord",
          content: "<b>Loose nuchal cord:</b> Slip over head or deliver through the loop.<br><br><b>Tight nuchal cord:</b> Somersault maneuver (keep head close to perineum, deliver body through loop) OR double clamp and cut if necessary."
        },
        {
          title: "Prolapsed Cord",
          content: "<b>Life-threatening emergency.</b><br><br>1. Call for immediate ALS backup and transport<br>2. Place mother in knee-chest position or steep Trendelenburg<br>3. Insert gloved hand into vagina<br>4. Lift presenting part OFF the cord<br>5. Keep cord warm and moist (do NOT replace into vagina)<br>6. Maintain manual elevation until cesarean delivery<br>7. Transport EMERGENTLY to closest hospital with OB capability"
        }
      ]
    },
    {
      type: "info",
      title: "APGAR Score",
      content: "<b>Assess at 1 and 5 minutes</b> (continue if < 7 at 5 min):<br><br><b>A</b>ppearance (color): Blue/pale=0, Acrocyanosis=1, Pink=2<br><b>P</b>ulse (HR): Absent=0, <100=1, ≥100=2<br><b>G</b>rimace (reflex): None=0, Grimace=1, Cry/cough=2<br><b>A</b>ctivity (tone): Limp=0, Some flexion=1, Active motion=2<br><b>R</b>espiration: Absent=0, Weak/irregular=1, Strong cry=2<br><br><b>7-10:</b> Normal. <b>4-6:</b> Moderately depressed. <b>0-3:</b> Severely depressed."
    },
    {
      type: "info",
      title: "SpO2 Targets by Minute of Life",
      content: "<b>Preductal SpO2 targets (right hand):</b><br><br>1 min: 60-65%<br>2 min: 65-70%<br>3 min: 70-75%<br>4 min: 75-80%<br>5 min: 80-85%<br>10 min: 85-95%<br><br><b>Do not target 100%</b> – risk of oxygen toxicity"
    },
    {
      type: "warning",
      content: "<b>STOP Resuscitation – Consider if:</b><br>• No detectable HR after 20 minutes of continuous and adequate resuscitation<br>• Gestational age, birth weight, or congenital anomalies associated with certain death<br><br><b>CONTACT BASE HOSPITAL</b> before discontinuing resuscitation"
    },
    {
      type: "facility-finder",
      title: "Nearest NICU / Pediatric Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "warning",
      content: "<b>Transport Criteria:</b><br>• Gestational age ≤34 weeks → NICU capability REQUIRED<br>• Any resuscitation beyond routine care → Pediatric Medical Center<br>• Suspected congenital anomaly → Tertiary pediatric center<br>• CONTACT BASE for all neonatal resuscitations"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Ventilation is the single most important intervention.</b> Most newborns who need help only need effective PPV.<br><br><b>HR is the primary indicator of success.</b> If HR is rising, resuscitation is working.<br><br><b>Golden minute:</b> Complete initial steps and begin PPV (if needed) within 60 seconds of birth.<br><br><b>Don't delay PPV</b> to suction, dry, or wait for cord clamping. Breathing takes priority.<br><br><b>Hypothermia kills.</b> Maintain normothermia throughout. Target temp 36.5-37.5°C."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1215 Childbirth (Normal Delivery)" },
        { title: "TP-1217 Pregnancy Complication" },
        { title: "TP-1218 Pregnancy/Labor" },
        { title: "Ref. 1309 Color Code Drug Doses" },
        { title: "MCG 1302 Airway Management" }
      ]
    }
  ]
};
