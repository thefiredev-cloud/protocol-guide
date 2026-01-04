
import { Protocol } from '../../../types';

export const tp1370: Protocol = {
  id: "1370",
  refNo: "TP-1370",
  title: "HazMat MCG - Pediatrics",
  category: "Toxicology",
  type: "Medical Control",
  lastUpdated: "2025",
  icon: "warning",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "HazMat MCG", subtitle: "Pediatric • Base Contact", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "Ensure Scene Safety. Decontaminate prior to transport if possible. <b>Base Hospital Contact Required.</b>"
    },
    {
      type: "accordion",
      title: "Organophosphate / Nerve Agent",
      items: [
        { title: "Atropine", content: "<b>0.05 mg/kg</b> IV/IM. Repeat q 3-5 min until secretions dry. (Higher than standard bradycardia dose).", icon: "medication" },
        { title: "Pralidoxime (2-PAM)", content: "<b>25-50 mg/kg</b> IV/IO over 15-30 min.", icon: "science" },
        { title: "Midazolam", content: "<b>0.1 mg/kg</b> IV/IO or <b>0.2 mg/kg</b> IM/IN for seizures.", icon: "psychology" }
      ]
    },
    {
      type: "accordion",
      title: "Cyanide",
      items: [
        { title: "Hydroxocobalamin", content: "<b>70 mg/kg</b> IV over 15 min (Max 5g).", icon: "medication" }
      ]
    }
  ]
};
