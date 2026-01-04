import { Protocol } from '../../../types';

export const tp1303: Protocol = {
  id: "1207-P",
  refNo: "TP-1207-P",
  title: "Shock / Hypotension - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "low_density_kpi",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Shock (Peds)", subtitle: "Pediatric • Standing Order" }]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Fluids", content: "<b>Normal Saline:</b> 20mL/kg IV/IO rapid bolus. Repeat x2 prn (Max 60mL/kg).", icon: "water_drop" },
        { title: "Push-dose Epi", content: "For refractory shock (after 60mL/kg fluids): Contact Base.", icon: "call" }
      ]
    }
  ]
};