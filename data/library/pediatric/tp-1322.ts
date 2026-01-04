
import { Protocol } from '../../../types';

export const tp1322: Protocol = {
  id: "1322",
  refNo: "TP-1322",
  title: "Pain Management (Peds)",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "healing",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pain Management (Peds)", subtitle: "Pediatric • Standing Order" }]
    },
    {
      type: "accordion",
      title: "Medications",
      items: [
        { title: "Fentanyl", content: "<b>1mcg/kg</b> IV/IM. Max 50mcg/dose.", icon: "medication" },
        { title: "Morphine", content: "<b>0.1mg/kg</b> IV/IM. Max 4mg/dose.", icon: "medication" }
      ]
    }
  ]
};
