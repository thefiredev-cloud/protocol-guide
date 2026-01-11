
import { Protocol } from '../../../types';

export const tp1234: Protocol = {
  id: "1234",
  refNo: "TP-1234",
  title: "Airway Obstruction (Foreign Body)",
  category: "Respiratory",
  type: "Standing Order",
  lastUpdated: "Oct 1, 2025",
  icon: "air",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Airway Obstruction (Foreign Body)", subtitle: "TP-1234 - Adult/Pediatric Standing Order", icon: "air" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Complete Airway Obstruction (COMP)", content: "No air movement, silent cough, cyanosis, unable to speak." },
        { title: "Partial Airway Obstruction (PART)", content: "Stridor, weak cough, some air exchange, distressed." },
        { title: "Foreign Body Airway Obstruction (FBAO)", content: "Witnessed or suspected aspiration of foreign object." }
      ]
    },
    {
      type: "warning",
      content: "<b>COMPLETE OBSTRUCTION IS IMMEDIATELY LIFE-THREATENING.</b><br><br>If patient cannot cough, speak, or breathe - intervene immediately. A complete obstruction leads to hypoxic arrest within minutes.<br><br><b>Universal choking sign:</b> Hands clutched to throat = cannot breathe."
    },
    {
      type: "section",
      title: "Assessment and Classification"
    },
    {
      type: "accordion",
      title: "Obstruction Classification",
      items: [
        {
          title: "Complete Obstruction",
          content: "<b>Clinical presentation:</b><br>- Cannot speak, cry, or cough<br>- No air movement on auscultation<br>- Silent or very weak cough attempt<br>- Rapidly progressing cyanosis<br>- Universal choking sign (hands to throat)<br>- Altered mental status (late)<br><br><b>Action:</b> IMMEDIATE intervention required",
          icon: "emergency"
        },
        {
          title: "Partial Obstruction (Good Air Exchange)",
          content: "<b>Clinical presentation:</b><br>- Forceful coughing<br>- Able to speak (may be hoarse)<br>- Adequate air exchange<br>- May have stridor<br>- Alert and responsive<br><br><b>Action:</b> Encourage coughing, monitor closely, do NOT intervene with Heimlich",
          icon: "warning"
        },
        {
          title: "Partial Obstruction (Poor Air Exchange)",
          content: "<b>Clinical presentation:</b><br>- Weak, ineffective cough<br>- Stridor or high-pitched sounds<br>- Difficulty breathing<br>- Increasing respiratory distress<br>- Cyanosis developing<br><br><b>Action:</b> Treat as COMPLETE obstruction",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "BLS Treatment - Responsive Patient"
    },
    {
      type: "accordion",
      title: "Abdominal Thrusts (Heimlich Maneuver) - Adult/Child",
      items: [
        {
          title: "Indications",
          content: "- Complete airway obstruction<br>- Partial obstruction with poor air exchange<br>- Patient conscious but cannot speak/cough effectively<br><br><b>Do NOT perform if:</b><br>- Patient unconscious (use CPR technique)<br>- Patient able to cough forcefully<br>- Infant < 1 year (use back blows/chest thrusts)",
          icon: "accessibility"
        },
        {
          title: "Technique - Adult/Child (> 1 year)",
          content: "<b>Standing/Sitting Patient:</b><br><br>1. Stand behind patient<br>2. Wrap arms around waist<br>3. Make fist with one hand, thumb side against abdomen<br>4. Position fist between navel and xiphoid process<br>5. Grasp fist with other hand<br>6. Deliver quick, upward thrusts<br>7. Continue until object expelled or patient becomes unconscious<br><br><b>Use distinct, separate thrusts.</b> Do not squeeze ribs.",
          icon: "accessibility"
        },
        {
          title: "Self-Administered Heimlich",
          content: "If choking alone:<br>- Make fist, position above navel<br>- Use other hand to push fist inward and upward<br>- OR lean over back of chair/counter<br>- Drive upper abdomen against edge",
          icon: "person"
        },
        {
          title: "Pregnant/Obese Patients",
          content: "<b>Chest Thrusts:</b><br>- Stand behind patient<br>- Place arms under patient's armpits<br>- Position fist on MIDDLE of sternum<br>- Pull straight back with quick thrusts<br><br><b>Do NOT compress abdomen</b> in pregnancy > 20 weeks or severe obesity",
          icon: "pregnant_woman"
        }
      ]
    },
    {
      type: "section",
      title: "BLS Treatment - Infant (< 1 year)"
    },
    {
      type: "warning",
      content: "<b>DO NOT use abdominal thrusts on infants.</b> Risk of liver/spleen injury. Use back blows and chest thrusts only."
    },
    {
      type: "accordion",
      title: "Back Blows and Chest Thrusts",
      items: [
        {
          title: "Technique",
          content: "<b>Position:</b><br>1. Support infant's head and neck<br>2. Place infant face-down on forearm, head lower than trunk<br>3. Rest arm on thigh for support<br><br><b>Back Blows (5):</b><br>- Deliver 5 forceful back blows between scapulae<br>- Use heel of hand<br>- Allow head to hang lower than chest<br><br><b>Chest Thrusts (5):</b><br>- Turn infant face-up, supporting head<br>- Place 2 fingers on sternum, just below nipple line<br>- Deliver 5 quick chest compressions (same technique as CPR)<br><br><b>Repeat</b> back blows/chest thrusts until object expelled or infant unresponsive",
          icon: "child_care"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment - Unresponsive Patient"
    },
    {
      type: "warning",
      content: "<b>If patient becomes unresponsive:</b> Immediately lower to ground and begin CPR. Chest compressions may dislodge foreign body."
    },
    {
      type: "accordion",
      title: "CPR for Airway Obstruction",
      items: [
        {
          title: "Technique",
          content: "<b>Modified CPR:</b><br><br>1. Lower patient to supine position<br>2. Call for help if not already done<br>3. Begin chest compressions (30:2)<br>4. Before each ventilation, open airway and LOOK in mouth<br>5. If object visible, remove with finger sweep<br>6. Attempt ventilation<br>7. If air does not go in, reposition and retry ONCE<br>8. Resume compressions<br><br><b>Compressions generate pressure that may expel object.</b>",
          icon: "monitor_heart"
        },
        {
          title: "Key Differences from Standard CPR",
          content: "- Look in mouth BEFORE each ventilation attempt<br>- Remove visible objects only<br>- Do NOT perform blind finger sweeps<br>- Continue CPR even if ventilations unsuccessful<br>- Reassess airway with each cycle",
          icon: "tips_and_updates"
        }
      ]
    },
    {
      type: "section",
      title: "ALS Interventions"
    },
    {
      type: "accordion",
      title: "Direct Laryngoscopy and Magill Forceps",
      items: [
        {
          title: "Indications",
          content: "- Complete obstruction unrelieved by BLS maneuvers<br>- Unconscious patient with suspected foreign body<br>- Visualization needed to locate and remove object<br><br><b>Requires:</b> Laryngoscope, Magill forceps, suction",
          icon: "medical_services"
        },
        {
          title: "Procedure",
          content: "<b>Preparation:</b><br>- Position patient supine<br>- Suction available and ready<br>- Magill forceps at hand<br>- Assistant for mask ventilation<br><br><b>Technique:</b><br>1. Open mouth with cross-finger technique<br>2. Insert laryngoscope blade (Mac or Miller)<br>3. Visualize hypopharynx and glottic opening<br>4. Identify foreign body<br>5. Insert Magill forceps with dominant hand<br>6. Grasp object firmly (not tissue)<br>7. Remove object with smooth, direct motion<br>8. Confirm airway patency<br>9. Suction as needed<br>10. Ventilate and reassess",
          icon: "medical_services"
        },
        {
          title: "Magill Forceps Tips",
          content: "- Curve of forceps designed to reach into hypopharynx<br>- Keep laryngoscope in LEFT hand, forceps in RIGHT<br>- Do NOT grasp blindly - visualize object first<br>- May need to reposition blade to improve view<br>- Be careful not to grasp tissue (epiglottis, vocal cords)<br>- If object soft (food), may need multiple attempts<br>- Suction immediately after removal",
          icon: "tips_and_updates"
        },
        {
          title: "Troubleshooting",
          content: "<b>Cannot visualize object:</b><br>- Object may be below cords (bronchial obstruction)<br>- Attempt intubation to push object into one mainstem<br>- Ventilate contralateral lung<br><br><b>Cannot grasp object:</b><br>- Object may be wedged tightly<br>- Consider rotating or using suction<br>- Transport emergently if cannot remove<br><br><b>Object removed but patient not ventilating:</b><br>- Look for second object<br>- Assess for edema/swelling<br>- Consider advanced airway",
          icon: "build"
        }
      ]
    },
    {
      type: "accordion",
      title: "Suction Techniques",
      items: [
        {
          title: "Oral Suctioning",
          content: "- Use rigid (Yankauer) suction catheter<br>- Suction only what you can see<br>- May help clear secretions obstructing view<br>- Do not insert deep blindly<br>- Limit suction time to avoid hypoxia",
          icon: "medical_services"
        },
        {
          title: "High-Flow Suction for Solid Objects",
          content: "- Wide-bore suction (e.g., DuCanto catheter)<br>- May be effective for semi-solid food<br>- Position tip near object<br>- Apply continuous suction while maneuvering",
          icon: "medical_services"
        }
      ]
    },
    {
      type: "section",
      title: "Surgical Airway"
    },
    {
      type: "warning",
      content: "<b>LAST RESORT:</b> Surgical cricothyrotomy is indicated ONLY when all other methods fail and patient cannot be ventilated by any means. This is rare for FBAO as object is typically above glottis."
    },
    {
      type: "accordion",
      title: "Cricothyrotomy Considerations",
      items: [
        {
          title: "Indications in FBAO",
          content: "- Complete airway obstruction<br>- Cannot visualize or remove object<br>- Cannot ventilate via BVM<br>- Cannot intubate<br>- Object lodged AT or BELOW glottis<br><br><b>Most FBAO objects lodge above glottis</b> and can be addressed with laryngoscopy",
          icon: "emergency"
        },
        {
          title: "When to Consider",
          content: "- Severe laryngeal edema from allergic reaction to object<br>- Trauma causing airway obstruction<br>- Object impacted in glottis<br>- Complete cannot intubate/cannot oxygenate scenario<br><br><b>See MCG 1335 for procedure</b>",
          icon: "medical_services"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Infant (< 1 year):</b><br>- Back blows and chest thrusts ONLY<br>- NO abdominal thrusts<br>- NO blind finger sweeps<br>- Smaller airway = smaller objects cause obstruction<br><br><b>Child (1-8 years):</b><br>- Abdominal thrusts same as adult, proportional force<br>- Kneel behind child if needed<br>- Use age-appropriate equipment for laryngoscopy<br>- Miller blade often preferred<br>- Smaller Magill forceps<br><br><b>Common pediatric foreign bodies:</b><br>Hot dogs, grapes, nuts, coins, toy parts, balloons"
    },
    {
      type: "accordion",
      title: "Post-Relief Care",
      items: [
        {
          title: "After Object Removed",
          content: "- Assess airway patency<br>- Monitor for residual obstruction<br>- Watch for delayed swelling<br>- SpO2 monitoring<br>- Consider hospital transport for:<br>  - Prolonged hypoxia<br>  - Multiple attempts required<br>  - Aspiration suspected<br>  - Abdominal injury possible (from Heimlich)<br>  - Persistent symptoms",
          icon: "monitor_heart"
        },
        {
          title: "Refusal Considerations",
          content: "- Object removed successfully<br>- Patient asymptomatic<br>- No signs of aspiration<br>- No abdominal pain<br>- Patient understands risks (possible aspiration, incomplete removal)<br>- Document thorough assessment<br>- Advise return to ED if symptoms develop",
          icon: "assignment"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Let them cough.</b> If the patient is coughing forcefully, do not interfere. Their cough is more effective than your Heimlich.<br><br><b>Complete = intervene. Partial with good air exchange = observe.</b> Know the difference. Intervening on partial obstruction with good exchange may worsen it.<br><br><b>Look before you ventilate.</b> In the unconscious choking patient, check the mouth before each ventilation attempt. Object may have been dislodged by compressions.<br><br><b>Magill forceps are your friend.</b> Direct laryngoscopy with Magill removal is the definitive prehospital treatment for visible foreign body.<br><br><b>Chest compressions dislodge objects.</b> CPR for unresponsive FBAO works because compressions generate thoracic pressure that may expel the object.<br><br><b>No blind sweeps.</b> Only remove objects you can SEE. Blind finger sweeps can push objects deeper or cause injury."
    },
    {
      type: "accordion",
      title: "Documentation Requirements",
      items: [
        {
          title: "Required Documentation",
          content: "- Nature of obstruction (complete vs partial)<br>- Suspected object if known<br>- Level of consciousness throughout<br>- Interventions performed and sequence<br>- Time to relief<br>- Object removed (describe)<br>- Post-relief respiratory status<br>- SpO2 and vital signs<br>- Any complications (aspiration, injury)<br>- Transport decision and rationale"
        }
      ]
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "MCG 1302 Airway Management and Monitoring" },
        { title: "PROC-ETI Endotracheal Intubation" },
        { title: "MCG 1335 Needle Thoracostomy / Cricothyrotomy" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1203 Respiratory Distress" },
        { title: "TP-1305 Pediatric Respiratory Distress" }
      ]
    }
  ]
};
