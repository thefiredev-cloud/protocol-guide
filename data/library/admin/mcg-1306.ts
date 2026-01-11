
import { Protocol } from '../../../types';

/**
 * MCG 1306 - Suicide Risk Evaluation
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 *
 * Incorporates Columbia Suicide Severity Rating Scale (C-SSRS) concepts
 */
export const mcg1306: Protocol = {
  id: "1306",
  refNo: "MCG 1306",
  title: "Suicide Risk Evaluation",
  category: "Behavioral",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  tags: ["suicide", "suicidal ideation", "self-harm", "Columbia scale", "C-SSRS", "psychiatric", "behavioral", "mental health", "crisis", "5150", "overdose", "hanging"],
  icon: "psychology",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Suicide Risk Evaluation", subtitle: "MCG 1306 • Medical Control Guideline", icon: "psychology" }]
    },
    {
      type: "warning",
      content: "<b>SCENE SAFETY AND PATIENT SAFETY ARE PARAMOUNT</b><br><br>• Ensure scene is safe before approach<br>• Remove access to means (weapons, medications, sharp objects)<br>• NEVER leave patient alone<br>• Express concern and empathy<br>• All patients with suicidal ideation require transport and evaluation"
    },
    {
      type: "section",
      title: "Approach to the Suicidal Patient"
    },
    {
      type: "accordion",
      title: "Initial Approach",
      items: [
        {
          title: "Communication Principles",
          content: "• Approach with compassion and without judgment<br>• Take all suicidal statements seriously<br>• Do NOT minimize the patient's feelings<br>• Listen actively - let patient express feelings<br>• Acknowledge the pain they are experiencing<br>• Express genuine concern for their wellbeing"
        },
        {
          title: "Things to Say",
          content: "<b>Helpful statements:</b><br>• \"I'm glad you're talking to me about this.\"<br>• \"I can see you're really struggling right now.\"<br>• \"You don't have to go through this alone.\"<br>• \"We're here to help you.\"<br>• \"What you're feeling right now won't last forever.\""
        },
        {
          title: "Things to Avoid",
          content: "<b>Avoid:</b><br>• \"You have so much to live for.\"<br>• \"Think about your family.\"<br>• \"Things could be worse.\"<br>• \"You're just looking for attention.\"<br>• \"That's a permanent solution to a temporary problem.\"<br><br>These statements minimize the patient's experience and can increase distress."
        },
        {
          title: "Ask Directly About Suicide",
          content: "<b>It is safe and important to ask directly about suicidal thoughts.</b><br><br>Asking about suicide does NOT plant the idea or increase risk. It shows you care and opens communication.<br><br>Ask: \"Are you thinking about hurting yourself?\" or \"Are you having thoughts of suicide?\""
        }
      ]
    },
    {
      type: "section",
      title: "Columbia Suicide Severity Rating Scale (C-SSRS)"
    },
    {
      type: "accordion",
      title: "Screening Questions",
      items: [
        {
          title: "Question 1: Wish to be Dead",
          content: "\"Have you wished you were dead or wished you could go to sleep and not wake up?\"<br><br><b>YES</b> = Continue to Question 2<br><b>NO</b> = Low current risk if no recent suicide attempt"
        },
        {
          title: "Question 2: Suicidal Thoughts",
          content: "\"Have you actually had any thoughts of killing yourself?\"<br><br><b>YES</b> = Continue to Questions 3-5<br><b>NO</b> = If YES to Q1, still transport for evaluation"
        },
        {
          title: "Question 3: Suicidal Thoughts with Method",
          content: "\"Have you been thinking about how you might do this?\"<br><br><b>YES</b> = Higher risk - indicates method ideation"
        },
        {
          title: "Question 4: Suicidal Intent",
          content: "\"Have you had these thoughts and had some intention of acting on them?\"<br><br><b>YES</b> = HIGH RISK - intent present"
        },
        {
          title: "Question 5: Suicidal Intent with Plan",
          content: "\"Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?\"<br><br><b>YES</b> = HIGHEST RISK - plan and intent present"
        },
        {
          title: "Question 6: Suicide Behavior (Past 3 Months)",
          content: "\"Have you done anything, started to do anything, or prepared to do anything to end your life?\"<br><br>Examples: Collecting pills, obtaining a firearm, writing a suicide note, giving away possessions, saying goodbye<br><br><b>YES</b> = HIGH RISK - recent preparatory behavior"
        }
      ]
    },
    {
      type: "section",
      title: "Risk Stratification"
    },
    {
      type: "accordion",
      title: "Risk Level Assessment",
      items: [
        {
          title: "HIGH RISK Indicators",
          content: "<b>Any of the following = HIGH RISK:</b><br><br>• YES to Question 4 or 5 (intent with or without plan)<br>• YES to Question 6 (preparatory behavior)<br>• Recent suicide attempt (past 3 months)<br>• Access to lethal means (especially firearms)<br>• Current intoxication with suicidal ideation<br>• Command hallucinations to harm self<br>• Acute precipitating event (job loss, relationship end, death of loved one)"
        },
        {
          title: "MODERATE RISK Indicators",
          content: "• YES to Questions 1-3 (ideation with method but no intent)<br>• Previous suicide attempt (>3 months ago)<br>• Significant psychiatric symptoms<br>• Recent discharge from psychiatric facility<br>• Social isolation"
        },
        {
          title: "LOWER RISK Indicators",
          content: "• YES to Question 1 only (passive wish to be dead)<br>• No active suicidal ideation<br>• Strong social support<br>• Engaged in treatment<br>• Future-oriented thinking<br><br><b>Note:</b> Lower risk does NOT mean no risk. All patients with suicidal thoughts require evaluation."
        }
      ]
    },
    {
      type: "section",
      title: "Protective Factors"
    },
    {
      type: "info",
      title: "Factors That Reduce Risk",
      content: "<b>Inquire about protective factors:</b><br><br>• Reasons for living (children, family, pets, responsibilities)<br>• Religious or spiritual beliefs against suicide<br>• Strong social connections<br>• Engaged in mental health treatment<br>• Future-oriented planning (appointments, events)<br>• Willingness to seek help<br>• Fear of death or pain<br><br><b>Presence of protective factors does NOT negate need for evaluation</b> but may help with rapport building."
    },
    {
      type: "section",
      title: "Management of Suicide Attempts"
    },
    {
      type: "accordion",
      title: "Medical Stabilization - Priority",
      items: [
        {
          title: "Treat Medical Emergency First",
          content: "If patient has made suicide attempt, treat the medical condition:<br><br>• <b>Overdose:</b> ABCs, consider Narcan if opioid, activated charcoal rarely indicated prehospital, see TP-1204<br>• <b>Lacerations:</b> Hemorrhage control, wound care<br>• <b>Hanging:</b> Airway management, C-spine protection<br>• <b>GSW:</b> Trauma protocols, hemorrhage control<br>• <b>Drowning:</b> Airway, ventilation, hypothermia management<br>• <b>Carbon monoxide:</b> Remove from environment, high-flow O2"
        },
        {
          title: "Scene Investigation",
          content: "• What did they take/use?<br>• How much?<br>• When?<br>• Any pill bottles, empty containers?<br>• Suicide note?<br>• How were they found?<br><br>Bring any pill bottles, medications, or substances to the hospital."
        },
        {
          title: "All Suicide Attempts",
          content: "ALL patients who have made a suicide attempt require transport to the emergency department, regardless of current medical status.<br><br>Do NOT allow refusal of care for suicide attempt patients."
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "accordion",
      title: "Pediatric/Adolescent",
      items: [
        {
          title: "Unique Risk Factors",
          content: "• Bullying (including cyberbullying)<br>• Social media pressures<br>• Academic stress<br>• LGBTQ+ youth (higher risk)<br>• History of abuse or neglect<br>• Contagion effect (friend or peer suicide)<br>• Family history of suicide"
        },
        {
          title: "Assessment Tips",
          content: "• May be more willing to talk without parents present (if age-appropriate and safe)<br>• Take all statements seriously - children can and do complete suicide<br>• Ask about school, friends, social media, bullying<br>• Maintain non-judgmental stance"
        },
        {
          title: "Family Involvement",
          content: "• Inform parents/guardians of suicidal ideation or attempt<br>• Assess family dynamics (is home environment safe?)<br>• Evaluate for child abuse if suspected"
        }
      ]
    },
    {
      type: "accordion",
      title: "Elderly",
      items: [
        {
          title: "High-Risk Population",
          content: "Elderly, particularly elderly white males, have the highest suicide completion rate.<br><br><b>Risk factors:</b><br>• Social isolation<br>• Death of spouse<br>• Chronic illness or pain<br>• Loss of independence<br>• Financial stress<br>• Depression (often undiagnosed)"
        },
        {
          title: "Lethality",
          content: "Elderly tend to use more lethal means and are more likely to complete suicide. Take all ideation seriously."
        }
      ]
    },
    {
      type: "accordion",
      title: "Veterans / First Responders",
      items: [
        {
          title: "High-Risk Groups",
          content: "Military veterans and first responders (police, fire, EMS) have elevated suicide rates.<br><br><b>Risk factors:</b><br>• PTSD<br>• Repeated trauma exposure<br>• Access to lethal means<br>• Culture discouraging help-seeking<br>• Relationship difficulties"
        },
        {
          title: "Approach",
          content: "• Acknowledge their service<br>• Validate the stress of their role<br>• Be aware they may be reluctant to admit difficulty<br>• Understand that seeking help takes courage"
        }
      ]
    },
    {
      type: "section",
      title: "Means Restriction"
    },
    {
      type: "warning",
      content: "<b>ACCESS TO MEANS IS A CRITICAL RISK FACTOR</b><br><br>Firearms are the most lethal means of suicide (>90% fatality rate).<br><br>If patient has access to firearms:<br>• Recommend immediate removal from home<br>• Inform receiving facility<br>• Advise family on safe storage or removal"
    },
    {
      type: "section",
      title: "Transport and Disposition"
    },
    {
      type: "accordion",
      title: "Transport Guidance",
      items: [
        {
          title: "All Patients with Suicidal Ideation",
          content: "• Transport for psychiatric evaluation<br>• Do not leave patient alone during transport<br>• Remove access to any potential means (sharps, medications)<br>• Restrain only if necessary for safety"
        },
        {
          title: "Destination",
          content: "<b>With medical emergency (overdose, trauma):</b> Transport to ED<br><br><b>Medical stable, psychiatric emergency:</b> Transport to designated psychiatric emergency facility (PES) or ED per local protocol<br><br>Contact base hospital for destination guidance if uncertain."
        },
        {
          title: "Refusal of Transport",
          content: "Patients with active suicidal ideation or recent suicide attempt generally should NOT be allowed to refuse transport.<br><br>• If patient meets 5150 criteria (danger to self), initiate hold per local policy<br>• Contact medical control if patient is refusing<br>• Document thoroughly"
        },
        {
          title: "Documentation",
          content: "Document:<br>• C-SSRS screening results<br>• Risk factors present<br>• Protective factors identified<br>• Any statements made by patient (verbatim if possible)<br>• Any suicide attempt - what method, when<br>• Items brought to hospital (pill bottles, note)"
        }
      ]
    },
    {
      type: "section",
      title: "Provider Wellness"
    },
    {
      type: "info",
      title: "Taking Care of Yourself",
      content: "<b>Suicide calls can be emotionally difficult for providers.</b><br><br>• It's normal to be affected by these calls<br>• Utilize peer support and critical incident debriefing<br>• Watch for signs of stress in yourself and coworkers<br>• Employee assistance programs (EAP) are confidential<br><br><b>If you are struggling, seek help.</b> Provider mental health matters."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Ask Directly:</b> Asking about suicide does not increase risk. It shows you care and opens the door for help.<br><br><b>Take It Seriously:</b> Every statement about suicide should be taken seriously, regardless of perceived intent or attention-seeking.<br><br><b>Means Matter:</b> Access to lethal means, especially firearms, significantly increases risk of completion.<br><br><b>Follow Your Gut:</b> If something feels wrong, it probably is. Err on the side of transport.<br><br><b>Connection Saves Lives:</b> Simply showing compassion and being present can make a difference for someone in crisis.<br><br><b>Intoxication + Ideation = High Risk:</b> Alcohol and drugs impair judgment and increase impulsivity. Take suicidal statements from intoxicated patients very seriously."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1209 Behavioral / Psychiatric Crisis" },
        { title: "TP-1204 Overdose / Poisoning" },
        { title: "TP-1229 Altered Level of Consciousness" },
        { title: "Ref. 832 Patient Refusal" }
      ]
    }
  ]
};
