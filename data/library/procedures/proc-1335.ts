
import { Protocol } from '../../../types';

export const proc1335: Protocol = {
  id: "1335",
  refNo: "MCG 1335",
  title: "Needle Thoracostomy",
  category: "Procedures",
  type: "Medical Control Guideline",
  lastUpdated: "Jan 1, 2025",
  icon: "air",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Needle Thoracostomy", subtitle: "Chest Decompression • MCG 1335", icon: "air" }]
    },
    {
      type: "warning",
      content: "<b>LIFE-SAVING PROCEDURE</b><br>Needle thoracostomy (needle decompression) is indicated for suspected tension pneumothorax. Do not delay for confirmation – clinical suspicion is sufficient in the setting of respiratory distress or traumatic arrest."
    },
    {
      type: "list",
      title: "Indications",
      items: [
        { title: "Tension Pneumothorax", content: "Clinical signs + mechanism. Do NOT wait for confirmation." },
        { title: "Traumatic Arrest", content: "<b>Bilateral decompression is STANDARD</b> in all traumatic cardiac arrests – do not wait for signs." },
        { title: "Decompensating Trauma Patient", content: "Penetrating chest trauma or blunt chest trauma with respiratory distress and signs of pneumothorax." }
      ]
    },
    {
      type: "accordion",
      title: "Clinical Signs of Tension Pneumothorax",
      items: [
        {
          title: "Early Signs",
          content: "• Respiratory distress / dyspnea<br>• Chest pain (pleuritic)<br>• Tachycardia<br>• Decreased breath sounds on affected side<br>• Hyperresonance to percussion (if time to assess)",
          icon: "warning"
        },
        {
          title: "Late / Ominous Signs",
          content: "• Hypotension / shock<br>• Tracheal deviation (away from affected side)<br>• JVD (jugular venous distension)<br>• Cyanosis<br>• Altered mental status<br>• Pulseless electrical activity (PEA)",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "Procedure"
    },
    {
      type: "list",
      title: "Equipment",
      items: [
        { title: "Needle", content: "<b>14-gauge, 3.25 inch (8 cm)</b> angiocatheter. Longer needle (10 cm) may be needed for obese patients." },
        { title: "Alternative", content: "Commercial chest decompression devices (e.g., ARS needle, Pneumothorax Needle)." },
        { title: "Supplies", content: "Antiseptic wipe, gloves, occlusive dressing or one-way valve (optional)." }
      ]
    },
    {
      type: "accordion",
      title: "Site Selection",
      items: [
        {
          title: "Anterior Approach (Traditional)",
          content: "<b>2nd Intercostal Space, Midclavicular Line</b><br><br><b>Landmarks:</b><br>• Identify clavicle<br>• Find sternal angle (angle of Louis) – marks 2nd rib<br>• 2nd ICS is just below 2nd rib<br>• Midclavicular line – midpoint of clavicle<br><br><b>Advantages:</b> Easy landmarks, familiar location<br><b>Disadvantages:</b> Higher failure rate in obese patients",
          icon: "person"
        },
        {
          title: "Lateral Approach (Preferred for Obese)",
          content: "<b>4th-5th Intercostal Space, Anterior Axillary Line</b><br><br><b>Landmarks:</b><br>• Nipple level in males (approximately 5th ICS)<br>• Inframammary fold in females<br>• Anterior axillary line (front of armpit)<br><br><b>Advantages:</b> Thinner chest wall, higher success in obese<br><b>Disadvantages:</b> Harder to access in some positions",
          icon: "accessibility"
        }
      ]
    },
    {
      type: "list",
      title: "Insertion Technique",
      items: [
        { title: "1. Identify Site", content: "Choose anterior or lateral approach based on patient body habitus. Mark the location." },
        { title: "2. Prep Site", content: "Cleanse with antiseptic if time permits. In arrest, proceed immediately." },
        { title: "3. Insert Needle", content: "<b>Insert perpendicular to chest wall</b> (90°), aiming OVER the top of the rib (inferior border) to avoid the intercostal neurovascular bundle." },
        { title: "4. Advance with Aspiration", content: "Advance needle while aspirating with syringe (optional). Feel for 'pop' and rush of air when pleural space entered." },
        { title: "5. Remove Stylet", content: "Once in pleural space, advance catheter and remove needle/stylet. Leave catheter in place." },
        { title: "6. Confirm Decompression", content: "Listen for rush of air. Reassess breath sounds and vital signs. Clinical improvement expected within seconds." },
        { title: "7. Secure Catheter", content: "Tape catheter in place. Consider one-way valve or occlusive dressing if available." }
      ]
    },
    {
      type: "warning",
      content: "<b>CRITICAL REMINDERS:</b><br><br>• Insert needle <b>OVER the top of the rib</b> (inferior border) – the neurovascular bundle runs along the inferior edge of the rib above<br><br>• Use <b>long enough needle</b> – standard 1.5\" IV catheters often do NOT reach the pleural space. Use 3.25\" (8 cm) minimum<br><br>• In <b>traumatic arrest</b>: Perform BILATERAL decompression without waiting for signs"
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Needle size:</b> Use smaller gauge (16-18G) and shorter length in small children<br><br><b>Site:</b> Same landmarks – 2nd ICS midclavicular OR 4th-5th ICS anterior axillary<br><br><b>Depth:</b> Chest wall is thinner – advance carefully<br><br><b>Indications:</b> Same as adult – do not hesitate in traumatic arrest"
    },
    {
      type: "accordion",
      title: "Troubleshooting",
      items: [
        {
          title: "No Rush of Air",
          content: "• Needle may not be long enough – use longer needle<br>• May not have entered pleural space – advance further (carefully)<br>• No tension pneumothorax present – reassess diagnosis<br>• Consider alternate site (lateral approach)"
        },
        {
          title: "No Clinical Improvement",
          content: "• Catheter may have kinked or dislodged – reassess position<br>• Bilateral pneumothorax – decompress other side<br>• Other cause of decompensation (tamponade, hemorrhage)<br>• Massive hemothorax requiring chest tube (not field procedure)"
        },
        {
          title: "Catheter Dislodges",
          content: "• Secure with tape and commercial device<br>• If fully dislodged with ongoing tension, reinsert new needle<br>• Cover site if open pneumothorax suspected"
        }
      ]
    },
    {
      type: "info",
      title: "Contraindications",
      content: "<b>Relative contraindications:</b> None in the setting of life-threatening tension pneumothorax<br><br><b>Consider risks in:</b><br>• Simple pneumothorax without tension (may convert to open)<br>• Hemothorax (will not improve with needle decompression)<br>• Coagulopathy (bleeding risk)<br><br><b>Note:</b> In cardiac arrest or peri-arrest, there are NO contraindications – the patient will die without decompression."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Don't second-guess yourself in arrest:</b> If the patient is in traumatic arrest, bilateral decompression is standard of care. The downside of unnecessary decompression is minimal; the downside of missing a tension pneumothorax is death.<br><br><b>Chest wall thickness:</b> Studies show 2nd ICS at MCL has chest wall thickness exceeding 4.5 cm in 30-50% of patients. Consider lateral approach in larger patients.<br><br><b>Needle too short:</b> The #1 cause of failed decompression is using a standard IV catheter (1.5\"). Use 3.25\" (8 cm) or longer.<br><br><b>Hiss of air:</b> You may or may not hear a 'hiss' – don't rely on it. Look for clinical improvement."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1243 Traumatic Arrest" },
        { title: "TP-1244 Traumatic Injury" },
        { title: "MCG 1302 Airway Management" },
        { title: "TP-1210 Cardiac Arrest" }
      ]
    }
  ]
};
