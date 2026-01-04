
import { Protocol } from '../../../types';

export const tp1244: Protocol = {
  id: "1244",
  refNo: "TP-1244",
  title: "Traumatic Injury",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Injury", subtitle: "Adult • Standing Order", icon: "personal_injury" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Injury (TRMA)", content: "Blunt or Penetrating trauma." }
      ]
    },
    {
      type: "accordion",
      title: "MARCH Algorithm",
      items: [
        { title: "M - Massive Hemorrhage", content: "Stop life-threatening bleeding.<br>• <b>Tourniquet:</b> High and tight for extremity hemorrhage.<br>• <b>Hemostatic Gauze/Pressure:</b> For junctional/truncal wounds." },
        { title: "A - Airway", content: "Establish patent airway. C-Spine precautions." },
        { title: "R - Respiration", content: "Seal open chest wounds (Chest Seal). Decompress Tension Pneumothorax." },
        { title: "C - Circulation", content: "Assess perfusion. Establish IV/IO." },
        { title: "H - Hypothermia", content: "Keep patient warm to prevent coagulopathy." }
      ]
    },
    {
      type: "accordion",
      title: "Fluid Resuscitation",
      items: [
        { title: "Indications", content: "Hypotension (SBP < 90) or signs of shock." },
        { title: "Normal Saline", content: "<b>1L</b> IV/IO bolus. Titrate to presence of radial pulse (Permissive Hypotension) for penetrating torso trauma." },
        { title: "TXA", content: "<b>1g</b> in 100mL NS IV PB over 10 min if signs of hemorrhagic shock and < 3 hours from injury." }
      ]
    }
  ]
};