import { Protocol } from '../../../types';

export const tp1337: Protocol = {
  id: "1231-P",
  refNo: "TP-1231-P",
  title: "Seizure - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "neurology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Seizure (Peds)", subtitle: "Pediatric • Standing Order" }]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Midazolam", content: "<b>0.2mg/kg</b> IM/IN (Max 5mg) OR <b>0.1mg/kg</b> IV (Max 2.5mg).", icon: "medication" }
      ]
    }
  ]
};