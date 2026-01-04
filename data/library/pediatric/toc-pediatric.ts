import { Protocol } from '../../../types';

export const tocPediatric: Protocol[] = [
  // --- 1200-P Series (Standing Orders) ---
  { 
    id: "1202-P", refNo: "TP-1202-P", title: "General Medical (Peds)", category: "Pediatric", type: "Standing Order", lastUpdated: "2025", icon: "child_care", color: "purple", 
    sections: [
      { type: "header", items: [{ title: "General Medical (Peds)", subtitle: "Standing Order" }] },
      { type: "text", content: "Assess PAT (Appearance, Work of Breathing, Circulation). Manage ABCs." }
    ]
  },
  { id: "1205-P", refNo: "TP-1205-P", title: "GI / GU (Peds)", category: "Pediatric", type: "Standing Order", lastUpdated: "2025", icon: "water_drop", color: "purple", sections: [] },
  { id: "1208-P", refNo: "TP-1208-P", title: "Agitated Delirium (Peds)", category: "Pediatric", type: "Standing Order", lastUpdated: "2025", icon: "psychology", color: "purple", sections: [] },
  { id: "1223-P", refNo: "TP-1223-P", title: "Hypothermia (Peds)", category: "Pediatric", type: "Standing Order", lastUpdated: "2025", icon: "ac_unit", color: "purple", sections: [] },
  
  // --- 1300 Series: Medical Control Guidelines (MCG) ---
  { 
    id: "1301", refNo: "Ref. 1301", title: "Medical Control Guidelines Intro", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "admin_panel_settings", color: "gray", 
    sections: [
      { type: "header", items: [{ title: "MCG Intro", subtitle: "Ref. 1301" }] },
      { type: "text", content: "Medical Control Guidelines (MCGs) provide further management options when Standing Orders are exhausted. Requires Base Contact." }
    ] 
  },
  { 
    id: "1302", refNo: "TP-1302", title: "General Assessment (Peds)", category: "Pediatric", type: "Standing Order", lastUpdated: "2024", icon: "assignment_ind", color: "purple", 
    sections: [
      { type: "header", items: [{ title: "General Assessment", subtitle: "TP-1302" }] },
      { type: "text", title: "PAT", content: "Pediatric Assessment Triangle: Appearance, Work of Breathing, Circulation." }
    ] 
  }
];