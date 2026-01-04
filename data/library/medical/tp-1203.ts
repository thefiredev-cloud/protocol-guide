
import { Protocol } from '../../../types';

export const tp1203: Protocol = {
  id: "1203",
  refNo: "TP-1203",
  title: "Diabetic Emergencies",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "water_drop",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Diabetic Emergencies", subtitle: "Adult • Standing Order", icon: "water_drop" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hypoglycemia (HYPO)", content: "Blood Glucose < 60 mg/dL with symptoms." },
        { title: "Hyperglycemia (HYPR)", content: "Blood Glucose > 250 mg/dL with signs of dehydration/DKA." }
      ]
    },
    {
      type: "accordion",
      title: "Hypoglycemia (BG < 60 mg/dL)",
      items: [
        { title: "1. Assessment", content: "Obtain Blood Glucose via finger stick. Assess mental status and ability to swallow." },
        { title: "2. Oral Glucose", content: "<b>15-30g PO</b> (Paste/Tabs) if patient is awake, alert, and able to swallow safely." },
        { title: "3. Dextrose 10% (D10)", content: "<b>125mL (12.5g)</b> IV/IO bolus. Recheck BG after 5 minutes.<br>• If BG remains < 60 mg/dL and symptoms persist, repeat <b>125mL (12.5g)</b> x1." },
        { title: "4. Glucagon", content: "<b>1mg</b> IM if unable to establish IV/IO access." }
      ]
    },
    {
      type: "accordion",
      title: "Hyperglycemia (BG > 250 mg/dL)",
      items: [
        { title: "Assessment", content: "Assess for signs of Diabetic Ketoacidosis (DKA): Kussmaul respirations, fruity breath odor, tachycardia, hypotension, signs of severe dehydration." },
        { title: "Fluid Resuscitation", content: "<b>Normal Saline:</b> 1L IV/IO rapid bolus indicated for signs of dehydration or poor perfusion. Reassess lung sounds and vitals." }
      ]
    }
  ]
};