import { Protocol } from '../../../types';

export const procIOVascular: Protocol = {
  id: "PROC-IO-VASCULAR",
  refNo: "Ref. 806",
  title: "Intraosseous (IO) Vascular Access",
  category: "Procedures",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  tags: ["IO", "vascular access", "intraosseous", "lidocaine", "EZ-IO", "tibial", "cardiac arrest", "shock"],
  icon: "vaccines",
  color: "teal",
  sections: [
    {
      type: "header",
      items: [{ title: "IO Vascular Access", subtitle: "Procedure • Ref. 806", icon: "vaccines" }]
    },
    {
      type: "meta",
      data: {
        "Scope": "PARAMEDIC",
        "Approved Site": "Proximal Tibia ONLY"
      }
    },
    {
      type: "warning",
      content: "<b>Proximal Tibia is the ONLY approved IO insertion site per LA County DHS.</b>"
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        {
          title: "Indication 1: Cardiac Arrest",
          content: "Adult or Pediatric Cardiopulmonary Arrest (medical or trauma) when IV access:<br>• Is not possible<br>• Unlikely to be successful<br>• Cannot be achieved quickly (<b>2 attempts OR ≥ 90 seconds</b>)"
        },
        {
          title: "Indication 2: Hypovolemic Shock",
          content: "ALL of the following must be present:<br>• ALOC with <b>GCS ≤ 8</b><br>• Adult/Child <b>SBP < 90</b> OR Infant <b>SBP < 70</b><br>• 2 peripheral IV attempts OR ≥ 90 seconds with no success"
        },
        {
          title: "Indication 3: Burns",
          content: "Burns to bilateral upper extremities where IV access is not feasible"
        }
      ]
    },
    {
      type: "warning",
      title: "Contraindications",
      content: "<b>Do NOT place IO if:</b><br>• Fracture of target bone<br>• Surgical scar over knee/target bone area<br>• Infection at intended site<br>• Excessive tissue at site<br>• Absence of adequate landmarks<br>• IO catheter use in past 48 hours in same target bone"
    },
    {
      type: "accordion",
      title: "IO Procedure",
      items: [
        { title: "Step 1", content: "Locate landmarks on proximal tibia" },
        { title: "Step 2", content: "Clean insertion site" },
        { title: "Step 3", content: "Insert IO device" },
        { title: "Step 4", content: "Consider <b>2% Lidocaine HCL</b> for conscious patients (see dosing below)" },
        { title: "Step 5", content: "Flush IO with 10mL NS" },
        { title: "Step 6", content: "Confirm placement" },
        { title: "Step 7", content: "Secure IO device" },
        { title: "Step 8", content: "Use Ref. 806 for medication administration" }
      ]
    },
    {
      type: "accordion",
      title: "Lidocaine Pain Management (Conscious Patients)",
      items: [
        {
          title: "Adult Dose",
          content: "<b>Lidocaine 2%: 40 mg</b> IO over 2 minutes<br>May repeat x1 if needed"
        },
        {
          title: "Pediatric Dose",
          content: "<b>Lidocaine 2%: 0.5 mg/kg</b> IO over 2 minutes<br>May repeat x1 if needed<br><b>MAX: 40 mg</b>"
        },
        {
          title: "Administration",
          content: "Administer slowly over 2 minutes. Allow 60 seconds dwell time before flush or medication administration."
        }
      ]
    },
    {
      type: "list",
      title: "Documentation Requirements",
      items: [
        { content: "Number of IV attempts prior to IO" },
        { content: "Size of IO needle used" },
        { content: "Date/time of IO insertion" },
        { content: "All medications/fluids administered via IO" },
        { content: "\"U\" in IV gauge field on ePCR" },
        { content: "Complete LACoFD IO Quality Improvement (QI) Form" }
      ]
    },
    {
      type: "info",
      title: "Related Protocols",
      content: "See <b>Ref. 806</b> for complete IV/IO Access Protocol including medication administration guidelines."
    }
  ]
};
