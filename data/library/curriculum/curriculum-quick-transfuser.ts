import { Protocol } from '../../../types';

export const quickTransfuser: Protocol = {
  id: "CURR-PROC-003",
  refNo: "Curriculum PROC-003",
  title: "Prehospital Blood Transfusion Training",
  category: "Curriculum",
  type: "Training Module",
  lastUpdated: "Jan 2026",
  tags: ["blood", "transfusion", "LA-DROP", "trauma", "hemorrhage", "training"],
  icon: "bloodtype",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Blood Transfusion Procedure", subtitle: "Training Module • PROC-003", icon: "bloodtype" }]
    },
    {
      type: "text",
      title: "Learning Objectives",
      content: "Upon completion, learner will:<br>1) Understand LA-DROP inclusion/exclusion criteria<br>2) Set up and administer blood products<br>3) Use rapid infusion devices<br>4) Recognize and manage transfusion reactions"
    },
    {
      type: "warning",
      content: "<b>PILOT PROTOCOL:</b> Prehospital blood transfusion (LA-DROP) is only authorized for approved provider agencies. Reference LA-DROP protocol for full criteria."
    },
    {
      type: "accordion",
      title: "Patient Selection Criteria",
      items: [
        { title: "Inclusion - Etiology", content: "Hemorrhagic shock due to:<br>• Severe traumatic injury<br>• Post-partum hemorrhage", icon: "personal_injury" },
        { title: "Inclusion - Physiologic", content: "Must meet <b>ONE</b> of:<br>• SBP < 70 mmHg (or unable to obtain)<br>• SBP < 90 mmHg <b>AND</b> HR ≥ 110<br>• Traumatic arrest witnessed by EMS", icon: "monitor_heart" },
        { title: "Exclusions", content: "• Pediatric (≤14 years or on length-based tape)<br>• Traumatic arrest NOT witnessed by EMS<br>• Isolated head injury / ground level fall<br>• Patient refusal", icon: "block" }
      ]
    },
    {
      type: "step-by-step",
      title: "Equipment Setup",
      steps: [
        {
          stepNumber: 1,
          title: "Blood Products",
          description: "<b>Low Titer O-positive Whole Blood</b> (LTO+WB) OR packed red blood cells (PRBCs) - stored per protocol temperature requirements.",
          warning: "Verify product has not exceeded temperature limits"
        },
        {
          stepNumber: 2,
          title: "Tubing",
          description: "Blood administration set with <b>in-line filter</b>. Y-connector for saline prime."
        },
        {
          stepNumber: 3,
          title: "Warming Device",
          description: "Blood warmer (e.g., Buddy Lite, enFlow) prevents hypothermia and cardiac arrhythmias.",
          tip: "Cold blood can cause cardiac arrhythmias and worsen coagulopathy"
        },
        {
          stepNumber: 4,
          title: "Rapid Infuser",
          description: "Pressure bag (300 mmHg) OR mechanical rapid infuser for faster delivery."
        },
        {
          stepNumber: 5,
          title: "Monitoring",
          description: "Cardiac monitor, SpO2, EtCO2, BP cuff - vitals q3min during transfusion."
        }
      ]
    },
    {
      type: "step-by-step",
      title: "Administration Procedure",
      steps: [
        {
          stepNumber: 1,
          title: "Safety Verification",
          description: "<b>TWO PROVIDER CHECK:</b> Verify product type, Rh factor, expiration date. Inspect bag for integrity, clots, discoloration.",
          warning: "Do NOT use if bag is damaged, discolored, or expired"
        },
        {
          stepNumber: 2,
          title: "Vascular Access",
          description: "Establish <b>2 large-bore IVs</b> (preferred) or IO. Minimum 18g for blood administration.",
          tip: "Larger bore = faster flow rates"
        },
        {
          stepNumber: 3,
          title: "Prime System",
          description: "Prime tubing and blood warmer with normal saline. Spike blood unit to Y-connector."
        },
        {
          stepNumber: 4,
          title: "Initiate Transfusion",
          description: "Open clamp to blood unit. Apply pressure bag inflated to <b>300 mmHg</b> for rapid infusion.",
          duration: "One unit in ~10-15 minutes"
        },
        {
          stepNumber: 5,
          title: "Monitor",
          description: "Vitals <b>q3 minutes</b>. Monitor for transfusion reaction signs. Maintain IV/IO patency."
        },
        {
          stepNumber: 6,
          title: "Documentation",
          description: "Apply transfusion wristband. Document product info, start time, vitals, patient response."
        }
      ]
    },
    {
      type: "list",
      title: "Rapid Infusion Technique",
      items: [
        { title: "Pressure Bag Method", content: "Inflate to 300 mmHg around blood bag. Monitor for air in line. One unit in ~10-15 minutes.", icon: "compress" },
        { title: "Rapid Infuser Device", content: "If available (e.g., Level 1, Belmont) - follow device-specific setup and monitoring protocols.", icon: "precision_manufacturing" },
        { title: "Volume Targets", content: "Initial: 1 unit LTO+WB OR 2 units PRBCs. Reassess - may repeat x1 if criteria still met.", icon: "water_drop" }
      ]
    },
    {
      type: "warning",
      title: "Transfusion Reaction Management",
      content: "<b>Signs:</b> Fever, chills, urticaria/hives, hypotension, dyspnea, back pain<br><br><b>IMMEDIATE ACTIONS:</b><br>1. <b>STOP TRANSFUSION</b><br>2. Disconnect blood from tubing, flush line with saline<br>3. Maintain IV access<br>4. Treat per TP-1219 (Allergic Reaction) / TP-1214 (Shock)<br>5. Save blood bag and tubing for analysis<br>6. <b>CONTACT BASE</b>"
    },
    {
      type: "accordion",
      title: "Consent and Communication",
      items: [
        { title: "Informed Consent Script", content: "\"We need to give you a life-saving blood transfusion due to your severe bleeding. The risks are very low and include allergy, fever, or breathing reactions. We will monitor you closely.\"", icon: "record_voice_over" },
        { title: "Refusal Script", content: "\"Because I want to respect your decisions, I want to confirm that you do not want blood products even if that means you might die. Is that correct?\"", icon: "do_not_disturb" },
        { title: "Special Cases", content: "<b>Females <50y:</b> Warn of potential risk to future pregnancies (Rh sensitization)<br><b>Minors:</b> Parent/guardian or implied consent in emergency", icon: "info" }
      ]
    },
    {
      type: "facility-finder",
      title: "Nearest Trauma Center",
      facilityTypes: ["trauma"]
    },
    {
      type: "info",
      title: "Related Protocols",
      content: "• <b>LA-DROP:</b> Full criteria and treatment algorithm<br>• <b>TP-1244:</b> Multi-System Trauma<br>• <b>MCG-1370:</b> Hemorrhage Control<br>• <b>TXA:</b> Administer 1g IV/IO over 10 min concurrent with transfusion"
    }
  ]
};
