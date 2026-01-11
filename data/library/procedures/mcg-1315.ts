
import { Protocol } from '../../../types';

export const mcg1315: Protocol = {
  id: "MCG-1315",
  refNo: "MCG 1315",
  title: "Continuous Positive Airway Pressure (CPAP)",
  category: "Procedures",
  type: "Medical Control Guideline",
  lastUpdated: "Oct 1, 2025",
  icon: "air",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Continuous Positive Airway Pressure (CPAP)", subtitle: "MCG 1315 - Medical Control Guideline", icon: "air" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Acute Pulmonary Edema (APE)", content: "Cardiogenic or non-cardiogenic fluid in alveoli." },
        { title: "Congestive Heart Failure (CHF)", content: "Fluid overload with respiratory compromise." },
        { title: "COPD Exacerbation", content: "Acute decompensation of chronic obstructive pulmonary disease." },
        { title: "Asthma with Respiratory Failure", content: "Severe bronchospasm not responding to initial treatment." },
        { title: "Respiratory Distress NOS", content: "Moderate to severe respiratory distress of various etiologies." }
      ]
    },
    {
      type: "warning",
      content: "<b>CPAP IS NOT A SUBSTITUTE FOR DEFINITIVE AIRWAY.</b><br><br>CPAP requires a cooperative, spontaneously breathing patient. If patient deteriorates, becomes unresponsive, or cannot tolerate the mask, remove immediately and consider BVM or advanced airway.<br><br><b>Watch for barotrauma</b> and pneumothorax, especially in COPD patients."
    },
    {
      type: "section",
      title: "Indications"
    },
    {
      type: "accordion",
      title: "Primary Indications",
      items: [
        {
          title: "Acute Pulmonary Edema / CHF",
          content: "<b>CPAP is FIRST-LINE for APE.</b><br><br>Signs suggesting APE:<br>- Sudden onset dyspnea<br>- Pink, frothy sputum<br>- Crackles/rales bilateral<br>- JVD<br>- Peripheral edema<br>- History of CHF<br>- Hypertension common<br><br><b>CPAP works by:</b><br>- Decreasing preload (blood pooling in thorax)<br>- Decreasing afterload<br>- Opening atelectatic alveoli<br>- Improving V/Q matching",
          icon: "water_drop"
        },
        {
          title: "COPD Exacerbation",
          content: "<b>Indications:</b><br>- Known COPD with acute exacerbation<br>- SpO2 < 90% on supplemental O2<br>- Significant work of breathing<br>- Tripoding, pursed lip breathing<br>- Accessory muscle use<br><br><b>Benefits:</b><br>- Overcomes auto-PEEP<br>- Splints airways open<br>- Reduces work of breathing<br>- May prevent intubation",
          icon: "pulmonology"
        },
        {
          title: "Asthma (Severe)",
          content: "<b>Consider CPAP for:</b><br>- Severe bronchospasm not responding to nebulizers<br>- Impending respiratory failure<br>- Fatigue from prolonged attack<br><br><b>Note:</b> May use inline nebulizer with CPAP<br><b>Caution:</b> Risk of barotrauma with air trapping",
          icon: "air"
        },
        {
          title: "Near-Drowning",
          content: "- Patient awake and breathing<br>- Hypoxia despite supplemental O2<br>- No vomiting<br>- CPAP recruits flooded alveoli",
          icon: "waves"
        },
        {
          title: "Pneumonia with Hypoxia",
          content: "- Severe respiratory infection<br>- SpO2 < 90% on high-flow O2<br>- Patient cooperative<br>- No contraindications",
          icon: "coronavirus"
        }
      ]
    },
    {
      type: "section",
      title: "Contraindications"
    },
    {
      type: "warning",
      content: "<b>ABSOLUTE CONTRAINDICATIONS - Do NOT apply CPAP:</b><br><br>- Respiratory or cardiac arrest<br>- Agonal respirations<br>- Apnea or near-apnea<br>- Unresponsive (GCS < 8)<br>- Unable to protect airway<br>- Active vomiting or GI hemorrhage<br>- Facial trauma preventing seal<br>- Facial burns (airway burns)<br>- Pneumothorax or suspected pneumothorax<br>- Severe hypotension (SBP < 90)"
    },
    {
      type: "accordion",
      title: "Relative Contraindications",
      items: [
        {
          title: "Use With Caution",
          content: "- Claustrophobia (patient may not tolerate)<br>- Nausea (high aspiration risk)<br>- Recent upper GI surgery<br>- Known bullous lung disease<br>- Tracheostomy (requires adaptation)<br>- Facial deformity affecting seal<br>- Blood pressure borderline (SBP 90-100)<br><br><b>Consider risks vs benefits.</b> CPAP may be life-saving even with relative contraindications.",
          icon: "warning"
        }
      ]
    },
    {
      type: "section",
      title: "Equipment and Setup"
    },
    {
      type: "accordion",
      title: "CPAP Equipment",
      items: [
        {
          title: "Components",
          content: "<b>CPAP Circuit includes:</b><br>- Mask (full face, sized appropriately)<br>- Adjustable PEEP valve (usually 5-10 cmH2O range)<br>- One-way valves and tubing<br>- Oxygen source connection (50 psi wall/tank)<br>- Pressure manometer (some devices)<br>- Inline nebulizer port (optional)<br>- Head straps for securing mask",
          icon: "medical_services"
        },
        {
          title: "Mask Sizing",
          content: "<b>Proper fit is critical:</b><br>- Mask should cover nose and mouth<br>- No excessive air leak around edges<br>- Bridge of nose should be covered but not compressed<br>- Most systems have S/M/L sizes<br><br><b>Test seal before applying pressure.</b>",
          icon: "face"
        },
        {
          title: "Oxygen Requirements",
          content: "- High-flow oxygen source required<br>- Usually connected to 50 psi outlet<br>- Flow rates typically 10-15+ LPM<br>- Oxygen percentage varies by device<br>- Many CPAP devices deliver near 100% FiO2",
          icon: "local_fire_department"
        }
      ]
    },
    {
      type: "section",
      title: "Procedure"
    },
    {
      type: "accordion",
      title: "CPAP Application Steps",
      items: [
        {
          title: "Step 1: Patient Preparation",
          content: "1. Position patient UPRIGHT (60-90 degrees if possible)<br>2. Explain procedure to patient<br>3. Describe sensation: 'Like sticking your head out a car window'<br>4. Reassure: 'Breathe normally, the machine does the work'<br>5. Establish IV access if not already done<br>6. Cardiac monitor and pulse oximetry<br>7. Have suction and BVM at bedside",
          icon: "person"
        },
        {
          title: "Step 2: Equipment Assembly",
          content: "1. Connect tubing to oxygen source (50 psi)<br>2. Attach mask to circuit<br>3. Attach PEEP valve (start at 5 cmH2O)<br>4. Test system - gas should flow freely<br>5. If using inline nebulizer, attach now<br>6. Prepare head straps for quick application",
          icon: "build"
        },
        {
          title: "Step 3: Application",
          content: "1. Hold mask to patient's face (patient or provider)<br>2. Let patient acclimate to airflow briefly<br>3. Once comfortable, secure head straps<br>4. Start with lower setting (5 cmH2O)<br>5. Assess for air leak - adjust mask if needed<br>6. Confirm patient tolerating mask<br>7. Monitor for improvement",
          icon: "face"
        },
        {
          title: "Step 4: Titration",
          content: "<b>Starting Settings:</b><br>- PEEP: 5 cmH2O<br>- FiO2: 100% initially<br><br><b>Titration Protocol:</b><br>- If SpO2 < 92% or continued distress after 2-3 minutes, increase to 7.5 cmH2O<br>- May increase to 10 cmH2O if needed<br>- Do not exceed 10 cmH2O in prehospital setting<br>- May decrease FiO2 if SpO2 > 95% (COPD patients target 88-92%)<br><br><b>Reassess every 2-3 minutes.</b>",
          icon: "tune"
        }
      ]
    },
    {
      type: "section",
      title: "Adjunct Therapies"
    },
    {
      type: "accordion",
      title: "Inline Nebulizer",
      items: [
        {
          title: "Using Nebulizer with CPAP",
          content: "<b>For bronchospasm component:</b><br>- Albuterol 2.5-5mg can be given inline<br>- Attach nebulizer to appropriate port<br>- Does not interrupt CPAP therapy<br>- May need higher medication doses (increased dead space)<br>- Ipratropium may also be added per protocol",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "Medications Commonly Used with CPAP",
      items: [
        {
          title: "Nitroglycerin (CHF/APE)",
          content: "- Sublingual or IV nitroglycerin per protocol<br>- Reduces preload and afterload<br>- Synergistic with CPAP for pulmonary edema<br>- Monitor blood pressure",
          icon: "medication"
        },
        {
          title: "Bronchodilators (COPD/Asthma)",
          content: "- Albuterol inline or before CPAP<br>- Ipratropium for COPD<br>- Continue bronchodilator therapy as indicated",
          icon: "medication"
        },
        {
          title: "Furosemide (CHF)",
          content: "- Per medical control or protocol<br>- Diuresis reduces fluid overload<br>- CPAP works faster for immediate relief<br>- Furosemide works over 20-30 minutes",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Monitoring and Troubleshooting"
    },
    {
      type: "accordion",
      title: "Monitoring Parameters",
      items: [
        {
          title: "Clinical Improvement",
          content: "<b>Expect to see within 5-10 minutes:</b><br>- Decreased work of breathing<br>- Decreased respiratory rate<br>- Improved SpO2<br>- Able to speak more easily<br>- Improved color<br>- Decreased anxiety<br>- Decreased accessory muscle use<br><br><b>No improvement after 10 minutes:</b> Consider alternative diagnosis or escalation",
          icon: "trending_up"
        },
        {
          title: "Vital Sign Monitoring",
          content: "- SpO2: Continuous monitoring<br>- Blood pressure: Every 3-5 minutes<br>- Heart rate: Continuous<br>- Respiratory rate: Before and during<br>- ETCO2 if available (useful in COPD)<br><br><b>Watch for hypotension</b> - CPAP increases intrathoracic pressure and may decrease preload",
          icon: "monitor_heart"
        }
      ]
    },
    {
      type: "accordion",
      title: "Troubleshooting Common Problems",
      items: [
        {
          title: "Mask Leak",
          content: "- Reposition mask<br>- Tighten straps (not too tight - discomfort)<br>- Try different mask size<br>- Ensure mask covers nose and mouth fully<br>- Address facial hair (gel may help seal)<br>- Some leak acceptable if patient improving",
          icon: "build"
        },
        {
          title: "Patient Intolerance / Claustrophobia",
          content: "- Reassurance and coaching<br>- Let patient hold mask initially<br>- Start with lower PEEP<br>- Brief break then retry<br>- If cannot tolerate, do not force - use alternative therapies<br>- Anxiety is normal initially",
          icon: "psychology"
        },
        {
          title: "No Improvement / Worsening",
          content: "- Consider incorrect diagnosis<br>- Rule out pneumothorax (especially if COPD/trauma)<br>- Assess for impending respiratory failure<br>- May need to remove CPAP and provide BVM<br>- Prepare for advanced airway<br>- Consider other causes of respiratory distress",
          icon: "warning"
        },
        {
          title: "Hypotension on CPAP",
          content: "- CPAP increases intrathoracic pressure<br>- May decrease venous return and cardiac output<br>- More common in hypovolemic patients<br>- Reduce PEEP if hypotensive<br>- Fluid bolus if indicated<br>- Remove CPAP if SBP < 90<br>- Reassess diagnosis (may not be CHF)",
          icon: "trending_down"
        },
        {
          title: "Vomiting",
          content: "<b>Aspiration risk is high.</b><br>- Remove mask IMMEDIATELY<br>- Turn patient to side<br>- Suction airway<br>- Reassess before reapplying<br>- Do not reapply if vomiting continues<br>- Consider NG tube at hospital",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>CPAP can be used in children but with caution:</b><br><br>- Pediatric-sized masks required<br>- Lower PEEP settings (3-5 cmH2O start)<br>- More difficult to obtain cooperation<br>- Higher risk of gastric insufflation<br>- Faster decompensation if fails<br>- Consider blow-by oxygen if cannot tolerate<br><br><b>Primary pediatric indications:</b><br>- Bronchiolitis (RSV)<br>- Asthma not responding to nebulizers<br>- Near-drowning<br><br><b>Consult medical control for pediatric CPAP use.</b>"
    },
    {
      type: "info",
      title: "Geriatric Considerations",
      content: "<b>Special concerns:</b><br>- Frail patients may fatigue quickly<br>- May have difficulty understanding instructions<br>- Dentures may affect mask seal (usually remove upper dentures)<br>- Higher baseline use of blood pressure medications (hypotension risk)<br>- May have underlying COPD and CHF together<br>- Lower threshold for escalation"
    },
    {
      type: "accordion",
      title: "CPAP Failure and Escalation",
      items: [
        {
          title: "When to Remove CPAP",
          content: "<b>Remove CPAP immediately if:</b><br>- Patient becomes unresponsive<br>- Respiratory arrest or agonal breathing<br>- Active vomiting<br>- Unable to tolerate after coaching<br>- Worsening hypotension despite interventions<br>- Signs of pneumothorax<br>- No improvement after 10-15 minutes<br>- Clinical deterioration",
          icon: "emergency"
        },
        {
          title: "Escalation Pathway",
          content: "1. Remove CPAP mask<br>2. High-flow oxygen via NRB<br>3. BVM ventilation if needed<br>4. Prepare for intubation<br>5. Suction available<br>6. Contact medical control<br>7. Supraglottic airway as backup<br>8. Continuous reassessment",
          icon: "trending_up"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>CPAP works fast.</b> If it is going to work, you should see improvement within 5-10 minutes. If no improvement by 10 minutes, reassess your diagnosis.<br><br><b>Position matters.</b> Sit the patient UP. 90 degrees is ideal for pulmonary edema. Laying flat defeats the purpose.<br><br><b>Coaching is critical.</b> Many patients panic with CPAP initially. Calm reassurance and letting them hold the mask first often helps. 'Breathe with the machine, not against it.'<br><br><b>CPAP is NOT for the unconscious patient.</b> If they cannot protect their airway, CPAP will likely lead to aspiration. Use BVM or advanced airway instead.<br><br><b>Watch for pneumothorax.</b> Especially in COPD patients. If patient suddenly worsens on CPAP with unilateral breath sounds, consider tension pneumothorax and decompress.<br><br><b>The mask must seal.</b> Air leaking around the mask means the PEEP is not being delivered. A good seal is essential."
    },
    {
      type: "accordion",
      title: "Documentation Requirements",
      items: [
        {
          title: "Required Documentation",
          content: "- Indication for CPAP<br>- Initial vital signs including SpO2<br>- PEEP setting used (5, 7.5, 10)<br>- Oxygen flow/FiO2<br>- Time of CPAP initiation<br>- Patient tolerance<br>- Vital signs during CPAP (especially SpO2, BP)<br>- Clinical response<br>- Any complications<br>- If removed: reason and alternative treatment<br>- Time of removal (if applicable)"
        }
      ]
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1203 Respiratory Distress" },
        { title: "TP-1204 Respiratory Failure" },
        { title: "TP-1211 Acute Pulmonary Edema / CHF" },
        { title: "MCG 1302 Airway Management and Monitoring" },
        { title: "TP-1222 COPD" },
        { title: "TP-1218 Asthma / Bronchospasm" },
        { title: "Albuterol - Pharmacology" },
        { title: "Nitroglycerin - Pharmacology" }
      ]
    }
  ]
};
