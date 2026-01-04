
import { Protocol } from '../../../types';

export const remainingPolicies: Protocol[] = [
  {
    id: "802", refNo: "Ref. 802", title: "Disaster Operations", category: "Policies", type: "Policy", lastUpdated: "Jul 1, 2023", icon: "warning", color: "slate",
    sections: [{ type: "header", items: [{ title: "Disaster Ops", subtitle: "Ref. 802" }] }, { type: "text", content: "Guidelines for State of Emergency." }]
  },
  {
    id: "816", refNo: "Ref. 816", title: "Physician at Scene", category: "Policies", type: "Policy", lastUpdated: "Jul 1, 2023", icon: "stethoscope", color: "slate",
    sections: [{ type: "header", items: [{ title: "Physician Scene", subtitle: "Ref. 816" }] }, { type: "text", content: "Must show ID. If taking charge, must accompany patient." }]
  },
  {
    id: "822", refNo: "Ref. 822", title: "Child Abuse Reporting", category: "Policies", type: "Policy", lastUpdated: "Jul 1, 2023", icon: "shield", color: "slate",
    sections: [{ type: "header", items: [{ title: "Child Abuse", subtitle: "Ref. 822" }] }, { type: "text", content: "Mandated Reporter. Verbal report ASAP. Written 36h." }]
  },
  // Ref. 834 removed (duplicate)
];
