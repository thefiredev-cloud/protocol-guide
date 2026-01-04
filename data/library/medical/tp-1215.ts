
import { Protocol } from '../../../types';

export const tp1215: Protocol = {
  id: "1215",
  refNo: "TP-1215",
  title: "Childbirth (Mother)",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "child_friendly",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Childbirth (Mother)", subtitle: "Adult • Standing Order", icon: "child_friendly" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Childbirth (Mother) (BRTH)", content: "Active labor, imminent delivery, or post-partum care." }
      ]
    },
    {
      type: "accordion",
      title: "Imminent Delivery",
      items: [
        { title: "Preparation", content: "Prepare OB kit. Place mother in semi-fowlers. Support perineum." },
        { title: "Delivery", content: "Guide infant's head. Check for nuchal cord (slip over head if loose; clamp/cut if tight). Suction mouth then nose if obstructed." },
        { title: "Post-Delivery", content: "Dry and warm infant. Place skin-to-skin. Clamp/cut cord after 1 minute (or when pulsation ceases)." }
      ]
    },
    {
      type: "accordion",
      title: "Post-Partum Care",
      items: [
        { title: "Fundal Massage", content: "Massage fundus (uterus) firmly if boggy to promote contraction." },
        { title: "Hemorrhage (> 500mL)", content: "• Continuous Fundal Massage.<br>• Encourage breastfeeding.<br>• <b>Normal Saline:</b> 1L IV/IO rapid bolus.<br>• <b>TXA:</b> 1g IV over 10 min if signs of shock." }
      ]
    },
    {
      type: "info",
      title: "APGAR Score",
      content: "Assess at 1 min and 5 min.<br><b>A</b>ppearance (Color)<br><b>P</b>ulse (>100)<br><b>G</b>rimace (Reflex)<br><b>A</b>ctivity (Tone)<br><b>R</b>espiration (Cry)"
    }
  ]
};