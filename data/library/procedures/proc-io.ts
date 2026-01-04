import { Protocol } from '../../../types';

export const procIO: Protocol = {
  id: "PROC-IO",
  refNo: "IO Access",
  title: "Intraosseous Access",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2024",
  icon: "vaccines",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Intraosseous Access", subtitle: "Procedure", icon: "vaccines" }]
    },
    {
      type: "text",
      title: "Indications",
      content: "Shock, Cardiac Arrest, or urgent need for fluids/meds when IV access fails."
    },
    {
      type: "accordion",
      title: "Sites",
      items: [
        { title: "Proximal Tibia", content: "2cm below patella, medial flat surface." },
        { title: "Proximal Humerus", content: "Greater tubercle (preferred for adults)." }
      ]
    }
  ]
};