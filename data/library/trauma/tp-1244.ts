
import { Protocol } from '../../../types';

export const tp1244: Protocol = {
  id: "1244",
  refNo: "TP-1244",
  title: "Traumatic Injury (Multisystem)",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Oct 1, 2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Injury (Multisystem)", subtitle: "TP-1244 - Adult Standing Order", icon: "personal_injury" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Injury (TRMA)", content: "Multisystem blunt or penetrating trauma involving multiple body regions." },
        { title: "Major Trauma", content: "Significant mechanism with physiologic compromise or anatomic injury criteria." },
        { title: "Polytrauma", content: "Two or more major body regions injured simultaneously." }
      ]
    },
    {
      type: "warning",
      content: "<b>TIME IS CRITICAL:</b> Trauma patients die from hemorrhage, hypoxia, and herniation. Scene time goal is < 10 minutes for unstable patients. Load and go. Interventions en route.<br><br><b>Trauma Center destination:</b> All major trauma patients require transport to an appropriate Trauma Center per Ref 506."
    },
    {
      type: "section",
      title: "Trauma Triage Criteria"
    },
    {
      type: "accordion",
      title: "Step 1: Physiologic Criteria (Highest Priority)",
      items: [
        {
          title: "Vital Signs",
          content: "<b>Transport to Trauma Center if ANY present:</b><br><br>- GCS < 14<br>- SBP < 90 mmHg<br>- Respiratory rate < 10 or > 29<br>- Need for ventilatory support<br><br><b>Action:</b> Immediate transport to highest level Trauma Center",
          icon: "monitor_heart"
        },
        {
          title: "Assessment Findings",
          content: "- Unresponsive or altered mental status<br>- Signs of shock (pallor, diaphoresis, delayed cap refill)<br>- Respiratory distress or failure<br>- Weak or absent radial pulse",
          icon: "assessment"
        }
      ]
    },
    {
      type: "accordion",
      title: "Step 2: Anatomic Criteria",
      items: [
        {
          title: "Head and Neck",
          content: "- Penetrating injury to head, neck, or torso<br>- Flail chest<br>- Two or more proximal long bone fractures<br>- Crushed, degloved, or mangled extremity<br>- Amputation proximal to wrist or ankle",
          icon: "personal_injury"
        },
        {
          title: "Torso and Pelvis",
          content: "- Pelvic fracture with instability<br>- Open or depressed skull fracture<br>- Paralysis or suspected spinal cord injury<br>- Chest wall instability or deformity",
          icon: "accessibility"
        }
      ]
    },
    {
      type: "accordion",
      title: "Step 3: Mechanism of Injury",
      items: [
        {
          title: "Vehicle Crashes",
          content: "- Intrusion > 12 inches occupant site or > 18 inches any site<br>- Ejection (partial or complete)<br>- Death of same vehicle occupant<br>- Vehicle telemetry data consistent with high risk<br>- Auto vs. pedestrian/bicyclist thrown, run over, or significant impact (> 20 mph)",
          icon: "directions_car"
        },
        {
          title: "Falls and Other",
          content: "- Falls > 20 feet (adults), > 10 feet or 2-3x height (children)<br>- Motorcycle crash > 20 mph<br>- Low-level falls in anticoagulated patients",
          icon: "trending_down"
        }
      ]
    },
    {
      type: "section",
      title: "MARCH Assessment Algorithm"
    },
    {
      type: "warning",
      content: "<b>MARCH saves lives.</b> Address threats in order. Do NOT move to next step until prior life threat is controlled."
    },
    {
      type: "accordion",
      title: "M - Massive Hemorrhage",
      items: [
        {
          title: "Extremity Hemorrhage",
          content: "<b>TOURNIQUET:</b> Apply tourniquet HIGH AND TIGHT for life-threatening extremity bleeding.<br><br>- Place 2-3 inches proximal to wound (above elbow/knee when possible)<br>- Tighten until bleeding STOPS and distal pulse is absent<br>- Note time of application<br>- Second tourniquet side-by-side if bleeding continues<br><br><b>DO NOT remove or loosen</b> once applied in the field.",
          icon: "medical_services"
        },
        {
          title: "Junctional Hemorrhage",
          content: "<b>Wounds in groin, axilla, neck:</b><br><br>- Direct pressure with hemostatic gauze (QuikClot, Celox)<br>- Pack wound TIGHTLY - gauze must reach bleeding source<br>- Apply direct pressure for minimum 3 minutes<br>- Junctional tourniquet (SAM-JT, JETT) if available<br><br><b>Neck wounds:</b> Pressure WITHOUT occluding airway or opposite carotid",
          icon: "medical_services"
        },
        {
          title: "Truncal/Abdominal Hemorrhage",
          content: "- NOT compressible externally<br>- Rapid transport to surgical intervention<br>- TXA administration per MCG 1370<br>- Permissive hypotension (target SBP 80-90)",
          icon: "emergency"
        }
      ]
    },
    {
      type: "accordion",
      title: "A - Airway",
      items: [
        {
          title: "Airway Assessment",
          content: "<b>Evaluate:</b> Speaking? Stridor? Obstruction? Blood/secretions?<br><br><b>Immediate actions:</b><br>- Suction blood/vomitus<br>- Jaw thrust (maintain C-spine)<br>- OPA/NPA if tolerated<br>- Position of comfort if conscious",
          icon: "air"
        },
        {
          title: "C-Spine Precautions",
          content: "<b>Apply C-spine precautions if:</b><br>- GCS < 15<br>- Midline cervical tenderness<br>- Focal neurologic deficit<br>- High-risk mechanism<br>- Distracting injury<br>- Intoxication<br><br><b>Neutral in-line stabilization</b> during all airway maneuvers",
          icon: "accessibility"
        },
        {
          title: "Advanced Airway",
          content: "- Consider intubation if GCS < 8 or unable to protect airway<br>- Supraglottic airway (iGel/King) preferred in cardiac arrest<br>- BVM with OPA/NPA often sufficient<br>- Avoid hyperventilation (target ETCO2 35-45)",
          icon: "pulmonology"
        }
      ]
    },
    {
      type: "accordion",
      title: "R - Respiration",
      items: [
        {
          title: "Assessment",
          content: "<b>Expose and examine chest:</b><br>- Equal chest rise?<br>- Breath sounds bilateral?<br>- Tracheal deviation?<br>- JVD (may be absent if hypovolemic)?<br>- Open wounds/sucking chest wound?<br>- Crepitus or flail segments?",
          icon: "pulmonology"
        },
        {
          title: "Open Chest Wound",
          content: "<b>Apply occlusive dressing (Chest Seal):</b><br>- Vented chest seal preferred<br>- If improvised, tape on 3 sides (flutter valve)<br>- Monitor for tension pneumothorax<br>- If deterioration, burp seal or decompress",
          icon: "healing"
        },
        {
          title: "Tension Pneumothorax",
          content: "<b>Clinical signs:</b><br>- Severe respiratory distress<br>- Absent breath sounds unilaterally<br>- Hypotension and tachycardia<br>- Tracheal deviation (late sign)<br>- JVD (may be absent)<br><br><b>Treatment:</b> Needle thoracostomy per MCG 1335<br>- 2nd ICS mid-clavicular OR<br>- 5th ICS anterior axillary line<br>- 14g catheter, 3.25 inch minimum",
          icon: "air"
        }
      ]
    },
    {
      type: "accordion",
      title: "C - Circulation",
      items: [
        {
          title: "IV/IO Access",
          content: "<b>Establish vascular access:</b><br>- Large bore IV (16-18g) preferred<br>- IO if IV unsuccessful or delayed<br>- Two lines for significant hemorrhage<br>- Blood draw for type and screen if available",
          icon: "water_drop"
        },
        {
          title: "Fluid Resuscitation",
          content: "<b>Crystalloid administration:</b><br><br><b>Hemorrhagic Shock:</b><br>- 500mL NS bolus, reassess<br>- Target: Presence of radial pulse (SBP ~80-90)<br>- Avoid aggressive fluids (dilutes clotting factors)<br><br><b>Permissive Hypotension:</b><br>- Acceptable SBP 80-90 for penetrating torso trauma<br>- Normal BP targets for TBI (SBP > 90, ideally > 110)",
          icon: "water_drop"
        },
        {
          title: "TXA Administration",
          content: "<b>Tranexamic Acid 1g IV:</b><br>- Mix 1g in 100mL NS<br>- Infuse over 10 minutes<br>- Must be within 3 hours of injury<br>- Indicated: Hemorrhagic shock or anticipated significant hemorrhage<br><br><b>See MCG 1370 for complete TXA protocol</b>",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "H - Hypothermia Prevention",
      items: [
        {
          title: "Lethal Triad",
          content: "<b>Hypothermia, Acidosis, Coagulopathy</b><br><br>These three conditions create a deadly cycle:<br>- Cold blood does not clot properly<br>- Acidosis worsens coagulopathy<br>- Bleeding causes more acidosis and hypothermia<br><br><b>Prevention is critical</b> - rewarming in field is difficult",
          icon: "thermostat"
        },
        {
          title: "Warming Interventions",
          content: "- Remove wet clothing<br>- Cover patient (blankets, Mylar, ready heat)<br>- Warm ambulance compartment<br>- Warm IV fluids if available<br>- Limit exposure during assessment<br>- Hot packs to axilla and groin (protect skin)",
          icon: "thermostat"
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Physiologic differences:</b><br>- Children compensate longer then crash suddenly<br>- Hypotension is a LATE sign of shock<br>- Tachycardia is an early/sensitive indicator<br><br><b>Modified vital signs:</b><br>- SBP < 70 + (2 x age) is hypotensive<br>- Heart rate: Tachycardia > 160 (infant), > 120 (child)<br><br><b>Equipment:</b><br>- Use Broselow tape for sizing<br>- Pediatric tourniquet if available<br>- Smaller IV catheters (22-24g)<br><br><b>See TP-1244-P for complete pediatric protocol</b>"
    },
    {
      type: "info",
      title: "Geriatric Considerations",
      content: "<b>Higher risk, atypical presentations:</b><br>- Baseline vital signs may be abnormal<br>- Medications mask tachycardia (beta-blockers)<br>- Anticoagulation increases bleeding risk<br>- Lower threshold for Trauma Center<br><br><b>Age-related considerations:</b><br>- Frail patients: Lower mechanism can cause major injury<br>- Ground-level falls may meet trauma criteria<br>- Consider underlying medical cause for mechanism"
    },
    {
      type: "info",
      title: "Pregnant Patients",
      content: "<b>Two patients:</b><br>- Saving the mother saves the baby<br>- Position in left lateral decubitus (uterus off IVC)<br>- Aggressive resuscitation of mother<br>- Higher blood volume = more blood loss before shock<br>- Lower threshold for Trauma Center transport<br><br><b>Gestational age > 20 weeks:</b> Manual left uterine displacement"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Scene time kills.</b> The best treatment for hemorrhagic shock is the operating room. Every minute on scene is blood lost.<br><br><b>Assess trending, not snapshots.</b> A patient with SBP 95 trending down is sicker than SBP 85 stable. Serial vitals matter.<br><br><b>Trust your gut.</b> If the mechanism looks bad, treat it as bad. Field triage undertriages 30% of major trauma.<br><br><b>Tourniquets work.</b> Military data shows tourniquet application in first hour = 90% survival. After 2 hours = 20% survival. Apply early, apply correctly.<br><br><b>Crystalloid is not blood.</b> NS does not carry oxygen or clot. It dilutes what little clotting factors remain. Give enough to maintain mentation and radial pulse, then stop."
    },
    {
      type: "accordion",
      title: "Documentation Requirements",
      items: [
        {
          title: "Required Documentation",
          content: "- Time of injury (if known)<br>- Mechanism of injury with details<br>- Initial and serial vital signs<br>- GCS components (E, V, M)<br>- All interventions with times<br>- Tourniquet application time<br>- TXA administration time<br>- Trauma activation criteria met<br>- Receiving facility and transport mode"
        }
      ]
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "MCG 1370 Traumatic Hemorrhage Control" },
        { title: "MCG 1335 Needle Thoracostomy" },
        { title: "TP-1244-P Pediatric Traumatic Injury" },
        { title: "TP-1243 Traumatic Arrest" },
        { title: "TP-1245 Crush Injury/Syndrome" },
        { title: "TP-1251 Burns" },
        { title: "Ref 506 Trauma Triage Criteria" },
        { title: "Ref 506-A LA Drop Criteria" }
      ]
    }
  ]
};
