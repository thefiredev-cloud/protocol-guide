import type { Protocol } from '../../../types';

export const slishmanSplint: Protocol = {
  id: "EQUIP-SLISHMAN",
  refNo: "Ref. 1323",
  title: "Slishman Traction Splint",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Apr 2016",
  tags: ["traction splint", "femur fracture", "splint", "trauma", "orthopedic", "mid-shaft femur"],
  icon: "medical_services",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Slishman Traction Splint", subtitle: "Equipment Guide" }]
    },
    {
      type: "meta",
      data: {
        "Indication": "Isolated mid-shaft femur fracture",
        "Scope": "ALS/BLS"
      }
    },
    {
      type: "warning",
      content: "Contraindicated for hip fractures, knee injuries, pelvic fractures, or fractures near the knee. Only for isolated mid-shaft femur fractures."
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Mid-shaft femur fracture", content: "Isolated closed fracture of femoral shaft" },
        { title: "Clinical findings", content: "Shortened leg, rotation, obvious deformity, severe pain with movement" }
      ]
    },
    {
      type: "accordion",
      title: "Contraindications",
      items: [
        { title: "Proximal femur/hip injury", content: "Fracture at or near hip joint" },
        { title: "Knee injury", content: "Associated knee fracture, dislocation, or ligament injury" },
        { title: "Pelvic fracture", content: "Signs of pelvic instability" },
        { title: "Ankle/foot injury", content: "Injuries that would be worsened by ankle hitch traction" },
        { title: "Partial amputation", content: "Risk of completing amputation" }
      ]
    },
    {
      type: "step-by-step",
      title: "Application",
      steps: [
        { stepNumber: 1, title: "Manual stabilization", description: "Partner maintains manual traction on leg during entire procedure" },
        { stepNumber: 2, title: "Size splint", description: "Size to uninjured leg - extend splint 4-6 inches beyond foot" },
        { stepNumber: 3, title: "Position splint", description: "Place splint under injured leg, ischial pad against ischial tuberosity" },
        { stepNumber: 4, title: "Secure straps", description: "Secure thigh and leg straps, avoiding fracture site" },
        { stepNumber: 5, title: "Apply ankle hitch", description: "Secure ankle hitch snugly around ankle" },
        { stepNumber: 6, title: "Apply traction", description: "Apply mechanical traction until pain relief and leg length restoration" },
        { stepNumber: 7, title: "Reassess", description: "Check distal PMS before and after application" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Traction Goal",
      content: "Apply enough traction for pain relief and approximate restoration of leg length. Over-traction can cause additional injury. Typically 10-15 lbs is sufficient."
    }
  ]
};
