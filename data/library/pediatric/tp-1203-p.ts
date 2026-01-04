import { Protocol } from '../../../types';

export const tp1203p: Protocol = {
  id: "1203-P",
  refNo: "TP-1203-P",
  title: "Diabetic Emergencies - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "water_drop",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Diabetic Emergencies", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hypoglycemia (HYPO)", content: "Blood Glucose < 60 mg/dL" },
        { title: "Hyperglycemia (HYPR)", content: "Blood Glucose > 250 mg/dL" }
      ]
    },
    {
      type: "accordion",
      title: "Hypoglycemia (BG < 60)",
      items: [
        { title: "Oral Glucose", content: "<b>15g</b> PO if patient is awake and able to swallow." },
        { title: "Dextrose 10% (D10)", content: "<b>5 mL/kg</b> IV/IO bolus (Max 250mL).<br>Recheck BG in 5 mins. Repeat x1 if BG remains < 60." },
        { title: "Glucagon", content: "<b>< 10kg:</b> 0.5 mg IM.<br><b>≥ 10kg:</b> 1 mg IM.<br>Use if IV access unavailable." },
        { title: "Neonate (< 1 month)", content: "Hypoglycemia defined as BG < 45 mg/dL. Treat with D10 2mL/kg." }
      ]
    },
    {
      type: "accordion",
      title: "Hyperglycemia (BG > 250)",
      items: [
        { title: "Assessment", content: "Assess for DKA (Kussmaul respirations, fruity odor, dehydration, ALOC)." },
        { title: "Fluid Resuscitation", content: "<b>Normal Saline:</b> 20 mL/kg IV/IO bolus (Max 1L).<br>Indicated for signs of poor perfusion/dehydration." }
      ]
    }
  ]
};