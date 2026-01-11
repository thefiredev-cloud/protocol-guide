
import { Protocol } from '../../../types';

export const mcg1370: Protocol = {
  id: "MCG-1370",
  refNo: "MCG 1370",
  title: "Traumatic Hemorrhage Control",
  category: "Trauma",
  type: "Medical Control Guideline",
  lastUpdated: "Oct 1, 2025",
  icon: "bloodtype",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Traumatic Hemorrhage Control", subtitle: "MCG 1370 - Medical Control Guideline", icon: "bloodtype" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hemorrhagic Shock", content: "Circulatory failure due to acute blood loss." },
        { title: "Traumatic Hemorrhage", content: "Active bleeding from blunt or penetrating trauma mechanism." },
        { title: "Exsanguinating Hemorrhage", content: "Life-threatening bleeding requiring immediate intervention." }
      ]
    },
    {
      type: "warning",
      content: "<b>BLEEDING KILLS:</b> Hemorrhage is the leading cause of preventable death in trauma. Control bleeding FIRST, before any other intervention.<br><br><b>Do not delay hemorrhage control</b> for airway management, IV access, or transport. A dead patient does not need an airway."
    },
    {
      type: "section",
      title: "Hemorrhage Classification"
    },
    {
      type: "accordion",
      title: "Classes of Hemorrhage",
      items: [
        {
          title: "Class I (< 15% blood volume)",
          content: "<b>Blood Loss:</b> Up to 750 mL<br><br><b>Signs:</b><br>- Heart rate: Normal to mild tachycardia<br>- Blood pressure: Normal<br>- Mental status: Normal, slightly anxious<br>- Skin: Normal color<br><br><b>Treatment:</b> Control bleeding, monitor",
          icon: "water_drop"
        },
        {
          title: "Class II (15-30% blood volume)",
          content: "<b>Blood Loss:</b> 750-1500 mL<br><br><b>Signs:</b><br>- Heart rate: 100-120<br>- Blood pressure: Normal (narrowed pulse pressure)<br>- Mental status: Anxious, mildly confused<br>- Skin: Pale, delayed cap refill<br><br><b>Treatment:</b> Hemorrhage control, IV access, consider fluids",
          icon: "water_drop"
        },
        {
          title: "Class III (30-40% blood volume)",
          content: "<b>Blood Loss:</b> 1500-2000 mL<br><br><b>Signs:</b><br>- Heart rate: 120-140 (thready pulse)<br>- Blood pressure: Hypotensive (SBP < 90)<br>- Mental status: Confused, lethargic<br>- Skin: Pale, cool, diaphoretic<br><br><b>Treatment:</b> Aggressive hemorrhage control, TXA, fluid resuscitation, emergent transport",
          icon: "water_drop"
        },
        {
          title: "Class IV (> 40% blood volume)",
          content: "<b>Blood Loss:</b> > 2000 mL<br><br><b>Signs:</b><br>- Heart rate: > 140 (or bradycardic/agonal)<br>- Blood pressure: Severely hypotensive or undetectable<br>- Mental status: Obtunded, unconscious<br>- Skin: Ashen, cyanotic, cold<br><br><b>Treatment:</b> Immediate hemorrhage control, all resuscitative measures, emergent surgical intervention required",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "Tourniquet Application"
    },
    {
      type: "warning",
      content: "<b>TOURNIQUET SAVES LIVES.</b> Apply tourniquet for any life-threatening extremity hemorrhage. Do NOT delay. Do NOT use direct pressure first if bleeding is severe. The tourniquet IS the first treatment."
    },
    {
      type: "accordion",
      title: "Tourniquet Procedure",
      items: [
        {
          title: "Indications",
          content: "- Life-threatening extremity hemorrhage<br>- Traumatic amputation<br>- Bleeding not controlled by direct pressure<br>- Multiple casualties (apply before assessment)<br>- Tactical situations (care under fire)<br>- Arterial bleeding from extremity<br><br><b>If in doubt, apply the tourniquet.</b>",
          icon: "medical_services"
        },
        {
          title: "Placement",
          content: "<b>HIGH AND TIGHT:</b><br>- Apply 2-3 inches proximal to wound<br>- Ideally above elbow or knee (single bone = more effective)<br>- Over bare skin preferred (clothing acceptable if emergent)<br>- Never over a joint<br><br><b>Do NOT apply:</b><br>- Over groin or axilla<br>- Over neck",
          icon: "accessibility"
        },
        {
          title: "Application Technique",
          content: "<b>CAT/SOFT-T/SOF-TT:</b><br>1. Route band through buckle and around limb<br>2. Pull band tight, secure Velcro<br>3. Twist windlass until bleeding STOPS<br>4. Secure windlass in clip/holder<br>5. Secure loose ends of band<br>6. Mark time of application on tourniquet<br><br><b>Bleeding must STOP.</b> Distal pulse should be absent.",
          icon: "medical_services"
        },
        {
          title: "Troubleshooting",
          content: "<b>If bleeding continues:</b><br>- Tighten the tourniquet more<br>- Apply second tourniquet 2-3 inches above first (side-by-side)<br>- Reassess placement and technique<br><br><b>Pain is expected.</b> Proper application is very painful. This is normal and indicates effectiveness.<br><br><b>Never loosen or remove</b> a tourniquet in the field once applied.",
          icon: "build"
        }
      ]
    },
    {
      type: "section",
      title: "Wound Packing"
    },
    {
      type: "accordion",
      title: "Hemostatic Gauze Application",
      items: [
        {
          title: "Indications",
          content: "- Junctional hemorrhage (groin, axilla, neck base)<br>- Wounds not amenable to tourniquet<br>- Deep wounds to torso, buttocks, shoulder<br>- Scalp lacerations<br><br><b>Products:</b> QuikClot Combat Gauze, Celox, ChitoGauze",
          icon: "healing"
        },
        {
          title: "Packing Technique",
          content: "<b>Pack the wound, not cover it:</b><br><br>1. Expose the wound completely<br>2. Identify bleeding source<br>3. Begin packing hemostatic gauze DEEP into wound<br>4. Pack tightly - gauze must contact bleeding vessel<br>5. Continue packing until wound is completely filled<br>6. Maintain FIRM direct pressure for minimum 3 minutes<br>7. Apply pressure dressing over packed wound<br><br><b>One hand in wound, one hand feeding gauze.</b>",
          icon: "medical_services"
        },
        {
          title: "Common Errors",
          content: "<b>Avoid these mistakes:</b><br>- Covering wound without packing<br>- Superficial packing (gauze not reaching bleeding source)<br>- Inadequate pressure time (< 3 minutes)<br>- Releasing pressure to check (must wait full 3 minutes)<br>- Using multiple gauze packets haphazardly<br><br><b>One roll, packed tight, held with pressure.</b>",
          icon: "warning"
        }
      ]
    },
    {
      type: "section",
      title: "Tranexamic Acid (TXA)"
    },
    {
      type: "warning",
      content: "<b>TIME CRITICAL:</b> TXA must be administered within 3 HOURS of injury to be effective. After 3 hours, TXA may INCREASE mortality. Document time of injury."
    },
    {
      type: "accordion",
      title: "TXA Protocol",
      items: [
        {
          title: "Indications",
          content: "<b>Administer TXA if:</b><br>- Signs of hemorrhagic shock (SBP < 90, weak radial pulse, AMS)<br>- Anticipated significant hemorrhage<br>- Active bleeding from major trauma<br>- Time since injury < 3 hours<br><br><b>Do NOT give if:</b><br>- > 3 hours since injury<br>- Isolated head injury without hemorrhage<br>- Known allergy to TXA",
          icon: "medication"
        },
        {
          title: "Dosing",
          content: "<b>Adult Dose:</b><br>- 1 gram TXA in 100mL NS<br>- Infuse IV/IO over 10 minutes<br>- Single dose only (no repeat dosing in prehospital)<br><br><b>Pediatric Dose:</b><br>- 15 mg/kg (max 1g) in 100mL NS<br>- Infuse over 10 minutes",
          icon: "medication"
        },
        {
          title: "Mechanism of Action",
          content: "<b>Antifibrinolytic agent:</b><br>- Blocks breakdown of blood clots<br>- Helps maintain hemostasis<br>- Works systemically (helps clots anywhere in body)<br>- Does NOT create new clots<br><br><b>Evidence:</b> CRASH-2 trial showed 1.5% absolute mortality reduction when given < 3 hours",
          icon: "science"
        },
        {
          title: "Administration Tips",
          content: "- May dilute in 100mL bag or use pre-mixed<br>- Run as piggyback (do not mix with other meds)<br>- Can give IO if IV unavailable<br>- Rapid push NOT recommended (may cause hypotension)<br>- Document time of injury and time of administration<br>- If unsure of injury time but likely < 3 hours, give it",
          icon: "tips_and_updates"
        }
      ]
    },
    {
      type: "section",
      title: "Additional Hemorrhage Interventions"
    },
    {
      type: "accordion",
      title: "Pressure Dressings and Splinting",
      items: [
        {
          title: "Pressure Dressing",
          content: "- Apply over packed wounds<br>- Israeli bandage or ACE wrap<br>- Must be TIGHT<br>- Elastic maintains pressure during transport<br>- Reassess for bleeding through<br>- Do not stack dressings - remove and repack if bleeding through",
          icon: "healing"
        },
        {
          title: "Splinting for Hemorrhage",
          content: "- Splint fractures to reduce bleeding<br>- Fractured femur can lose 1.5L into thigh<br>- Traction splint for femur fractures<br>- Pelvic binder for pelvic fractures<br>- Reduces movement = reduces bleeding",
          icon: "accessibility"
        },
        {
          title: "Pelvic Binder",
          content: "<b>Indications:</b><br>- Suspected pelvic fracture<br>- Mechanism concerning for pelvic injury<br>- Hypotension with no external bleeding source<br><br><b>Application:</b><br>- Commercial binder or sheet<br>- Place at level of greater trochanters<br>- Pull snug until pelvis is stable<br>- Do not over-tighten<br>- Monitor distal circulation",
          icon: "accessibility"
        }
      ]
    },
    {
      type: "accordion",
      title: "Junctional Tourniquets",
      items: [
        {
          title: "SAM Junctional Tourniquet",
          content: "- For inguinal (groin) hemorrhage<br>- Place belt around pelvis<br>- Position target compression device over wound<br>- Inflate bladder until bleeding stops<br>- Can be used bilaterally<br>- Also provides pelvic stabilization",
          icon: "medical_services"
        },
        {
          title: "Abdominal Aortic Tourniquet (AAJT)",
          content: "- For severe abdominal/pelvic hemorrhage<br>- Compresses abdominal aorta<br>- Last resort device<br>- Time-limited application<br>- Requires training and authorization",
          icon: "medical_services"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Tourniquet:</b><br>- Standard tourniquet may be too large for infants<br>- Blood pressure cuff can serve as improvised tourniquet<br>- Apply same principles: high, tight, until bleeding stops<br><br><b>TXA:</b><br>- 15 mg/kg (max 1g)<br>- Same 3-hour window applies<br><br><b>Hemorrhage sensitivity:</b><br>- Children have smaller blood volume<br>- Hemorrhage causes decompensation faster<br>- Tachycardia is early sign (hypotension is late)<br><br><b>Normal blood volumes:</b><br>- Infant: 80 mL/kg<br>- Child: 75-80 mL/kg<br>- Adult: 70 mL/kg"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Apply tourniquets early.</b> Military data: tourniquet in first hour = 90% survival. After 2 hours = 20% survival. Every second counts.<br><br><b>Pain means it is working.</b> A properly applied tourniquet is extremely painful. If the patient is not complaining, the tourniquet may not be tight enough.<br><br><b>Pack TO the source.</b> Wound packing fails when gauze sits on top of the wound. The hemostatic agent must contact the bleeding vessel deep in the wound.<br><br><b>TXA is time-sensitive.</b> After 3 hours, TXA increases mortality. If you cannot determine time of injury and it might be > 3 hours, do not give it.<br><br><b>Pressure is not optional.</b> After wound packing, you must hold firm pressure for 3 minutes minimum. The timer starts when pressure is applied, not when gauze is in.<br><br><b>Tourniquets can stay on.</b> Modern tourniquets can remain in place for hours without limb loss. Saving the life matters more than saving the limb."
    },
    {
      type: "accordion",
      title: "Documentation Requirements",
      items: [
        {
          title: "Required Documentation",
          content: "- Time of injury (critical for TXA)<br>- Site and severity of hemorrhage<br>- Estimated blood loss (if possible)<br>- Tourniquet: Time applied, location, distal pulse status<br>- Wound packing: Product used, pressure time<br>- TXA: Time administered, dose, infusion duration<br>- Response to interventions<br>- Serial vital signs"
        }
      ]
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1244 Traumatic Injury (Multisystem)" },
        { title: "TP-1243 Traumatic Arrest" },
        { title: "TP-1245 Crush Injury/Syndrome" },
        { title: "MCG 1335 Needle Thoracostomy" },
        { title: "Ref 506 Trauma Triage Criteria" },
        { title: "Pain Management Protocol" }
      ]
    }
  ]
};
