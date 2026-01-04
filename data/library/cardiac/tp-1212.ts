
import { Protocol } from '../../../types';

export const tp1212: Protocol = {
  id: "1212",
  refNo: "TP-1212",
  title: "Cardiac Dysrhythmia - Bradycardia",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Bradycardia", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Cardiac Dysrhythmia (DYSR)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Atropine", content: "1mg IV/IO q 3-5 min. Max 3mg.", icon: "medication" },
        { title: "Pacing (TCP)", content: "If unstable and atropine fails. Rate 70-80.", icon: "electric_bolt" },
        { title: "Push-dose Epinephrine", content: "10mcg IV/IO q 1-3 min for hypotension.", icon: "medication" }
      ]
    }
  ]
};
