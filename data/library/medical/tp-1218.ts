
import { Protocol } from '../../../types';

export const tp1218: Protocol = {
  id: "1218",
  refNo: "TP-1218",
  title: "Pregnancy / Labor",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Jan 2026",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy / Labor", subtitle: "Adult - Standing Order", icon: "pregnant_woman" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "LABR", content: "Labor - Active labor without imminent delivery; patient in labor process" },
        { title: "PREG", content: "Pregnancy Problem - Non-labor pregnancy complaint (use TP-1217 for complications)" },
        { title: "BRTH", content: "Childbirth - Use when delivery is imminent or occurring (TP-1215)" }
      ]
    },
    {
      type: "warning",
      content: "<b>KEY DECISION:</b> Transport or deliver on scene?<br><br><b>TRANSPORT</b> if: First pregnancy, early labor, no urge to push, cervix not visible, hospital < 10 min<br><br><b>PREPARE FOR FIELD DELIVERY</b> if: Crowning, uncontrollable pushing, multipara with rapid labor history, contractions < 2 min apart with urge to push<br><br><b>Left Lateral Position:</b> After 20 weeks, avoid supine position. Transport on LEFT side."
    },
    {
      type: "section",
      title: "Labor Assessment"
    },
    {
      type: "accordion",
      title: "Rapid Labor Evaluation",
      items: [
        {
          title: "Essential History",
          content: "<b>G/P Status:</b><br>- Gravida (G) = Total pregnancies<br>- Para (P) = Deliveries past 20 weeks<br>- Example: G3P2 = 3rd pregnancy, 2 prior deliveries<br><br><b>Key Questions:</b><br>- Due date / gestational age?<br>- Contraction timing (start, frequency, duration)?<br>- Water broken? Color of fluid?<br>- Urge to push? Bloody show?<br>- Prior delivery times? (Multipara may deliver rapidly)<br>- High-risk factors? (See below)",
          icon: "history"
        },
        {
          title: "Contraction Assessment",
          content: "<b>Timing Contractions:</b><br>- Frequency: Start of one to start of next<br>- Duration: Beginning to end of single contraction<br>- Intensity: Mild, moderate, strong<br><br><b>Early Labor:</b> Contractions 5-20 min apart, 30-45 sec duration, mild intensity<br><br><b>Active Labor:</b> Contractions 3-5 min apart, 45-60 sec duration, moderate-strong<br><br><b>Transition/Imminent:</b> Contractions < 2 min apart, 60-90 sec duration, very strong, urge to push",
          icon: "timer"
        },
        {
          title: "Physical Examination",
          content: "<b>Visual Inspection:</b><br>- Is anything visible at vaginal opening? (Crowning = imminent)<br>- Bloody show (mucus plug) = labor progressing<br>- Clear fluid = ruptured membranes<br>- Meconium-stained fluid = fetal distress concern<br>- Cord visible = EMERGENCY (prolapsed cord)<br><br><b>DO NOT perform digital vaginal exam in the field</b><br>- Risk of infection, hemorrhage (placenta previa), and cord prolapse<br>- Visual inspection is sufficient for transport decisions",
          icon: "visibility"
        }
      ]
    },
    {
      type: "section",
      title: "Transport vs Field Delivery"
    },
    {
      type: "accordion",
      title: "Decision Algorithm",
      items: [
        {
          title: "TRANSPORT to Hospital",
          content: "<b>Transport if ANY of these apply:</b><br><br>- First pregnancy (primipara) - typically longer labor<br>- Contractions > 5 minutes apart<br>- No urge to push<br>- No crowning or perineal bulging<br>- Water intact<br>- Hospital arrival time < 10 minutes<br>- Any high-risk factors present<br><br><b>Position:</b> Left lateral recumbent<br><b>Oxygen:</b> If maternal SpO2 < 94% or fetal distress suspected<br><b>IV:</b> NS TKO for access",
          icon: "local_hospital"
        },
        {
          title: "PREPARE FOR FIELD DELIVERY",
          content: "<b>Prepare for delivery if ANY of these apply:</b><br><br>- Crowning visible<br>- Uncontrollable urge to push despite coaching<br>- Perineum bulging<br>- Mother states \"baby is coming\"<br>- Multipara with history of rapid delivery<br>- Contractions < 2 min apart with pushing<br>- Delivery appears faster than transport time<br><br><b>Action:</b> Stop transport, prepare OB kit, call for backup<br><b>Reference:</b> TP-1215 Childbirth (Normal Delivery)",
          icon: "child_friendly"
        },
        {
          title: "Multipara Considerations",
          content: "<b>Multipara (Previous Deliveries) = Higher Risk of Rapid Delivery</b><br><br><b>Ask:</b> How long were your previous labors?<br><br><b>Precipitous Labor History:</b><br>- Prior delivery < 3 hours = prepare for field delivery<br>- Prior delivery < 1 hour = very high risk<br><br><b>The more deliveries, the faster labor tends to progress.</b><br><br><b>Grand Multipara (5+ deliveries):</b> Also increased risk of postpartum hemorrhage",
          icon: "speed"
        }
      ]
    },
    {
      type: "section",
      title: "High-Risk Factors"
    },
    {
      type: "accordion",
      title: "Risk Assessment",
      items: [
        {
          title: "Maternal Risk Factors",
          content: "<b>Pre-existing Conditions:</b><br>- Diabetes (gestational or Type 1/2)<br>- Hypertension / preeclampsia history<br>- Cardiac disease<br>- Prior cesarean section<br>- Known placenta previa or abruption<br><br><b>Current Pregnancy:</b><br>- Multiple gestation (twins, triplets)<br>- Preterm labor (< 37 weeks)<br>- Post-term pregnancy (> 42 weeks)<br>- No prenatal care<br>- Polyhydramnios / oligohydramnios<br>- Rh sensitization",
          icon: "warning"
        },
        {
          title: "Signs of Fetal Distress",
          content: "<b>Concerning Findings:</b><br>- Meconium-stained amniotic fluid (green/brown)<br>- Fetal heart rate < 110 or > 160 (if monitoring available)<br>- Decreased fetal movement reported<br>- Cord prolapse<br><br><b>Actions:</b><br>- High-flow oxygen to mother<br>- Left lateral position<br>- Rapid transport to facility with NICU<br>- Notify receiving hospital",
          icon: "favorite"
        },
        {
          title: "Emergent Conditions",
          content: "<b>Immediate Transport/Intervention Required:</b><br><br><b>Cord Prolapse:</b> Elevate presenting part, knee-chest position (see TP-1217)<br><br><b>Placental Abruption:</b> Painful bleeding, rigid uterus, shock (see TP-1217)<br><br><b>Placenta Previa:</b> Painless bright red bleeding, soft uterus (see TP-1217)<br><br><b>Eclampsia:</b> Seizures in pregnancy (see TP-1217)<br><br><b>Breech/Limb Presentation:</b> Prepare for complicated delivery",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "Pre-Hospital Labor Management"
    },
    {
      type: "accordion",
      title: "Care During Transport",
      items: [
        {
          title: "Positioning",
          content: "<b>Left Lateral Recumbent:</b><br>- Standard position for pregnant patients > 20 weeks<br>- Prevents supine hypotensive syndrome<br>- IVC compression by gravid uterus can reduce cardiac output 30%<br><br><b>If backboard required (trauma):</b><br>- Tilt board 15-30 degrees to left<br>- Or manual left uterine displacement<br><br><b>Semi-Fowler's:</b> Acceptable if more comfortable and BP stable",
          icon: "airline_seat_recline_extra"
        },
        {
          title: "Contraction Coaching",
          content: "<b>During Contractions:</b><br>- Coach slow, deep breathing<br>- Count through contraction<br>- Reassure this is normal<br><br><b>Between Contractions:</b><br>- Rest and recover<br>- Sips of water if desired<br>- Reassess progression<br><br><b>If Urge to Push and NOT Crowning:</b><br>- \"Blow, blow, blow\" - short quick breaths<br>- Avoid bearing down until delivery site reached or crowning<br>- Coach: \"Don't push yet, we're almost there\"",
          icon: "air"
        },
        {
          title: "IV Access and Fluid",
          content: "<b>Establish IV Access:</b><br>- 18g or larger preferred<br>- NS or LR at TKO rate unless bleeding/shock<br><br><b>Purpose:</b><br>- Medication access if needed<br>- Volume replacement if hemorrhage occurs<br>- Oxytocin administration capability post-delivery<br><br><b>Aggressive fluids</b> only if signs of shock or active hemorrhage",
          icon: "water_drop"
        }
      ]
    },
    {
      type: "accordion",
      title: "Ruptured Membranes (Water Breaking)",
      items: [
        {
          title: "Assessment and Management",
          content: "<b>Normal:</b> Clear amniotic fluid, mild odor<br><br><b>Concerning:</b><br>- Green/brown fluid = meconium (fetal distress)<br>- Foul-smelling = possible chorioamnionitis (infection)<br>- Heavy bleeding mixed with fluid = possible abruption<br><br><b>Actions After ROM:</b><br>- Note time of rupture<br>- Assess fluid color and amount<br>- Monitor for cord prolapse (especially if presenting part not engaged)<br>- Increased infection risk - handle perineum minimally<br><br><b>Document:</b> Time, color, odor, amount",
          icon: "water"
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Preterm Labor (< 37 weeks)",
      items: [
        {
          title: "Recognition and Management",
          content: "<b>Definition:</b> Labor before 37 weeks gestation<br><br><b>Presentation:</b><br>- Regular contractions<br>- Low back pain, pelvic pressure<br>- Vaginal discharge or bleeding<br>- May have ruptured membranes<br><br><b>Field Management:</b><br>- Left lateral position<br>- IV access<br>- Oxygen if SpO2 < 94%<br>- Transport to facility with NICU capability<br>- Do not attempt to stop labor in field<br><br><b>Viability Threshold:</b> Generally 23-24 weeks (hospital-dependent)",
          icon: "schedule"
        }
      ]
    },
    {
      type: "accordion",
      title: "Multiple Gestation (Twins/Triplets)",
      items: [
        {
          title: "Considerations",
          content: "<b>Increased Risks:</b><br>- Preterm labor<br>- Malpresentation<br>- Cord complications<br>- Postpartum hemorrhage<br><br><b>If Field Delivery Required:</b><br>- Deliver first baby per normal protocol<br>- Clamp and cut cord<br>- Second baby typically delivers within 5-15 min<br>- May be vertex or breech - deliver as presents<br>- Increased hemorrhage risk - massage fundus vigorously<br><br><b>Call for additional resources early</b>",
          icon: "people"
        }
      ]
    },
    {
      type: "info",
      title: "Gestational Age Estimation",
      content: "<b>If Unknown:</b><br><br><b>Fundal Height:</b><br>- 12 weeks: Just above pubic bone<br>- 20 weeks: At umbilicus<br>- 36+ weeks: Near xiphoid process<br><br><b>Viability:</b><br>- < 20 weeks: Generally non-viable<br>- 20-23 weeks: Periviable (resuscitation decisions complex)<br>- 24+ weeks: Viable with NICU support<br>- 37+ weeks: Term<br><br><b>Preterm infants require NICU-capable facility</b>"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>\"Trust the mother\"</b> - When she says the baby is coming, believe her and examine.<br><br><b>Multipara math:</b> Ask about prior labor times. If last baby came in 2 hours, this one may be faster.<br><br><b>Water breaking is not an emergency</b> - Unless cord is prolapsed or fluid is concerning. Labor may still be hours away.<br><br><b>Bloody show is normal</b> - Mucus plug with blood-tinged discharge indicates cervical change.<br><br><b>Crowning = committed</b> - Once the head is crowning, delivery will occur. Stop transport and deliver.<br><br><b>Don't fight the push:</b> If mother cannot resist pushing despite coaching, prepare for delivery."
    },
    {
      type: "warning",
      content: "<b>NEVER transport a crowning patient.</b><br><br>Field delivery with adequate preparation is safer than delivery in a moving ambulance.<br><br>If delivery occurs en route: Pull over safely, complete delivery, then continue transport."
    },
    {
      type: "facility-finder",
      title: "Nearest Perinatal / OB Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "info",
      title: "Facility Selection",
      content: "<b>Standard Labor:</b> Any hospital with L&D<br><br><b>High-Risk/Preterm (< 34 weeks):</b> Level III/IV NICU required<br>- LAC+USC Medical Center<br>- Cedars-Sinai Medical Center<br>- Children's Hospital Los Angeles (CHLA) nearby<br><br><b>Complications (abruption, previa, eclampsia):</b> Trauma/OB center with surgical capability"
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1215 Childbirth (Normal Delivery)" },
        { title: "TP-1216 Newborn Resuscitation" },
        { title: "TP-1217 Pregnancy Complication" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1219 Hypothermia/Cold Emergencies" }
      ]
    }
  ]
};
