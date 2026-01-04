import { Protocol } from '../../../types';

export const tp1309: Protocol = {
  id: "1212-P",
  refNo: "TP-1212-P",
  title: "Cardiac Dysrhythmia – Bradycardia - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Bradycardia (Peds)", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "Bradycardia in children is usually respiratory. Support Airway/Breathing first."
    },
    {
      type: "text",
      title: "CPR Indication",
      content: "Perform CPR if HR < 60 bpm with signs of poor perfusion despite oxygenation and ventilation."
    },
    {
      type: "accordion",
      title: "Medications",
      items: [
        { title: "Epinephrine", content: "<b>0.01mg/kg</b> (1:10,000) IV/IO. Repeat q 3-5 min." },
        { title: "Atropine", content: "<b>0.02mg/kg</b> IV/IO. Min 0.1mg. Max 0.5mg (child) / 1mg (adolescent). Use for increased vagal tone or primary AV block." }
      ]
    }
  ]
};