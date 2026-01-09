import { Protocol } from '../../../types';

export const humeralIO: Protocol = {
  id: "CURR-PROC-001",
  refNo: "Curriculum PROC-001",
  title: "Humeral IO Access Training",
  category: "Curriculum",
  type: "Training Module",
  lastUpdated: "Jan 2026",
  tags: ["IO", "vascular access", "humeral", "training", "procedures"],
  icon: "vaccines",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Humeral IO Access", subtitle: "Training Module • PROC-001", icon: "vaccines" }]
    },
    {
      type: "text",
      title: "Learning Objectives",
      content: "Upon completion, learner will:<br>1) Identify correct humeral IO insertion site<br>2) Demonstrate proper insertion technique<br>3) Verify placement<br>4) Manage complications"
    },
    {
      type: "list",
      title: "Indications for Humeral IO",
      items: [
        { title: "Primary Indication", content: "Unable to establish peripheral IV access within 90 seconds or 2 attempts.", icon: "timer" },
        { title: "Emergent Access", content: "Cardiac arrest, shock, altered mental status requiring immediate vascular access.", icon: "emergency" },
        { title: "Site Preference", content: "Humeral site preferred in adults - faster flow rates than tibial, less patient discomfort.", icon: "person" }
      ]
    },
    {
      type: "step-by-step",
      title: "Anatomical Landmarks",
      steps: [
        {
          stepNumber: 1,
          title: "Position the Arm",
          description: "Place patient's hand over umbilicus (adducted, internally rotated). This exposes the greater tubercle.",
          tip: "Internal rotation is key - it brings the greater tubercle to the most accessible position"
        },
        {
          stepNumber: 2,
          title: "Palpate Coracoid Process",
          description: "Feel for the coracoid process anteriorly (bony prominence below clavicle)."
        },
        {
          stepNumber: 3,
          title: "Locate Greater Tubercle",
          description: "Draw an imaginary line laterally from coracoid to the <b>greater tubercle</b> - the most prominent bony landmark at the top of the humerus.",
          substeps: [
            "Most prominent point when arm internally rotated",
            "Located 1-2cm lateral to the acromion",
            "Feels like a 'bump' at the top of the arm"
          ]
        },
        {
          stepNumber: 4,
          title: "Insertion Point",
          description: "Target the flat spot on the greater tubercle, <b>1-2cm above the surgical neck</b> of the humerus."
        }
      ]
    },
    {
      type: "step-by-step",
      title: "Insertion Procedure",
      steps: [
        {
          stepNumber: 1,
          title: "Preparation",
          description: "Clean site with antiseptic. Stabilize arm in adducted position.",
          duration: "10 seconds"
        },
        {
          stepNumber: 2,
          title: "Needle Selection",
          description: "<b>45mm needle</b> for average adults. <b>25mm</b> for thin patients or pediatrics."
        },
        {
          stepNumber: 3,
          title: "Insertion Angle",
          description: "Insert at <b>45° angle</b> aiming toward opposite hip (inferomedially). In obese patients, may use 90° angle.",
          warning: "Ensure needle is angled correctly to avoid slipping off the bone"
        },
        {
          stepNumber: 4,
          title: "Advancement",
          description: "Advance with firm pressure using power driver until hub reaches skin. You will feel a '<b>pop</b>' as cortex is penetrated.",
          duration: "2-3 seconds"
        },
        {
          stepNumber: 5,
          title: "Confirmation",
          description: "Remove stylet. Confirm placement:",
          substeps: [
            "Needle stands firmly without support",
            "Aspiration of marrow (not always present - not required)",
            "Flush with 10mL saline without resistance or extravasation"
          ]
        },
        {
          stepNumber: 6,
          title: "Secure",
          description: "Apply stabilization device. Tape securely. Document time of insertion."
        }
      ]
    },
    {
      type: "accordion",
      title: "Troubleshooting",
      items: [
        { title: "Difficult Advancement", content: "Ensure correct angle (45°). May need to reposition slightly. Do not force - if unable to advance, remove and reassess landmarks.", icon: "build" },
        { title: "Unable to Flush", content: "Needle may be against cortex - rotate slightly. If still unable to flush, remove and attempt different site.", icon: "water_drop" },
        { title: "Extravasation", content: "Swelling at site indicates failed placement. Remove needle, apply pressure, use alternate site (contralateral humerus or tibial).", icon: "warning" },
        { title: "Pain with Infusion", content: "<b>Lidocaine 2%</b> 20-40mg IO push slowly prior to infusion for conscious patients. Wait 60 seconds before flush.", icon: "medication" }
      ]
    },
    {
      type: "warning",
      content: "<b>Contraindications:</b><br>• Fracture of target bone<br>• Previous IO in same bone within 24-48 hours<br>• Infection at insertion site<br>• Prosthesis or hardware in target bone<br>• Inability to identify landmarks"
    },
    {
      type: "info",
      title: "Flow Rates",
      content: "<b>Humeral IO:</b> Up to 150 mL/min with pressure bag<br><b>Gravity only:</b> 30-50 mL/min<br><b>Comparison:</b> Humeral provides 2-3x flow rate vs tibial due to larger medullary cavity"
    }
  ]
};
