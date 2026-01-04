import { Protocol } from '../../../types';

export const tp1226: Protocol = {
  id: "1226",
  refNo: "TP-1226",
  title: "Hyperkalemia",
  category: "General",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "ecg_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Hyperkalemia", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "text",
      title: "Suspected History",
      content: "Renal Failure (Dialysis patient), Missed Dialysis, Crush Injury."
    },
    {
      type: "text",
      title: "ECG Signs",
      content: "Peaked T-waves (early), Flattened P-waves, Prolonged PR, Wide QRS (late/critical), Sine Wave."
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Calcium Chloride", content: "<b>1g</b> IV/IO slow push over 2 mins. Stabilizes cardiac membrane.", icon: "medication" },
        { title: "Sodium Bicarbonate", content: "<b>50mEq</b> IV/IO push. Shifts K+ into cells.", icon: "medication" },
        { title: "Albuterol", content: "<b>10-20mg</b> Continuous Nebulizer. Shifts K+ into cells.", icon: "pulmonology" }
      ]
    }
  ]
};