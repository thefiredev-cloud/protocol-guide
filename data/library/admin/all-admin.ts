
import { Protocol } from '../../../types';

export const remainingAdmin: Protocol[] = [
  // Ref. 214 removed (duplicate)
  {
    id: "501", refNo: "Ref. 501", title: "Hospital Directory", category: "Administrative", type: "Policy", lastUpdated: "Jan 1, 2024", icon: "apartment", color: "blue",
    sections: [{ type: "header", items: [{ title: "Hospital Directory", subtitle: "Ref. 501" }] }, { type: "text", content: "Listing of all MARs and Specialty Centers." }]
  },
  // Ref. 503 removed (duplicate)
  {
    id: "519", refNo: "Ref. 519", title: "MCI Management", category: "Administrative", type: "Policy", lastUpdated: "Jul 1, 2023", icon: "groups", color: "slate",
    sections: [{ type: "header", items: [{ title: "MCI", subtitle: "Ref. 519" }] }, { type: "text", content: "START Triage. Incident Command System." }]
  }
];
