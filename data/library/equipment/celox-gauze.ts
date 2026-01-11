import type { Protocol } from '../../../types';

export const celoxGauze: Protocol = {
  id: "EQUIP-CELOX",
  refNo: "Ref. 1322",
  title: "Celox Rapid Gauze",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Jan 2017",
  tags: ["celox", "hemostatic", "gauze", "wound packing", "hemorrhage", "bleeding", "junctional hemorrhage"],
  icon: "medical_services",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Celox Rapid Gauze", subtitle: "Hemostatic Agent" }]
    },
    {
      type: "warning",
      content: "For severe hemorrhage not controlled by direct pressure alone. Wound packing technique required for effectiveness."
    },
    {
      type: "meta",
      data: {
        "Scope": "ALS/BLS",
        "Mechanism": "Chitosan-based hemostatic agent"
      }
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Junctional hemorrhage", content: "Bleeding from groin, axilla, or neck where tourniquet cannot be applied" },
        { title: "Deep penetrating wounds", content: "Stab wounds, GSW with active bleeding into wound cavity" },
        { title: "Tourniquet failure", content: "When tourniquet cannot be applied or is ineffective" },
        { title: "Complex wounds", content: "Wounds with multiple bleeding points" }
      ]
    },
    {
      type: "step-by-step",
      title: "Application",
      steps: [
        { stepNumber: 1, title: "Identify bleeding source", description: "Locate the source of hemorrhage within the wound" },
        { stepNumber: 2, title: "Pack wound", description: "Pack gauze firmly and directly into the wound cavity, packing tightly to the bleeding source" },
        { stepNumber: 3, title: "Apply pressure", description: "Hold firm direct pressure for minimum 3 minutes - do not release to check" },
        { stepNumber: 4, title: "Bandage", description: "Apply pressure dressing over packed wound without disturbing the packing" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Packing Technique",
      content: "Pack the gauze TIGHTLY into the wound. The gauze must contact the bleeding vessel. Loose packing is ineffective. Use entire package if needed."
    },
    {
      type: "warning",
      content: "Do not remove packing in the field. If bleeding continues through packing, add more gauze on top and continue pressure."
    }
  ]
};
