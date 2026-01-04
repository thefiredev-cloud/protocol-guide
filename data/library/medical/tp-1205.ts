
import { Protocol } from '../../../types';

export const tp1205: Protocol = {
  id: "1205",
  refNo: "TP-1205",
  title: "GI / GU Emergencies",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "water_drop",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "GI / GU Emergencies", subtitle: "Adult • Standing Order" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Abdominal Pain/Problems (ABOP)", content: "General abdominal pain, masses, distension." },
        { title: "Nausea / Vomiting (NAVM)", content: "Intractable vomiting." },
        { title: "GI Bleeding (UPGI / LOGI)", content: "Hematemesis, Coffee-ground emesis, Melena, Hematochezia." },
        { title: "Genitourinary (GUDO)", content: "Flank pain, urinary retention, renal colic." },
        { title: "Vaginal Bleeding (VABL)", content: "Non-traumatic vaginal bleeding." }
      ]
    },
    {
      type: "accordion",
      title: "Management",
      items: [
        { title: "Assessment", content: "• 12-Lead ECG for epigastric pain (rule out cardiac).<br>• Palpate for tenderness, rigidity, masses.<br>• Orthostatic vitals if history of bleeding/volume loss." },
        { title: "Nausea/Vomiting", content: "<b>Ondansetron (Zofran):</b> 4mg IV/IM/ODT. May repeat x1 in 15 mins (Max 8mg)." },
        { title: "Pain Management", content: "Treat moderate/severe pain per TP-1222.<br><b>Fentanyl:</b> 50mcg IV/IM/IN." },
        { title: "Fluid Resuscitation", content: "<b>Normal Saline:</b> 1L IV/IO if signs of dehydration (tachycardia, dry mucous membranes) or hypotension." }
      ]
    }
  ]
};