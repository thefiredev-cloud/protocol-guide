import { Protocol } from '../../../types';

export const laDrop: Protocol = {
  id: "LA-DROP",
  refNo: "LA-DROP",
  title: "Prehospital Blood Transfusion",
  category: "Trauma",
  type: "Pilot Protocol",
  lastUpdated: "2025",
  icon: "bloodtype",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Blood Transfusion", subtitle: "LA-DROP Pilot Protocol", icon: "bloodtype" }]
    },
    {
      type: "warning",
      content: "<b>PILOT PROTOCOL:</b> For use by approved provider agencies only."
    },
    {
      type: "accordion",
      title: "1. Inclusion Criteria",
      items: [
        {
          title: "Indications",
          content: "Hemorrhagic Shock due to:<br>• <b>Severe Traumatic Injury</b><br>• <b>Post-partum Hemorrhage</b>"
        },
        {
          title: "Physiologic Criteria",
          content: "Must meet <b>ONE</b> of the following:<br>• SBP < 70 mmHg (or unable to obtain)<br>• SBP < 90 mmHg <b>AND</b> HR ≥ 110<br>• Traumatic Arrest witnessed by EMS"
        }
      ]
    },
    {
      type: "accordion",
      title: "2. Exclusions",
      items: [
        {
          title: "Absolute Exclusions",
          content: "• Pediatric patient (≤ 14 years or on length-based tape)<br>• Traumatic Arrest NOT witnessed by EMS<br>• Isolated head injury and/or ground level fall<br>• Patient refusal"
        }
      ]
    },
    {
      type: "accordion",
      title: "3. Treatment Flow",
      items: [
        {
          title: "Initial Actions",
          content: "• Control External Bleeding (Tourniquet prn)<br>• Consider Tension Pneumothorax<br>• Prioritize Transport"
        },
        {
          title: "Transfusion",
          content: "If criteria met:<br>• Warm and rapidly transfuse <b>one unit</b> of LTO+WB <b>OR</b> two units PRBCs<br>• Administer <b>TXA 1g</b> IV/IO over 10 min"
        },
        {
          title: "Reassessment",
          content: "If patient meets criteria after initial transfusion:<br>1. Transfuse <b>one more unit</b> of LTO+WB OR PRBCs<br>2. Reconsider other causes of shock"
        },
        {
          title: "Standard Care (No Blood)",
          content: "If criteria NOT met:<br>• Manage per Treatment Protocols<br>• Fluid challenge prn<br>• Administer TXA 1g if indicated"
        }
      ]
    },
    {
       type: "list",
       title: "4. Administration Checklist",
       items: [
          { title: "Prep", content: "• Ensure bleeding controlled ('MARCH')<br>• Cardiac Monitor, HR, BP, SpO2, EtCO2<br>• Establish 2 large bore IVs (preferred) or IOs" },
          { title: "Safety Checks", content: "• Inspect blood bag for integrity and clots<br>• <b>Double Check (2 Medics):</b> Product Type, Rh Factor, Expiration Date" },
          { title: "Administration", content: "• Prime tubing/warmer with saline<br>• Spike unit to Y connector<br>• Rapidly transfuse (pressure bag/infuser)" },
          { title: "Monitoring", content: "• Vitals q 3 mins<br>• Maintain IV/IO patency<br>• Monitor for transfusion reaction<br>• Apply wristband" }
       ]
    },
    {
       type: "warning",
       title: "Transfusion Reaction",
       content: "<b>Signs:</b> Fever, Hives, Hypotension.<br><b>Action:</b><br>1. STOP TRANSFUSION<br>2. Disconnect tubing, flush IV<br>3. Treat per TP-1219 / TP-1214<br>4. Save bag and tubing"
    },
    {
      type: "accordion",
      title: "5. Consent & Scripts",
      items: [
        { title: "Informed Consent Script", content: "\"We need to give you a life saving blood transfusion due to your severe bleeding. The risks are very low and include allergy, fever, or breathing reactions and we will monitor you closely.\"" },
        { title: "Refusal Script", content: "\"Because I want to make sure I respect your decisions, I want to confirm that you do not want to be treated with blood products even if that means you might die. Is that correct?\"" },
        { title: "Special Cases", content: "<b>Females <50y:</b> Warn of potential risk to future pregnancies.<br><b>Minors:</b> Parent/Guardian or Implied consent." }
      ]
    },
    {
       type: "info",
       title: "Base Contact",
       content: "Contact Base if:<br>• Transfusion indicated but criteria not met<br>• Additional dosing needed<br>• All refusals of blood transfusions"
    }
  ]
};