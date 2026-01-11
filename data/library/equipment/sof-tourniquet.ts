import type { Protocol } from '../../../types';

export const sofTourniquet: Protocol = {
  id: "EQUIP-SOF-TQ",
  refNo: "Ref. 1320",
  title: "SOF Tactical Tourniquet",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Feb 2015",
  tags: ["tourniquet", "hemorrhage", "bleeding", "equipment", "trauma", "extremity", "hemorrhage control", "tactical"],
  icon: "medical_services",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "SOF Tourniquet", subtitle: "Equipment Guide" }]
    },
    {
      type: "warning",
      content: "Standard equipment for hemorrhage control on extremity wounds with life-threatening bleeding. Apply high and tight - do not remove once applied."
    },
    {
      type: "meta",
      data: {
        "Scope": "ALS/BLS",
        "Location": "All apparatus"
      }
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Life-threatening extremity hemorrhage", content: "Uncontrolled bleeding from arm or leg not responding to direct pressure" },
        { title: "Amputation", content: "Traumatic or surgical amputation with active bleeding" },
        { title: "Multiple casualties", content: "MCI situations requiring rapid hemorrhage control" },
        { title: "Tactical situations", content: "When direct pressure is not feasible due to scene conditions" }
      ]
    },
    {
      type: "step-by-step",
      title: "Application",
      steps: [
        { stepNumber: 1, title: "Position", description: "Place 2-3 inches above wound, never directly over a joint. If in doubt, go HIGH and TIGHT." },
        { stepNumber: 2, title: "Route Strap", description: "Pull the self-adhering band through the buckle and pull tight" },
        { stepNumber: 3, title: "Windlass", description: "Twist windlass rod until bleeding stops and distal pulse is absent" },
        { stepNumber: 4, title: "Secure", description: "Lock windlass in the windlass clip, secure with the windlass strap" },
        { stepNumber: 5, title: "Document", description: "Mark 'TQ' and time of application on patient's forehead or on tape near tourniquet" }
      ]
    },
    {
      type: "warning",
      content: "Once applied, DO NOT loosen or remove tourniquet in the field. Pain is expected - reassure patient but do not release."
    },
    {
      type: "clinical-pearl",
      title: "Second Tourniquet",
      content: "If bleeding continues after first tourniquet properly applied, apply second tourniquet proximal (above) to first tourniquet."
    }
  ]
};
