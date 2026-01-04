import { Protocol } from '../../../types';

export const tp1311: Protocol = {
  id: "1213-P",
  refNo: "TP-1213-P",
  title: "Cardiac Dysrhythmia - Tachycardia - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "timeline",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Tachycardia (Peds)", subtitle: "Pediatric • Standing Order" }]
    },
    {
      type: "accordion",
      title: "SVT Treatment",
      items: [
        { title: "Adenosine", content: "<b>0.1mg/kg</b> IV rapid push (Max 6mg).<br>Second dose <b>0.2mg/kg</b> (Max 12mg).", icon: "medication" },
        { title: "Cardioversion", content: "Synchronized Cardioversion <b>0.5-1 J/kg</b>.", icon: "electric_bolt" }
      ]
    }
  ]
};