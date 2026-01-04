
import { Protocol } from '../../../types';

export const tp1302: Protocol = {
  id: "1302-P", // Changed from 1302 to avoid collision with Ref. 1302
  refNo: "TP-1302",
  title: "General Assessment (Peds)",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "assignment_ind",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Peds Assessment", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "text",
      title: "Pediatric Assessment Triangle (PAT)",
      content: "<b>Appearance:</b> Tone, Interactiveness, Consolability, Look/Gaze, Speech/Cry (TICLS).<br><b>Work of Breathing:</b> Retractions, Flaring, Grunting.<br><b>Circulation:</b> Pallor, Mottling, Cyanosis."
    },
    {
      type: "accordion",
      title: "Vitals & Weight",
      items: [
        { title: "Length Based Tape", content: "Use Broselow Tape or equivalent for weight/medication estimation." },
        { title: "Hypotension", content: "Neonate (<1m): <60 SBP<br>Infant (1m-1y): <70 SBP<br>Child (1y-10y): < 70 + (2 x Age) SBP<br> >10y: <90 SBP" }
      ]
    }
  ]
};
