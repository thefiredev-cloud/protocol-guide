
import { Protocol } from '../../../types';

export const tp1234p: Protocol = {
  id: "1234-P",
  refNo: "TP-1234-P",
  title: "Airway Obstruction - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "no_sim",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Airway Obstruction", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "accordion",
      title: "Conscious Patient",
      items: [
        { title: "Infant (< 1 year)", content: "5 Back Blows followed by 5 Chest Thrusts. Repeat until effective or unconscious." },
        { title: "Child (>= 1 year)", content: "Abdominal Thrusts (Heimlich Maneuver) until effective or unconscious." }
      ]
    },
    {
      type: "accordion",
      title: "Unconscious Patient",
      items: [
        { title: "CPR", content: "Begin CPR. Look for object in mouth each time you open airway. Remove only if visualized. No blind finger sweeps." },
        { title: "Laryngoscopy", content: "Direct Laryngoscopy with Magill Forceps if obstruction visualized." },
        { title: "Intubation", content: "Attempt intubation. If unable to ventilate, continue BVM ventilation with airway adjuncts and consider supraglottic airway (iGel/King)." }
      ]
    }
  ]
};
