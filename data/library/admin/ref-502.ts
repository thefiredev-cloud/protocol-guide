import { Protocol } from '../../../types';

export const ref502: Protocol = {
  id: "502",
  refNo: "Ref. 502",
  title: "Patient Destination",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "local_hospital",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Patient Destination", subtitle: "Ref. 502 • Admin", icon: "local_hospital" }]
    },
    {
      type: "text",
      title: "Principle",
      content: "Patients shall be transported to the Most Accessible Receiving (MAR) facility that is appropriate for their medical needs."
    },
    {
      type: "accordion",
      title: "Specialty Centers",
      items: [
        { title: "Trauma", content: "Ref. 506 Criteria -> Trauma Center." },
        { title: "STEMI", content: "Ref. 513 Criteria -> SRC." },
        { title: "Stroke", content: "Ref. 521 Criteria -> PSC/CSC." },
        { title: "Pediatric", content: "Ref. 510 Criteria -> PMC/EDAP." }
      ]
    }
  ]
};