
import { Protocol } from '../../../types';

export const tp1217: Protocol = {
  id: "1217",
  refNo: "TP-1217",
  title: "Pregnancy Complication",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy Complication", subtitle: "Adult • Standing Order", icon: "pregnant_woman" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Pregnancy Complication (PREG)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Conditions",
      items: [
        { title: "Eclampsia", content: "Seizures > 20 weeks. Treat per Seizure Protocol (TP-1231).", icon: "medication" },
        { title: "Vaginal Bleeding", content: "Treat for shock. Left lateral recumbent position." }
      ]
    }
  ]
};