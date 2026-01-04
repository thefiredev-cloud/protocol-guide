
import { Protocol } from '../../../types';

export const tp1239: Protocol = {
  id: "1239",
  refNo: "TP-1239",
  title: "Dystonic Reaction",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "face",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Dystonic Reaction", subtitle: "Adult • Standing Order", icon: "face" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Dystonic Reaction (DYRX)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Diphenhydramine", content: "50mg IV/IM.", icon: "pill" }
      ]
    }
  ]
};
