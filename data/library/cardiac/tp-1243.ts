
import { Protocol } from '../../../types';

export const tp1243: Protocol = {
  id: "1243",
  refNo: "TP-1243",
  title: "Traumatic Arrest",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Arrest", subtitle: "Adult • Standing Order", icon: "personal_injury" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Arrest (CABT/CAPT)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Interventions",
      items: [
        { title: "Needle Thoracostomy", content: "Bilateral chest decompression." },
        { title: "Hemorrhage Control", content: "Tourniquets, packing." }
      ]
    }
  ]
};
