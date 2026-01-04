
import { Protocol } from '../../../types';

export const tp1341: Protocol = {
  id: "1237-P",
  refNo: "TP-1237-P",
  title: "Respiratory Distress - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "pulmonology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Respiratory Distress", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "accordion",
      title: "Upper Airway (Stridor/Croup)",
      items: [
        { title: "Mist", content: "Saline mist via nebulizer." },
        { title: "Epinephrine", content: "<b>5mg</b> (5mL of 1:1,000) Nebulized. Indicated for stridor at rest." }
      ]
    },
    {
      type: "accordion",
      title: "Lower Airway (Wheezing/Asthma)",
      items: [
        { title: "Albuterol", content: "2.5mg (3mL) Nebulized." }
      ]
    }
  ]
};
