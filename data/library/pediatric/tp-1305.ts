import { Protocol } from '../../../types';

export const tp1305: Protocol = {
  id: "1219-P",
  refNo: "TP-1219-P",
  title: "Allergy - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "coronavirus",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Allergy (Peds)", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Epinephrine (First Line)", content: "<b>0.01mg/kg</b> (1:1,000) IM in lateral thigh. Max 0.5mg.<br>Repeat q 20 min x2 prn." },
        { title: "Albuterol", content: "5mg (6mL) Nebulized for wheezing." },
        { title: "Fluids", content: "<b>Normal Saline:</b> 20mL/kg IV/IO if hypotensive." },
        { title: "Diphenhydramine", content: "<b>1mg/kg</b> IV/IM. Max 50mg." }
      ]
    }
  ]
};