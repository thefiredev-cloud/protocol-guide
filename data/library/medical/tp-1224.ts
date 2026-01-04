
import { Protocol } from '../../../types';

export const tp1224: Protocol = {
  id: "1224",
  refNo: "TP-1224",
  title: "Stings / Venomous Bites",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "pets",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Stings / Bites", subtitle: "Adult • Standing Order", icon: "pets" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Stings / Venomous Bites (STNG)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Snake Bite",
      items: [
        { title: "Immobilize", content: "Keep at heart level. No ice/tourniquet." },
        { title: "Marking", content: "Mark erythema boundary with time." }
      ]
    }
  ]
};
