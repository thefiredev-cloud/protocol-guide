
import { Protocol } from '../../../types';

export const tp1243: Protocol = {
  id: "1243",
  refNo: "TP-1243",
  title: "Traumatic Arrest",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Oct 1, 2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Arrest", subtitle: "Adult • Standing Order", icon: "personal_injury" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "CABT", content: "Cardiac Arrest – Blunt Trauma. Arrest from blunt mechanism (MVC, fall, assault)." },
        { title: "CAPT", content: "Cardiac Arrest – Penetrating Trauma. Arrest from penetrating mechanism (GSW, stab wound)." }
      ]
    },
    {
      type: "warning",
      content: "<b>CRITICAL DIFFERENCE FROM MEDICAL ARREST:</b><br>Traumatic arrest has different priorities than medical arrest. Focus on REVERSIBLE TRAUMATIC CAUSES before standard ACLS.<br><br><b>Immediate interventions (before or during CPR):</b><br>1. Bilateral needle decompression<br>2. Massive hemorrhage control<br>3. Airway management<br><br><b>Epinephrine is NOT first-line</b> – fix mechanical problems first."
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Immediate Actions (Simultaneous)",
      items: [
        { title: "1. Confirm Arrest", content: "Unresponsive, apneic, pulseless. Begin CPR if no signs of obvious death." },
        { title: "2. Bilateral Needle Decompression", content: "<b>PERFORM IMMEDIATELY</b> – do not wait for suspected tension pneumothorax. Decompress both sides empirically in traumatic arrest (MCG 1335)." },
        { title: "3. Control Hemorrhage", content: "<b>Direct pressure, tourniquets, wound packing.</b> Massive transfusion if available. Address external and compressible bleeding." },
        { title: "4. Airway", content: "Definitive airway with C-spine precautions. Ensure effective ventilation – avoid hyperventilation." },
        { title: "5. IV/IO Access", content: "Large bore IV or IO. Prepare for volume resuscitation." }
      ]
    },
    {
      type: "list",
      title: "After Mechanical Causes Addressed",
      items: [
        { title: "6. Rhythm Check", content: "Identify rhythm: VF/pVT (rare in trauma) vs PEA/Asystole (common)." },
        { title: "7. Epinephrine", content: "1 mg IV/IO if PEA persists after mechanical interventions. Repeat q3-5 min." },
        { title: "8. Fluid Resuscitation", content: "<b>NS or LR bolus 500-1000 mL</b> for suspected hypovolemia. Blood products if available." },
        { title: "9. Defibrillation", content: "If VF/pVT present (rare), defibrillate per standard protocol." },
        { title: "10. Transport", content: "Rapid transport to trauma center. Consider load-and-go vs resuscitative thoracotomy capability." }
      ]
    },
    {
      type: "accordion",
      title: "Reversible Traumatic Causes",
      items: [
        {
          title: "Tension Pneumothorax",
          content: "<b>Most common reversible cause.</b><br><br><b>Signs:</b> Unilateral absent breath sounds, tracheal deviation (late), JVD, hypotension.<br><br><b>Treatment:</b> Bilateral needle decompression (MCG 1335). Do NOT wait for signs – decompress empirically in traumatic arrest.<br><br><b>Sites:</b><br>• 2nd ICS, midclavicular line (anterior approach)<br>• 4th-5th ICS, anterior axillary line (lateral approach – preferred if obese)"
        },
        {
          title: "Hypovolemia/Hemorrhage",
          content: "<b>Second most common cause.</b><br><br><b>Sources:</b> Chest, abdomen, pelvis, long bones, external.<br><br><b>Field Treatment:</b><br>• Tourniquets for extremity hemorrhage<br>• Wound packing for junctional wounds<br>• Pelvic binder for suspected pelvic fracture<br>• IV/IO fluid bolus (NS/LR)<br>• Blood products if available (per MCG 1333)<br>• TXA 1g IV if < 3 hours from injury"
        },
        {
          title: "Cardiac Tamponade",
          content: "<b>Primarily penetrating trauma to chest.</b><br><br><b>Signs:</b> Beck's Triad (JVD, muffled heart sounds, hypotension) – often absent in hypovolemia.<br><br><b>Field Treatment:</b> Limited. Rapid transport to trauma OR for thoracotomy. Pericardiocentesis only if trained/equipped and prolonged transport."
        },
        {
          title: "Airway Obstruction",
          content: "<b>Blood, vomitus, teeth, foreign body.</b><br><br><b>Treatment:</b><br>• Suction aggressively<br>• Remove visible obstructions<br>• Jaw thrust with C-spine precautions<br>• Definitive airway (ETI or surgical if indicated)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Medication Dosing",
      items: [
        {
          title: "Epinephrine",
          content: "<b>Adult:</b> 1 mg IV/IO every 3-5 min (after mechanical causes addressed)<br><b>Pediatric:</b> 0.01 mg/kg IV/IO every 3-5 min<br><br><b>Note:</b> Less effective in traumatic arrest than medical arrest. Fix mechanical problems first.",
          icon: "medication"
        },
        {
          title: "Tranexamic Acid (TXA)",
          content: "<b>Indication:</b> Hemorrhagic shock, < 3 hours from injury<br><b>Adult:</b> 1 g IV over 10 min (or 2 g if in extremis)<br><b>Pediatric:</b> 15 mg/kg IV (max 1 g)<br><br><b>Contraindication:</b> > 3 hours from injury, isolated TBI",
          icon: "medication"
        },
        {
          title: "Calcium Chloride",
          content: "<b>Indication:</b> Massive transfusion (citrate toxicity), suspected hyperkalemia from crush<br><b>Adult:</b> 1 g IV slow push<br><b>Pediatric:</b> 20 mg/kg IV (max 1 g)",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Blunt vs Penetrating Considerations",
      items: [
        {
          title: "Blunt Trauma Arrest",
          content: "<b>Survival rate:</b> < 2% overall<br><br><b>Best prognosis:</b><br>• Witnessed arrest<br>• Short downtime<br>• Organized rhythm on arrival<br>• Signs of life in field<br><br><b>Common causes:</b> Tension pneumothorax, massive hemorrhage, C-spine injury with cord transection"
        },
        {
          title: "Penetrating Trauma Arrest",
          content: "<b>Survival rate:</b> 5-15% (higher than blunt)<br><br><b>Best prognosis:</b><br>• Stab wound (vs GSW)<br>• Cardiac injury amenable to repair<br>• Short transport to trauma OR<br>• Signs of life within 15 minutes<br><br><b>Consider:</b> ED thoracotomy may be indicated if < 15 min downtime and penetrating chest trauma"
        }
      ]
    },
    {
      type: "warning",
      content: "<b>Termination of Resuscitation – Traumatic Arrest:</b><br><br><b>Consider field termination if ALL criteria met:</b><br>• No signs of life (no pulse, no respiratory effort, no pupillary response)<br>• Asystole after 15 minutes of resuscitation<br>• All reversible causes addressed<br>• No transport benefit (trauma center > 15-20 min)<br><br><b>CONTINUE resuscitation if ANY present:</b><br>• Penetrating chest trauma with signs of life in last 15 min<br>• Witnessed arrest with short downtime<br>• Hypothermia<br>• Organized rhythm at any point<br>• Pediatric patient"
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Same priorities:</b> Fix mechanical causes before ACLS drugs<br><br><b>Needle decompression:</b> Age-appropriate needle length (may need shorter in small children)<br><br><b>Fluid resuscitation:</b> 20 mL/kg NS bolus, may repeat x2<br><br><b>Epinephrine:</b> 0.01 mg/kg IV/IO<br><br><b>Common pediatric trauma causes:</b> MVC (unrestrained), pedestrian struck, NAT (non-accidental trauma), falls"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>\"Traumatic arrest is a surgical disease.\"</b> Field interventions are temporizing. Definitive care is in the OR.<br><br><b>Bilateral decompression:</b> Don't hesitate. Tension pneumothorax is the #1 reversible cause. Needle decompression has minimal downside in arrest.<br><br><b>CPR in trauma:</b> Less effective than in medical arrest. Chest compressions don't circulate blood if the tank is empty.<br><br><b>Load and go:</b> Limit scene time. Definitive hemorrhage control requires surgery.<br><br><b>Don't forget:</b> Pelvic binder for suspected pelvic fracture – major source of occult hemorrhage."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1210 Cardiac Arrest (Medical)" },
        { title: "TP-1244 Traumatic Injury" },
        { title: "MCG 1335 Needle Thoracostomy" },
        { title: "MCG 1370 Traumatic Hemorrhage Control" },
        { title: "MCG 1375 Vascular Access" },
        { title: "Ref. 506 Trauma Triage Decision Scheme" }
      ]
    }
  ]
};
