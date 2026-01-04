
import { Protocol } from '../../../types';

export const tp1216: Protocol = {
  id: "1216",
  refNo: "TP-1216",
  title: "Newborn / Neonatal Resuscitation",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
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
        { title: "Newborn (BABY)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Algorithm",
      items: [
        { title: "Warm, Dry, Stimulate", content: "First 30 seconds." },
        { title: "Apnea/Gasping or HR < 100", content: "PPV (BVM) with room air." },
        { title: "HR < 60", content: "Compressions 3:1 ratio with ventilations." },
        { title: "Epinephrine", content: "If HR < 60 persists: 0.01mg/kg (1:10,000) IV/IO." }
      ]
    }
  ]
};
