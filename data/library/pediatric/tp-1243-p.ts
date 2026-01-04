
import { Protocol } from '../../../types';

export const tp1243p: Protocol = {
  id: "1243-P",
  refNo: "TP-1243-P",
  title: "Traumatic Arrest - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "personal_injury",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Arrest", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Arrest (CABT)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Interventions",
      items: [
        { title: "CPR", content: "High quality CPR (15:2 ratio)." },
        { title: "Airway", content: "Establish advanced airway. Oxygen 100%." },
        { title: "Hemorrhage", content: "Control external bleeding. Pelvic binder if indicated." },
        { title: "Needle Thoracostomy", content: "Bilateral chest decompression for suspected tension pneumothorax.", icon: "medical_services" },
        { title: "Fluids", content: "<b>Normal Saline 20mL/kg</b> IV/IO rapid bolus.", icon: "water_drop" },
        { title: "Epinephrine", content: "<b>0.01mg/kg</b> (1:10,000) IV/IO q 3-5 min.", icon: "medication" }
      ]
    }
  ]
};
