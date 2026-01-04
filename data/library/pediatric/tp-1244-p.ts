
import { Protocol } from '../../../types';

export const tp1244p: Protocol = {
  id: "1244-P",
  refNo: "TP-1244-P",
  title: "Traumatic Injury - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Trauma (Peds)", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Injury (TRMA)", content: "" }
      ]
    },
    {
      type: "text",
      title: "Assessment (PAT)",
      content: "Assess <b>Appearance</b> (Tone, Interactiveness, Gaze), <b>Work of Breathing</b>, and <b>Circulation</b> (Pallor, Cyanosis, Mottling)."
    },
    {
      type: "accordion",
      title: "Management",
      items: [
        { title: "Spinal Motion Restriction", content: "Apply SMR if indicated by mechanism or deficits." },
        { title: "Hemorrhage Control", content: "Direct pressure. Tourniquet for life-threatening extremity bleed." },
        { title: "Fluid Resuscitation", content: "If signs of shock (poor perfusion, hypotension):<br><b>Normal Saline 20mL/kg</b> IV/IO rapid bolus. May repeat x2 prn.", icon: "water_drop" },
        { title: "Pain Management", content: "Fentanyl 1mcg/kg IV/IM/IN (Max 50mcg) per TP-1322.", icon: "healing" }
      ]
    },
    {
      type: "accordion",
      title: "Head Injury",
      items: [
        { title: "Airway", content: "Prevent hypoxia. Maintain SpO2 > 94%." },
        { title: "Positioning", content: "Elevate head 30 degrees if SBP is adequate." },
        { title: "Monitoring", content: "Monitor GCS and Pupils. Avoid hyperventilation unless signs of herniation." }
      ]
    }
  ]
};
