
import { Protocol } from '../../../types';

export const tp1310: Protocol = {
  id: "1210-P",
  refNo: "TP-1210-P",
  title: "Cardiac Arrest - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Arrest", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "accordion",
      title: "BLS Management",
      items: [
        { title: "CPR", content: "<b>Ratio:</b> 15:2 (2 rescuers) or 30:2 (1 rescuer).<br><b>Rate:</b> 100-120/min.<br><b>Depth:</b> 1/3 AP diameter (1.5 inches infant / 2 inches child)." },
        { title: "Airway/Ventilation", content: "BVM with 100% O2. Do not hyperventilate." },
        { title: "AED/Defib", content: "Apply pads immediately. Shock if indicated." }
      ]
    },
    {
      type: "accordion",
      title: "ALS Management",
      items: [
        { title: "Vascular Access", content: "Establish IV or IO immediately." },
        { title: "Epinephrine", content: "<b>0.01mg/kg</b> (0.1mL/kg of 1:10,000) IV/IO.<br>Repeat every 3-5 min." },
        { title: "Amiodarone", content: "<b>5mg/kg</b> IV/IO (for Refractory VF/pVT). May repeat x2. Max total 15mg/kg." },
        { title: "Defibrillation", content: "Manual: <b>2 J/kg</b> (1st), <b>4 J/kg</b> (2nd+). Max 10 J/kg." }
      ]
    },
    {
      type: "text",
      title: "H's and T's",
      content: "Hypoxia, Hypovolemia, Hydrogen Ion (Acidosis), Hypo/Hyperkalemia, Hypothermia.<br>Toxins, Tamponade, Tension Pneumo, Thrombosis (Coronary/Pulmonary)."
    }
  ]
};