
import { Protocol } from '../../../types';

export const tp1216: Protocol = {
  id: "1216",
  refNo: "TP-1216",
  title: "Newborn / Neonatal Resuscitation",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jan 2026",
  icon: "child_care",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Newborn Resuscitation", subtitle: "Peds • Standing Order", icon: "child_care" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Newborn (BABY)", content: "Use for all newborn deliveries requiring resuscitation." }
      ]
    },
    {
      type: "accordion",
      title: "Initial Assessment (First 60 seconds)",
      items: [
        {
          title: "Rapid Evaluation",
          content: "<b>Ask:</b><br>• Term gestation?<br>• Good muscle tone?<br>• Breathing or crying?<br><br>If <b>YES to all</b>: Routine care (skin-to-skin, dry, warm)",
          icon: "checklist"
        },
        {
          title: "Initial Steps (All Newborns)",
          content: "<b>W</b>arm - prevent heat loss (radiant warmer or skin-to-skin)<br><b>D</b>ry - thoroughly with warm towels<br><b>S</b>timulate - rub back, flick soles of feet<br><b>P</b>osition - sniffing position, neutral neck<br><b>C</b>lear - suction mouth then nose if needed<br><b>R</b>eplace - wet towels with dry",
          icon: "thermostat"
        }
      ]
    },
    {
      type: "accordion",
      title: "Resuscitation Algorithm",
      items: [
        {
          title: "Apnea/Gasping or HR < 100",
          content: "<b>Begin PPV (Positive Pressure Ventilation):</b><br>• Use BVM with <b>room air</b> initially<br>• Rate: <b>40-60 breaths/minute</b> (squeeze-release-release)<br>• Provide gentle puffs - just enough for chest rise<br>• Reassess HR after 30 seconds",
          icon: "air"
        },
        {
          title: "HR < 100 Despite PPV",
          content: "<b>MR. SOPA Corrective Steps:</b><br>• <b>M</b>ask adjustment - ensure seal<br>• <b>R</b>eposition airway - neutral sniffing position<br>• <b>S</b>uction - clear secretions<br>• <b>O</b>pen mouth - jaw thrust<br>• <b>P</b>ressure increase - adequate chest rise<br>• <b>A</b>irway alternative - consider LMA/ETT",
          icon: "settings"
        },
        {
          title: "HR < 60 Despite Effective PPV",
          content: "<b>Start Chest Compressions:</b><br>• <b>3:1 ratio</b> (3 compressions : 1 ventilation)<br>• 120 events/minute (90 compressions + 30 breaths)<br>• <b>Two-thumb encircling technique</b> preferred<br>• Depth: 1/3 AP diameter of chest<br>• Continue PPV with <b>100% O2</b>",
          icon: "favorite"
        },
        {
          title: "HR < 60 Despite CPR + PPV",
          content: "<b>Epinephrine:</b><br>• <b>0.01-0.03 mg/kg</b> (1:10,000)<br>• <b>0.1-0.3 mL/kg</b> IV/IO<br>• May give ET at higher dose (0.05-0.1 mg/kg) while establishing access<br>• Repeat q 3-5 min if needed",
          icon: "medication"
        }
      ]
    },
    {
      type: "info",
      title: "APGAR Score",
      content: "Assess at 1 minute and 5 minutes:<br><br><b>A</b>ppearance (skin color): Blue/pale=0, Acrocyanosis=1, Pink=2<br><b>P</b>ulse: Absent=0, <100=1, >100=2<br><b>G</b>rimace (reflex irritability): None=0, Grimace=1, Cry=2<br><b>A</b>ctivity (muscle tone): Limp=0, Some flexion=1, Active=2<br><b>R</b>espiration: Absent=0, Weak/irregular=1, Strong cry=2"
    },
    {
      type: "facility-finder",
      title: "Nearest Pediatric/NICU Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "warning",
      content: "<b>Transport Criteria:</b><br>• Gestational age ≤34 weeks → NICU capability required<br>• Any resuscitation beyond routine care → Pediatric Medical Center<br>• CONTACT BASE for all neonatal resuscitations"
    }
  ]
};
