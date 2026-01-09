import { Protocol } from '../../../types';

export const complicatedDelivery: Protocol = {
  id: "CURR-OB-001",
  refNo: "Curriculum OB-001",
  title: "Complicated Delivery Procedures",
  category: "Curriculum",
  type: "Training Module",
  lastUpdated: "Jan 2026",
  tags: ["OB", "delivery", "training", "complications"],
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Complicated Delivery Procedures", subtitle: "Training Module • OB-001", icon: "pregnant_woman" }]
    },
    {
      type: "text",
      title: "Learning Objectives",
      content: "Upon completion, learner will be able to:<br>1) Identify complicated delivery presentations<br>2) Perform appropriate interventions<br>3) Determine correct destination facility"
    },
    {
      type: "accordion",
      title: "Breech Presentation",
      items: [
        { title: "Recognition", content: "Buttocks or feet presenting first instead of head. May be complete (sitting), frank (legs extended), or footling (one/both feet).", icon: "visibility" },
        { title: "Step 1: Do NOT Pull", content: "Allow delivery to occur spontaneously to the umbilicus. Support the body but <b>do not apply traction</b>.", icon: "warning" },
        { title: "Step 2: Support Body", content: "Support infant's body as it delivers. Keep the back upward. Maintain flexion of the head.", icon: "pan_tool" },
        { title: "Step 3: Facilitate Head", content: "If head does not deliver within 3 minutes, apply suprapubic pressure. Consider Mauriceau-Smellie-Veit maneuver.", icon: "child_care" },
        { title: "Transport Decision", content: "Transport to Perinatal Center with NICU capability. <b>CONTACT BASE</b> for all breech presentations.", icon: "local_hospital" }
      ]
    },
    {
      type: "accordion",
      title: "Prolapsed Cord",
      items: [
        { title: "Recognition", content: "<b>EMERGENCY</b> - Umbilical cord precedes presenting part. Cord compression causes fetal hypoxia. <b>Time is critical.</b>", icon: "warning" },
        { title: "Step 1: Position", content: "Place mother in <b>knee-chest position</b> or Trendelenburg with hips elevated.", icon: "accessibility" },
        { title: "Step 2: Reduce Pressure", content: "Insert gloved hand into vagina and gently push presenting part <b>UP</b> off cord. <b>DO NOT remove hand.</b>", icon: "pan_tool" },
        { title: "Step 3: Protect Cord", content: "Keep cord moist with warm saline. Do not attempt to replace cord into vagina.", icon: "water_drop" },
        { title: "Step 4: Rapid Transport", content: "<b>IMMEDIATE</b> transport to closest facility with OB surgical capability. Maintain pressure until surgical delivery.", icon: "emergency" }
      ]
    },
    {
      type: "step-by-step",
      title: "Shoulder Dystocia - McRoberts Maneuver",
      steps: [
        {
          stepNumber: 1,
          title: "Recognition",
          description: "Head delivers but shoulders do not follow despite gentle traction. '<b>Turtle sign</b>' - head retracts against perineum.",
          warning: "Time is critical - 4-5 minutes until hypoxic injury"
        },
        {
          stepNumber: 2,
          title: "Call for Help",
          description: "Request additional personnel immediately. Note the time - document for medical record."
        },
        {
          stepNumber: 3,
          title: "Flatten Bed",
          description: "Flatten the bed completely. Remove all pillows from under mother."
        },
        {
          stepNumber: 4,
          title: "McRoberts Position",
          description: "<b>Hyperflex mother's thighs</b> against her abdomen. Bring knees up toward chest/shoulders. Thighs pressed tightly against abdomen, legs abducted.",
          tip: "This flattens the sacrum and rotates the pelvis to increase pelvic diameter"
        },
        {
          stepNumber: 5,
          title: "Suprapubic Pressure",
          description: "Apply firm <b>downward and lateral</b> pressure just above the pubic bone using heel of hand. This dislodges the anterior shoulder.",
          warning: "DO NOT use fundal pressure - this worsens impaction"
        },
        {
          stepNumber: 6,
          title: "If Unsuccessful",
          description: "Consider rotational maneuvers:<br>• <b>Rubin II</b> - rotate anterior shoulder posteriorly<br>• <b>Woods screw</b> - rotate posterior shoulder anteriorly<br>• <b>Delivery of posterior arm</b>",
          substeps: [
            "CONTACT BASE for guidance",
            "Document all maneuvers attempted",
            "Prepare for neonatal resuscitation"
          ]
        }
      ]
    },
    {
      type: "list",
      title: "Destination Decision Matrix",
      items: [
        { title: "Perinatal Center + EDAP", content: "Gestational age > 34 weeks with uncomplicated delivery.", icon: "local_hospital" },
        { title: "Perinatal Center + NICU", content: "Gestational age ≤ 34 weeks OR complicated delivery (breech, dystocia, distress).", icon: "emergency" },
        { title: "Closest Hospital", content: "Prolapsed cord, active hemorrhage with maternal instability - closest facility with surgical OB capability.", icon: "warning" }
      ]
    },
    {
      type: "facility-finder",
      title: "Nearest Perinatal/Pediatric Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "warning",
      content: "<b>Critical Reminders:</b><br>• CONTACT BASE for ALL complicated deliveries<br>• Document time of delivery, APGAR scores, all interventions<br>• Reference TP-1215, TP-1217, TP-1216 for treatment protocols"
    }
  ]
};
