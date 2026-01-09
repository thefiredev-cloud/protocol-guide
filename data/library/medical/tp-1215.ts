
import { Protocol } from '../../../types';

export const tp1215: Protocol = {
  id: "1215",
  refNo: "TP-1215",
  title: "Childbirth (Mother)",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jan 2026",
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
      title: "Shoulder Dystocia",
      items: [
        {
          title: "Recognition",
          content: "Head delivers but retracts against perineum ('<b>turtle sign</b>'). Anterior shoulder trapped behind pubic symphysis. <b>Time is critical</b> - 4-5 min until hypoxic injury.",
          icon: "warning"
        },
        {
          title: "McRoberts Maneuver",
          content: "<b>Positioning Steps:</b><br>1. Flatten the bed completely<br>2. Remove pillows from under mother<br>3. <b>Hyperflex mother's hips</b> - bring knees up toward chest/shoulders<br>4. Thighs should be pressed tightly against abdomen<br>5. Legs abducted (spread apart)<br><br><b>Suprapubic Pressure:</b><br>Apply firm <b>downward</b> pressure just above pubic bone to dislodge anterior shoulder. Use heel of hand. <b>DO NOT use fundal pressure.</b>",
          icon: "pregnant_woman"
        },
        {
          title: "Additional Maneuvers",
          content: "If McRoberts fails:<br>• <b>Rubin maneuver</b> - rotate anterior shoulder posteriorly<br>• <b>Delivery of posterior arm</b><br>• <b>Gaskin (all-fours) position</b><br><br>Call for additional resources. CONTACT BASE for all shoulder dystocia.",
          icon: "emergency"
        }
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
      type: "facility-finder",
      title: "Nearest Perinatal/Pediatric Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "info",
      title: "APGAR Score",
      content: "Assess at 1 min and 5 min.<br><b>A</b>ppearance (Color): Blue/pale=0, Acrocyanosis=1, Pink=2<br><b>P</b>ulse: Absent=0, <100=1, >100=2<br><b>G</b>rimace (Reflex): None=0, Grimace=1, Cry=2<br><b>A</b>ctivity (Tone): Limp=0, Some flexion=1, Active=2<br><b>R</b>espiration: Absent=0, Weak/irregular=1, Strong cry=2"
    }
  ]
};
