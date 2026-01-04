import { Protocol } from '../../../types';

export const tp1271: Protocol = {
  id: "1271",
  refNo: "TP-1271",
  title: "Childbirth / Labor",
  category: "General",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "child_friendly",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Childbirth", subtitle: "Adult • Standing Order", icon: "child_friendly" }]
    },
    {
      type: "text",
      title: "Imminent Delivery",
      content: "Signs: Crowning, Bulging Perineum, Urge to Push. Prepare OB Kit."
    },
    {
      type: "accordion",
      title: "Complications",
      items: [
        { title: "Prolapsed Cord", content: "Elevate hips. Insert gloved hand to relieve pressure on cord. <b>Do not</b> push cord back." },
        { title: "Breech", content: "Allow delivery to hips. Support body. If head stuck, create airway with V-fingers." },
        { title: "Post-Partum Hemorrhage", content: "Fundal massage. Encourage breastfeeding. <b>Normal Saline</b> 1L IV rapid bolus." }
      ]
    }
  ]
};