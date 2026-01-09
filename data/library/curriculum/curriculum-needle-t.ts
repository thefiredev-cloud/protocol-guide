import { Protocol } from '../../../types';

export const needleT: Protocol = {
  id: "CURR-PROC-002",
  refNo: "Curriculum PROC-002",
  title: "Needle Thoracostomy Training",
  category: "Curriculum",
  type: "Training Module",
  lastUpdated: "Jan 2026",
  tags: ["needle decompression", "pneumothorax", "tension", "training", "chest"],
  icon: "air",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Needle Thoracostomy", subtitle: "Training Module • PROC-002", icon: "air" }]
    },
    {
      type: "text",
      title: "Learning Objectives",
      content: "Upon completion, learner will:<br>1) Recognize tension pneumothorax<br>2) Identify correct insertion sites<br>3) Perform needle decompression safely<br>4) Assess for successful decompression"
    },
    {
      type: "warning",
      content: "<b>CRITICAL:</b> Tension pneumothorax is a <b>clinical diagnosis</b>. Do NOT delay treatment to confirm with imaging.<br><br><b>Classic Signs:</b> Severe respiratory distress, hypotension, absent breath sounds (affected side), JVD, tracheal deviation (late sign)."
    },
    {
      type: "list",
      title: "Indications",
      items: [
        { title: "Tension Pneumothorax", content: "Clinical findings: respiratory distress + unilateral absent breath sounds + hypotension + JVD", icon: "emergency" },
        { title: "Traumatic Arrest", content: "Consider bilateral decompression in traumatic cardiac arrest (especially penetrating chest trauma)", icon: "personal_injury" },
        { title: "Post-Intubation Deterioration", content: "Sudden decompensation after positive pressure ventilation - consider tension pneumo", icon: "warning" }
      ]
    },
    {
      type: "step-by-step",
      title: "Insertion Sites",
      steps: [
        {
          stepNumber: 1,
          title: "2nd Intercostal Space (Primary Site)",
          description: "<b>Location:</b> Midclavicular line, 2nd ICS (above 3rd rib)",
          substeps: [
            "Find the Angle of Louis (sternal angle)",
            "This marks the 2nd rib",
            "The space below is the 2nd ICS",
            "Go directly down the midclavicular line"
          ],
          tip: "Less adipose tissue than lateral approach, easier to landmark"
        },
        {
          stepNumber: 2,
          title: "4th-5th Intercostal Space (Alternative)",
          description: "<b>Location:</b> Anterior axillary line, 4th-5th ICS",
          substeps: [
            "Nipple line (male) or inframammary fold (female)",
            "Anterior axillary line",
            "Thinner chest wall in obese patients",
            "Larger pleural space target"
          ],
          tip: "Consider this approach in obese patients or if 2nd ICS approach fails"
        },
        {
          stepNumber: 3,
          title: "Needle Selection",
          description: "<b>Standard:</b> 14-gauge, 3.25 inch (8cm) angiocatheter<br><b>Obese patients:</b> May need longer needle or consider lateral approach"
        }
      ]
    },
    {
      type: "step-by-step",
      title: "Procedure Steps",
      steps: [
        {
          stepNumber: 1,
          title: "Identify Side",
          description: "Decompress the side with absent/decreased breath sounds and clinical signs of tension.",
          warning: "In traumatic arrest, consider bilateral decompression"
        },
        {
          stepNumber: 2,
          title: "Landmark Site",
          description: "Identify 2nd ICS, midclavicular line. Clean with antiseptic if time permits.",
          duration: "5-10 seconds"
        },
        {
          stepNumber: 3,
          title: "Insert Needle",
          description: "Insert <b>perpendicular to chest wall</b>, directly <b>above the 3rd rib</b> (avoids neurovascular bundle on inferior rib margin).",
          warning: "Always insert ABOVE the rib to avoid intercostal vessels and nerves"
        },
        {
          stepNumber: 4,
          title: "Advance Catheter",
          description: "Advance until '<b>pop</b>' felt or rush of air heard. Continue advancing catheter over needle into pleural space."
        },
        {
          stepNumber: 5,
          title: "Remove Needle",
          description: "Remove needle, leaving catheter in place. Secure with tape or commercial device."
        },
        {
          stepNumber: 6,
          title: "Reassess",
          description: "Assess for improvement in breath sounds, vital signs, respiratory status.",
          substeps: [
            "Listen for return of breath sounds",
            "Monitor blood pressure - should improve",
            "Observe respiratory effort - should ease"
          ]
        }
      ]
    },
    {
      type: "accordion",
      title: "Success Assessment",
      items: [
        { title: "Immediate Signs of Success", content: "• Rush of air on insertion<br>• Improvement in respiratory distress<br>• Return of breath sounds (may be delayed)<br>• Blood pressure improvement<br>• Improved SpO2", icon: "check_circle" },
        { title: "Failure Indicators", content: "• No air release<br>• No clinical improvement<br>• Consider: wrong diagnosis, wrong side, needle too short, kinked catheter", icon: "warning" },
        { title: "If No Improvement", content: "• Attempt alternate site (lateral approach)<br>• Consider bilateral decompression<br>• Reassess for other causes of shock (tamponade, hemorrhage)", icon: "refresh" }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Site:</b> Same anatomical landmarks<br><b>Needle:</b> 18-20 gauge, shorter length (2.5cm for infants, 3cm for children)<br><b>Depth:</b> Chest wall thinner - use less force, stop once pleural space entered"
    },
    {
      type: "warning",
      content: "<b>Potential Complications:</b><br>• Lung laceration (if lung has re-expanded)<br>• Cardiac or great vessel injury (too medial)<br>• Intercostal vessel injury (insert above rib, not below)<br>• Infection (rare in prehospital setting)<br>• Iatrogenic pneumothorax (if no tension present)"
    }
  ]
};
