
import { Protocol } from '../../../types';

export const tp1215: Protocol = {
  id: "1215",
  refNo: "TP-1215",
  title: "Childbirth (Normal Delivery)",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jan 2026",
  icon: "child_friendly",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Childbirth (Normal Delivery)", subtitle: "Adult - Standing Order", icon: "child_friendly" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "BRTH", content: "Childbirth (Mother) - Active labor with imminent or completed delivery" },
        { title: "BABY", content: "Newborn - Use for infant; concurrent with BRTH for mother" },
        { title: "LABR", content: "Labor - Active labor without imminent delivery (use TP-1218)" }
      ]
    },
    {
      type: "warning",
      content: "<b>TWO PATIENTS:</b> Mother and newborn require simultaneous care. Call for additional resources early.<br><br><b>Imminent Delivery Signs:</b> Crowning, uncontrollable urge to push, perineal bulging, visible fetal parts, mother states \"The baby is coming!\"<br><br><b>DO NOT DELAY DELIVERY</b> for transport if delivery is imminent. Field delivery is safer than delivery in a moving ambulance."
    },
    {
      type: "section",
      title: "Stages of Labor"
    },
    {
      type: "accordion",
      title: "Understanding Labor Stages",
      items: [
        {
          title: "Stage 1: Cervical Dilation",
          content: "<b>Duration:</b> 6-12 hours (primipara), 2-6 hours (multipara)<br><br><b>Early/Latent:</b> 0-6 cm dilation, irregular contractions<br><b>Active:</b> 6-10 cm dilation, regular contractions q2-3 min<br><b>Transition:</b> 8-10 cm, intense contractions, urge to push<br><br><b>Field Assessment:</b> Contractions < 2 min apart with urge to push = prepare for delivery",
          icon: "schedule"
        },
        {
          title: "Stage 2: Delivery",
          content: "<b>Duration:</b> 20 min - 2 hours (primipara), 5-30 min (multipara)<br><br><b>Begins:</b> Full dilation (10 cm)<br><b>Ends:</b> Delivery of infant<br><br><b>Signs:</b> Crowning, perineal bulging, uncontrollable pushing, grunting with contractions",
          icon: "child_friendly"
        },
        {
          title: "Stage 3: Placenta Delivery",
          content: "<b>Duration:</b> 5-30 minutes after infant delivery<br><br><b>Signs of Separation:</b><br>- Gush of blood<br>- Cord lengthening<br>- Uterus rises and becomes globular<br>- Mother feels urge to push<br><br><b>DO NOT PULL on cord.</b> Allow spontaneous delivery with gentle maternal pushing.",
          icon: "water_drop"
        }
      ]
    },
    {
      type: "section",
      title: "Delivery Procedure"
    },
    {
      type: "accordion",
      title: "Step-by-Step Normal Delivery",
      items: [
        {
          title: "1. Preparation",
          content: "<b>Equipment:</b> OB kit, bulb syringe, clamps (x2), sterile scissors, warm towels, blankets<br><br><b>Position:</b> Semi-Fowler's with knees flexed and apart, or left lateral<br><br><b>Environment:</b> Warm environment (turn up heat), protect patient privacy<br><br><b>PPE:</b> Gloves, gown, eye protection (delivery is a splash event)",
          icon: "medical_services"
        },
        {
          title: "2. Control Delivery of Head",
          content: "<b>As Head Crowns:</b><br>- Apply gentle counter-pressure to fetal head with palm<br>- Support perineum with other hand using warm compress<br>- Coach mother: short breaths, gentle pushes<br>- Allow head to deliver slowly between contractions<br><br><b>Goal:</b> Controlled delivery to prevent perineal tearing and rapid skull compression changes",
          icon: "front_hand"
        },
        {
          title: "3. Check for Nuchal Cord",
          content: "<b>Immediately after head delivers:</b><br>- Feel around infant's neck for umbilical cord<br><br><b>Loose Cord:</b> Slip over head or deliver through loop<br><br><b>Tight Cord (cannot slip):</b><br>- Somersault maneuver preferred (keep head against perineum, deliver body through cord loop)<br>- Double clamp and cut ONLY if somersault fails<br>- Do not delay delivery for tight cord",
          icon: "check_circle"
        },
        {
          title: "4. Clear Airway (if needed)",
          content: "<b>Routine suctioning NOT required.</b><br><br><b>Suction ONLY if obstructed:</b><br>- Use bulb syringe<br>- Mouth first, then nose (\"M before N\")<br>- Gentle suction only<br><br><b>Meconium:</b> If present and baby non-vigorous, proceed to PPV. Intubate/suction only if airway obstructed.",
          icon: "air"
        },
        {
          title: "5. Deliver Shoulders and Body",
          content: "<b>External Rotation:</b> Head naturally rotates to face mother's thigh<br><br><b>Anterior Shoulder:</b> Guide head gently downward until anterior shoulder appears under pubic symphysis<br><br><b>Posterior Shoulder:</b> Guide head upward to deliver posterior shoulder<br><br><b>Body:</b> Support infant and guide out - delivery is rapid after shoulders<br><br><b>NOTE TIME OF DELIVERY</b>",
          icon: "baby_changing_station"
        },
        {
          title: "6. Immediate Newborn Care",
          content: "<b>Position:</b> At or below level of placenta until cord clamped<br><br><b>Dry:</b> Vigorously with warm towels, remove wet linens<br><br><b>Warm:</b> Skin-to-skin on mother's chest/abdomen, cover with blanket<br><br><b>Stimulate:</b> Rub back, flick soles if not crying<br><br><b>Assess:</b> Is baby breathing? Good tone? Pink?<br><br><b>If Not Vigorous:</b> Proceed to TP-1216 Newborn Resuscitation",
          icon: "child_care"
        }
      ]
    },
    {
      type: "section",
      title: "Cord Clamping and Placenta"
    },
    {
      type: "accordion",
      title: "Cord Management",
      items: [
        {
          title: "Delayed Cord Clamping",
          content: "<b>Standard Practice:</b> Wait at least 30-60 seconds before clamping<br><br><b>Benefits:</b> Improved iron stores, better transitional circulation, higher blood volume<br><br><b>Technique:</b><br>- Clamp cord 6-8 inches from infant abdomen<br>- Place second clamp 2-3 inches beyond first<br>- Cut between clamps with sterile scissors<br>- Check for bleeding from cord stump<br><br><b>Exception:</b> Clamp immediately if infant requires resuscitation away from mother",
          icon: "content_cut"
        },
        {
          title: "Placenta Delivery",
          content: "<b>Timing:</b> Usually delivers 5-30 minutes after infant<br><br><b>Signs of Separation:</b><br>- Gush of blood from vagina<br>- Cord lengthening at introitus<br>- Uterus becomes firm and globular<br><br><b>Management:</b><br>- DO NOT pull on cord (risk of uterine inversion/hemorrhage)<br>- Allow mother to push when she feels urge<br>- Gentle controlled cord traction only AFTER separation signs<br>- Support uterus with hand above pubic bone<br><br><b>Transport with undelivered placenta</b> if > 30 min or bleeding excessive",
          icon: "spa"
        },
        {
          title: "Placenta Inspection",
          content: "<b>Check:</b> Place in bag/container and bring to hospital<br><br><b>Completeness:</b> Should appear intact with smooth membranes<br><br><b>Concern:</b> Ragged edges or missing cotyledons suggest retained fragments (increased hemorrhage risk)<br><br><b>Document:</b> Time of delivery, appearance, completeness",
          icon: "visibility"
        }
      ]
    },
    {
      type: "section",
      title: "Post-Delivery Care"
    },
    {
      type: "accordion",
      title: "Mother Care",
      items: [
        {
          title: "Fundal Assessment and Massage",
          content: "<b>Locate Fundus:</b> Should be firm, at or below umbilicus<br><br><b>Boggy (Soft) Uterus:</b><br>- Perform vigorous fundal massage<br>- Cup hand around fundus, massage firmly<br>- Continue until firm<br>- Empty bladder if distended<br><br><b>Goal:</b> Firm, contracted uterus controls bleeding",
          icon: "touch_app"
        },
        {
          title: "Hemorrhage Management",
          content: "<b>Normal Blood Loss:</b> Up to 500 mL vaginal delivery<br><br><b>Postpartum Hemorrhage (> 500 mL or signs of shock):</b><br>- Continuous fundal massage<br>- NS 1L IV bolus<br>- TXA 1 g IV over 10 min (if < 3 hours from delivery)<br>- External uterine compression<br>- Encourage breastfeeding (releases oxytocin)<br>- Emergent transport<br><br><b>CONTACT BASE</b> for all postpartum hemorrhage",
          icon: "water_drop"
        }
      ]
    },
    {
      type: "section",
      title: "Delivery Complications"
    },
    {
      type: "accordion",
      title: "Shoulder Dystocia",
      items: [
        {
          title: "Recognition",
          content: "<b>\"Turtle Sign\":</b> Head delivers but retracts tightly against perineum<br><br><b>Cause:</b> Anterior shoulder trapped behind pubic symphysis<br><br><b>TIME CRITICAL:</b> Fetal hypoxia begins immediately. 4-5 minutes until permanent injury.<br><br><b>Call for help immediately.</b>",
          icon: "warning"
        },
        {
          title: "McRoberts Maneuver (First Line)",
          content: "<b>Positioning:</b><br>1. Flatten bed completely<br>2. Remove all pillows<br>3. <b>Hyperflex hips</b> - bring knees sharply up toward mother's shoulders<br>4. Thighs pressed tightly against abdomen<br>5. Legs abducted (spread apart)<br><br><b>Effect:</b> Flattens lumbar spine, rotates pelvis, increases AP diameter<br><br><b>Success Rate:</b> Resolves 40-50% of shoulder dystocia alone",
          icon: "accessibility_new"
        },
        {
          title: "Suprapubic Pressure",
          content: "<b>Technique:</b><br>- Apply with heel of hand<br>- Location: Just ABOVE pubic bone<br>- Direction: DOWNWARD and toward mother's back<br>- Continuous or rocking pressure<br><br><b>Effect:</b> Compresses and dislodges anterior shoulder<br><br><b>NEVER apply fundal pressure</b> - increases impaction and uterine rupture risk",
          icon: "pan_tool"
        },
        {
          title: "Additional Maneuvers",
          content: "<b>If McRoberts + Suprapubic Fail:</b><br><br><b>Rubin II:</b> Insert hand, push anterior shoulder toward fetal chest (adduct)<br><br><b>Woods Screw:</b> Rotate posterior shoulder 180 degrees<br><br><b>Posterior Arm Delivery:</b> Sweep posterior arm across chest and out<br><br><b>Gaskin Maneuver:</b> Roll mother to all-fours position<br><br><b>CONTACT BASE for all shoulder dystocia</b>",
          icon: "emergency"
        }
      ]
    },
    {
      type: "accordion",
      title: "Other Complications",
      items: [
        {
          title: "Breech Presentation",
          content: "<b>Field Delivery Only If:</b> Buttocks delivering, no time for transport<br><br><b>Technique:</b><br>- Support body as it delivers (do NOT pull)<br>- Keep back anterior (facing up)<br>- Allow delivery to umbilicus, then legs<br>- Support body on forearm, flex head with fingers on maxilla<br>- Gentle downward traction for head delivery<br><br><b>Head Entrapment:</b> Flex head forward, suprapubic pressure. DO NOT pull on body.",
          icon: "warning"
        },
        {
          title: "Prolapsed Cord",
          content: "<b>Life-Threatening Emergency</b><br><br>1. Knee-chest position or steep Trendelenburg<br>2. Insert gloved hand into vagina<br>3. Elevate presenting part OFF cord<br>4. Keep cord warm and moist<br>5. DO NOT replace cord or release pressure<br>6. Emergent transport to cesarean-capable facility<br><br><b>Maintain manual elevation until surgical delivery</b>",
          icon: "emergency"
        }
      ]
    },
    {
      type: "info",
      title: "APGAR Score",
      content: "<b>Assess at 1 and 5 minutes:</b><br><br><b>A</b>ppearance: Blue/pale=0, Acrocyanosis=1, Pink=2<br><b>P</b>ulse: Absent=0, <100=1, >100=2<br><b>G</b>rimace: None=0, Grimace=1, Cry=2<br><b>A</b>ctivity: Limp=0, Some flexion=1, Active=2<br><b>R</b>espiration: Absent=0, Weak=1, Strong cry=2<br><br><b>7-10:</b> Normal | <b>4-6:</b> Moderate depression | <b>0-3:</b> Severe depression"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Multipara deliver fast:</b> History of rapid deliveries = prepare for field delivery.<br><br><b>\"The baby is coming!\"</b> - Believe her. Examine immediately.<br><br><b>Controlled delivery prevents tears:</b> Slow, guided delivery of head reduces perineal trauma.<br><br><b>Skin-to-skin saves lives:</b> Best warming method. Promotes bonding and breastfeeding.<br><br><b>Vigorous drying = stimulation:</b> Rubbing with towel stimulates breathing while drying.<br><br><b>Most babies just need warmth and drying.</b> Reserve interventions for those who need them."
    },
    {
      type: "facility-finder",
      title: "Nearest Perinatal / Pediatric Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1216 Newborn Resuscitation" },
        { title: "TP-1217 Pregnancy Complication" },
        { title: "TP-1218 Pregnancy/Labor" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "Ref. 1309 Color Code Drug Doses" }
      ]
    }
  ]
};
