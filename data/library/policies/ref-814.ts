import { Protocol } from '../../../types';

export const ref814: Protocol = {
  id: "814",
  refNo: "Ref. 814",
  title: "Determination of Death",
  category: "Policies",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "church",
  color: "gray",
  sections: [
    {
      type: "header",
      items: [{ title: "Determination of Death", subtitle: "Ref. 814 • Policy", icon: "church" }]
    },
    {
      type: "accordion",
      title: "1. Obvious Death (No CPR)",
      items: [
        { title: "Decomposition", content: "Decomposition of body tissues." },
        { title: "Hypostasis (Lividity)", content: "Pooling of blood in dependent tissues." },
        { title: "Rigor Mortis", content: "Stiffening of muscles." },
        { title: "Traumatic Injuries", content: "Decapitation, Massive Crush Injury, Evisceration of Heart/Brain, Incineration." }
      ]
    },
    {
      type: "accordion",
      title: "2. Termination of Resuscitation (Medical)",
      items: [
        { title: "Criteria", content: "1. Patient is >= 18 years old.<br>2. Arrest not witnessed by EMS.<br>3. No shockable rhythm identified.<br>4. No ROSC after 20 minutes of high-quality CPR and ALS intervention.<br>5. No hypothermia or respiratory etiology." }
      ]
    },
    {
      type: "accordion",
      title: "3. Termination of Resuscitation (Trauma)",
      items: [
        { title: "Blunt Trauma", content: "Apneic, Pulseless, and Asystole on monitor." },
        { title: "Penetrating Trauma", content: "Apneic, Pulseless, and Asystole on monitor (consider transport if short ETA to trauma center)." }
      ]
    }
  ]
};