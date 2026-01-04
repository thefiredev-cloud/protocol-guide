
import { Protocol } from '../../../types';

export const tp1202: Protocol = {
  id: "1202",
  refNo: "TP-1202",
  title: "General Medical",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "assignment",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "General Medical", subtitle: "Adult • Standing Order", icon: "assignment" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Body Pain Non-traumatic (BPNT)", content: "" },
        { title: "Chest Pain – Not Cardiac (CPNC)", content: "" },
        { title: "Cold / Flu Symptoms (COFL)", content: "" },
        { title: "Extremity Pain/Swelling-Non-traumatic (EXNT)", content: "" },
        { title: "Headache – Non-traumatic (HPNT)", content: "" },
        { title: "Hypertension (HYTN)", content: "" },
        { title: "Palpitations (PALP)", content: "" },
        { title: "Weakness – General (WEAK)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Assessment",
      items: [
        { title: "Airway", content: "Ensure patent airway." },
        { title: "Breathing", content: "Assess rate, depth, effort. O2 to maintain SpO2 >= 94%." },
        { title: "Circulation", content: "Assess pulse, skin signs, cap refill." },
        { title: "Disability", content: "GCS, Pupils, Mental Status." }
      ]
    },
    {
      type: "accordion",
      title: "Standard Interventions",
      items: [
        { title: "Vascular Access", content: "Establish IV/IO if indicated for fluids/meds." },
        { title: "Monitoring", content: "ECG, NIBP, SpO2, EtCO2." }
      ]
    }
  ]
};
