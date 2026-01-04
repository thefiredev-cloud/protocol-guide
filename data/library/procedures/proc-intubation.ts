import { Protocol } from '../../../types';

export const procIntubation: Protocol = {
  id: "PROC-ETI",
  refNo: "Endotracheal Intubation",
  title: "Endotracheal Intubation",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2026",
  icon: "pulmonology",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Endotracheal Intubation", subtitle: "Advanced Airway Procedure", icon: "pulmonology" }]
    },
    {
      type: "list",
      title: "Indications",
      items: [
        { title: "Failure to Oxygenate", content: "Inability to maintain SpO2 > 90% despite BLS airway management." },
        { title: "Failure to Ventilate", content: "Inadequate respiratory effort or absent respirations." },
        { title: "Airway Protection", content: "GCS ≤ 8, absent gag reflex, risk of aspiration." },
        { title: "Prolonged Transport", content: "Extended transport time requiring definitive airway control." },
        { title: "Therapeutic Hyperventilation", content: "Head injury with signs of herniation." }
      ]
    },
    {
      type: "warning",
      content: "<b>Contraindications:</b><br>• Severe facial/laryngeal trauma (consider surgical airway)<br>• Suspected epiglottitis in pediatrics (unless respiratory arrest)<br>• Known difficult airway without backup equipment"
    },
    {
      type: "list",
      title: "Equipment Preparation",
      items: [
        { title: "Laryngoscope", content: "Check light source. Mac 3-4 or Miller 2-3 blades ready." },
        { title: "ETT", content: "Select size 7.0-8.0mm (adult male), 6.5-7.5mm (adult female). Check cuff integrity. Have +/- 0.5mm sizes ready." },
        { title: "Stylet", content: "Insert into ETT. Bend to hockey stick shape. Keep 1cm proximal to Murphy's eye." },
        { title: "Suction", content: "Yankauer rigid-tip suction ready and functional." },
        { title: "BVM & O2", content: "Connected to 15 LPM oxygen for preoxygenation." },
        { title: "Capnography", content: "Continuous waveform capnography ready for confirmation." },
        { title: "Rescue Devices", content: "iGel or King Airway sized and available." },
        { title: "Medications", content: "Sedation medications prepared per protocol." }
      ]
    },
    {
      type: "list",
      title: "Intubation Sequence",
      items: [
        { title: "1. Preparation", content: "<b>Position:</b> Sniffing position (head elevated, neck flexed, face extended).<br><b>Preoxygenate:</b> BVM with 100% O2 for 3-5 minutes. Target SpO2 100%." },
        { title: "2. Pretreatment", content: "<b>Optional:</b> Fentanyl 1-2 mcg/kg IV (if indicated for ICP/reactive airway).<br><b>Timing:</b> 3 minutes before induction." },
        { title: "3. Sedation", content: "<b>Sedation Agent:</b><br>• Midazolam 0.1-0.2 mg/kg IV<br>• Fentanyl 1-2 mcg/kg IV for analgesia<br><b>Note:</b> LA County EMS does not utilize RSI drugs (no paralytics or induction agents like Etomidate/Ketamine)." },
        { title: "4. Cricoid Pressure", content: "<b>Cricoid Pressure:</b> Apply gentle pressure (controversial - may impair visualization).<br><b>Monitor:</b> Wait for adequate sedation before attempting." },
        { title: "5. Placement", content: "<b>Laryngoscopy:</b> Insert blade from right side of mouth, sweep tongue left.<br><b>Visualization:</b> Lift blade at 45° angle (don't lever on teeth). Identify vocal cords.<br><b>BURP Maneuver:</b> Have assistant apply Backwards-Upward-Rightward Pressure on thyroid if needed.<br><b>Tube Insertion:</b> Pass ETT through cords until cuff just disappears (typically 21-23cm at teeth for adults).<br><b>Inflate Cuff:</b> 5-10mL air until seal achieved." },
        { title: "6. Proof", content: "<b>See confirmation section below</b>" }
      ]
    },
    {
      type: "list",
      title: "Confirmation Techniques",
      items: [
        { title: "Primary - Capnography", content: "<b>REQUIRED:</b> Continuous waveform capnography showing:<br>• Waveform present with consistent pattern<br>• ETCO2 35-45 mmHg (allows for range 30-50)<br>• Sustained over 6 breaths" },
        { title: "Secondary - Physical Exam", content: "• Direct visualization of tube passing through cords<br>• Bilateral chest rise and fall<br>• Absent epigastric sounds<br>• Equal bilateral breath sounds (apex and bases)<br>• Chest rise symmetrical" },
        { title: "Adjunct - Colorimetric", content: "• EDD (Esophageal Detector Device) - easy aspiration indicates tracheal placement<br>• Colorimetric CO2 detector changes yellow (if capnography unavailable)" },
        { title: "Documentation", content: "• Note ETT depth at teeth (cm marking)<br>• Document all confirmation methods used<br>• Secure tube with commercial device or tape<br>• Reconfirm after any patient movement" }
      ]
    },
    {
      type: "list",
      title: "Post-Intubation Management",
      items: [
        { title: "Sedation", content: "Maintain sedation with:<br>• Midazolam 0.05-0.1 mg/kg IV q15min PRN<br>• Fentanyl 1-2 mcg/kg IV q30min PRN" },
        { title: "Ventilation", content: "• Rate: 10-12 breaths/min (adults), higher for pediatrics<br>• Tidal Volume: 6-7 mL/kg ideal body weight<br>• ETCO2 target: 35-40 mmHg (30-35 if head injury)" },
        { title: "Monitoring", content: "• Continuous waveform capnography<br>• Pulse oximetry<br>• Vital signs q5min<br>• Tube security and depth" }
      ]
    },
    {
      type: "warning",
      content: "<b>DOPE Mnemonic for Tube Deterioration:</b><br><b>D</b>isplacement - Tube moved (check depth at teeth)<br><b>O</b>bstruction - Secretions or blood (suction through tube)<br><b>P</b>neumothorax - Unilateral breath sounds (decompress)<br><b>E</b>quipment - BVM, O2, ventilator malfunction (disconnect & bag)"
    },
    {
      type: "list",
      title: "Troubleshooting",
      items: [
        { title: "Can't Visualize Cords", content: "• BURP maneuver<br>• Suction airway<br>• Different blade (Mac vs Miller)<br>• Reduce cricoid pressure<br>• External laryngeal manipulation (ELM)" },
        { title: "Can't Intubate", content: "<b>After 2 attempts or SpO2 < 90%:</b><br>1. Resume BVM ventilation<br>2. Reoxygenate to SpO2 > 95%<br>3. Consider alternative approaches or rescue airway (iGel/King)<br>4. Do not exceed 3 attempts" },
        { title: "Right Main Stem", content: "If only right-sided breath sounds:<br>• Deflate cuff<br>• Withdraw tube 1-2 cm<br>• Reinflate cuff<br>• Reassess bilateral sounds" },
        { title: "Esophageal Intubation", content: "<b>Immediately:</b><br>• Deflate cuff and remove tube<br>• Ventilate with BVM<br>• Reoxygenate<br>• Reattempt after SpO2 > 95%" }
      ]
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>ETT Size (uncuffed):</b> (Age in years / 4) + 4<br><b>ETT Size (cuffed):</b> (Age in years / 4) + 3<br><b>Depth:</b> (Age in years / 2) + 12 cm at lips<br><b>Straight blade</b> (Miller) preferred in infants/young children<br><b>Higher oxygen consumption</b> - preoxygenate thoroughly, work quickly"
    }
  ]
};
