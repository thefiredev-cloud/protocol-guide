import MiniSearch from "minisearch";

import provider_impressions from "@/data/provider_impressions.json"; // Provider Impressions mapping
import { KnowledgeBaseManager } from "@/lib/storage/knowledge-base-manager";

export type KBDoc = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  content: string;
};

type SynonymRule = {
  patterns: RegExp[];
  expansions: string[];
};

const SYNONYM_RULES: readonly SynonymRule[] = [
  // ======== CARDIAC - Firefighter/Layman Terms ========
  {
    patterns: [/\bheart attack\b/, /\bmi\b(?!\s*miles)/, /\bmyocardial\b/, /\bhis heart\b/, /\bheart hurts\b/],
    expansions: ["myocardial infarction", "stemi", "cardiac chest pain", "protocol 1211", "nitroglycerin", "aspirin"],
  },
  {
    patterns: [/\bstemi\b/, /\bchest pain\b/, /\bacs\b/, /\bangina\b/, /\bchest tightness\b/, /\bchest pressure\b/, /\bheaviness.*chest\b/],
    expansions: ["protocol 1211", "cardiac chest pain", "nitroglycerin", "aspirin", "morphine"],
  },
  {
    patterns: [/\bchf\b/, /\bcongestive heart failure\b/, /\bpulmonary edema\b/, /\bfluid in lungs\b/, /\bwet lungs\b/, /\bcrackles\b/, /\brales\b/],
    expansions: ["protocol 1214", "CHF", "pulmonary edema", "nitroglycerin", "furosemide"],
  },
  {
    patterns: [/\bcardiac arrest\b/, /\bno pulse\b/, /\bpulseless\b/, /\bcode\b(?!\s*3)/, /\bcpr\b/, /\bdead\b/, /\bnot breathing.*no pulse\b/, /\bflatline\b/, /\basystole\b/],
    expansions: ["protocol 1210", "cardiac arrest", "epinephrine", "amiodarone", "CPR"],
  },
  {
    patterns: [/\birregular heart\b/, /\bafib\b/, /\batrial fibrillation\b/, /\bheart racing\b/, /\bpalpitations\b/, /\barrhythmia\b/, /\bsvt\b/],
    expansions: ["protocol 1212", "cardiac arrhythmia", "adenosine", "diltiazem"],
  },
  {
    patterns: [/\bvfib\b/, /\bv-?fib\b/, /\bventricular fibrillation\b/, /\bvtach\b/, /\bv-?tach\b/, /\bshockable rhythm\b/],
    expansions: ["protocol 1210", "cardiac arrest", "defibrillation", "epinephrine", "amiodarone"],
  },
  {
    patterns: [/\bbradycardia\b/, /\bslow heart\b/, /\bheart rate.*slow\b/, /\bhr in the 40s\b/, /\bhr.*40\b/],
    expansions: ["protocol 1212", "bradycardia", "atropine", "transcutaneous pacing"],
  },

  // ======== RESPIRATORY - Firefighter Language ========
  {
    patterns: [/\bcan'?t breathe\b/, /\btrouble breathing\b/, /\bhard to breathe\b/, /\blabored breathing\b/, /\bdifficulty breathing\b/, /\bnot breathing right\b/, /\bstruggling to breathe\b/],
    expansions: ["shortness of breath", "SOB", "dyspnea", "respiratory distress", "protocol 1237"],
  },
  {
    patterns: [/\bbronchospasm\b/, /\bcopd\b/, /\basthma\b/, /\bwheez(?:e|ing)\b/, /\brespiratory distress\b/, /\blung disease\b/, /\bemphysema\b/],
    expansions: ["shortness of breath", "protocol 1237", "protocol 1233", "albuterol", "nebulizer"],
  },
  {
    patterns: [/\bchoking\b/, /\bairway obstruction\b/, /\bobstructed airway\b/, /\bswallowed something\b/, /\bfood stuck\b/, /\bcan't swallow\b/],
    expansions: ["protocol 1234", "airway obstruction", "foreign body"],
  },
  {
    patterns: [/\bpulmonary embolism\b/, /\bpe\b(?!\s*people)/, /\bblood clot.*lung\b/, /\bclot in lung\b/],
    expansions: ["protocol 1237", "pulmonary embolism", "respiratory distress", "hypoxia"],
  },

  // ======== NEUROLOGICAL - Common Terms ========
  {
    patterns: [/\bpassed out\b/, /\bblacked out\b/, /\bfainted\b/, /\bsyncope\b/, /\bwent down\b/, /\bfell out\b/, /\bcollapsed\b/],
    expansions: ["syncope", "loss of consciousness", "LOC", "protocol 1233", "altered mental status"],
  },
  {
    patterns: [/\bunresponsive\b/, /\bunconscious\b/, /\bloc\b/, /\baltered\b/, /\bconfused\b/, /\bnot making sense\b/, /\bacting weird\b/, /\boutside\s+of\s+it\b/, /\bnot with it\b/],
    expansions: ["altered mental status", "protocol 1229", "AMS", "ALOC", "unresponsive"],
  },
  {
    patterns: [/\bseizure\b/, /\bseizing\b/, /\bconvuls(?:ion|ing)\b/, /\bpostictal\b/, /\bstatus epilepticus\b/, /\bshaking\b(?!.*cold)/, /\bfits\b/, /\bepilepsy\b/],
    expansions: ["protocol 1231", "seizure", "benzodiazepine", "midazolam"],
  },
  {
    patterns: [/\bstroke\b/, /\bcva\b/, /\btia\b/, /\bfacial droop\b/, /\bslurred speech\b/, /\bmLAPSS\b/, /\blams\b/, /\bface drooping\b/, /\barm weakness\b/, /\bone side weak\b/, /\bhemiparesis\b/],
    expansions: ["protocol 1232", "stroke assessment", "CVA", "base contact"],
  },
  {
    patterns: [/\bheadache\b/, /\bhead pain\b/, /\bmigraine\b/, /\bworst headache\b/, /\bthunderclap headache\b/],
    expansions: ["protocol 1229", "neurological emergency", "altered mental status"],
  },

  // ======== TRAUMA - Field Terminology ========
  {
    patterns: [/\bgsw\b/, /\bgunshot\b/, /\bgun shot\b/, /\bballistic\b/, /\bshot\b(?!.*vaccine)/, /\bbullet\b/],
    expansions: ["gunshot wound", "penetrating trauma", "protocol 1244", "trauma triage"],
  },
  {
    patterns: [/\bmvc\b/, /\bmotor vehicle\b/, /\bcar accident\b/, /\bauto accident\b/, /\bcollision\b/, /\bcar crash\b/, /\bcar wreck\b/, /\btc\b(?!\s*or)/, /\btraffic collision\b/],
    expansions: ["motor vehicle collision", "blunt trauma", "protocol 1244", "trauma triage"],
  },
  {
    patterns: [/\bfall\b/, /\bfell\b/, /\bfalling\b/, /\bfallen\b/, /\btook a fall\b/, /\bground level fall\b/, /\bglf\b/],
    expansions: ["traumatic injury", "fall", "mechanism of injury", "protocol 1244"],
  },
  {
    patterns: [/\btrauma\b/, /\bmechanism\b/, /\bblunt\b/, /\bpenetrating\b/, /\bhurt bad\b/, /\bbadly injured\b/],
    expansions: ["protocol 1244", "trauma triage", "traumatic injury"],
  },
  {
    patterns: [/\bimpalement|impaled|penetrating\s+injury|penetrating\s+trauma\b/, /\bstuck with\b/, /\bstabbed by\b/],
    expansions: ["protocol 1244", "trauma triage", "penetrating trauma"],
  },
  {
    patterns: [/\bcrush\b/, /\bentrapped\b/, /\bentrapment\b/, /\bpinned\b/, /\btrapped under\b/, /\bstuck under\b/],
    expansions: ["crush injury", "protocol 1242", "crush syndrome", "hyperkalemia", "sodium bicarbonate"],
  },
  {
    patterns: [/\bstab\b/, /\bstabbing\b/, /\bstabbed\b/, /\bknife wound\b/, /\blaceration\b/],
    expansions: ["penetrating trauma", "protocol 1244", "hemorrhage control"],
  },
  {
    patterns: [/\bhead injury\b/, /\bhead trauma\b/, /\bhit.*head\b/, /\bconcussion\b/, /\btbi\b/, /\bskull fracture\b/],
    expansions: ["protocol 1244", "traumatic brain injury", "head trauma", "GCS"],
  },
  {
    patterns: [/\bburn\b/, /\bburned\b/, /\bburns\b/, /\bthermal\b/, /\bscald\b/, /\bscalded\b/, /\bchemical burn\b/, /\belectrical burn\b/],
    expansions: ["protocol 1204", "burn injury", "fluid resuscitation"],
  },
  {
    patterns: [/\bdrowning\b/, /\bdrowned\b/, /\bsubmersion\b/, /\bnear drowning\b/, /\bin the water\b/, /\bfound in pool\b/],
    expansions: ["protocol 1215", "drowning", "submersion", "hypothermia"],
  },
  {
    patterns: [/\belectric\b/, /\belectrocution\b/, /\belectrical shock\b/, /\blightning\b/, /\bstruck by lightning\b/],
    expansions: ["protocol 1216", "electrical injury", "cardiac monitoring"],
  },
  {
    patterns: [/\bamputation\b/, /\bamputated\b/, /\bsevered\b/, /\bcut off\b/, /\btook.*off\b/],
    expansions: ["protocol 1244", "amputation", "hemorrhage control", "tourniquet"],
  },

  // ======== GI/ABDOMINAL - Common Language ========
  {
    patterns: [/\bbelly pain\b/, /\bstomach pain\b/, /\babdominal pain\b/, /\babdomen\b/, /\btummy\b/, /\bgut pain\b/, /\bstomach hurts\b/],
    expansions: ["abdominal pain", "GI emergency", "protocol 1205"],
  },
  {
    patterns: [/\bthrowing up\b/, /\bvomiting\b/, /\bpuking\b/, /\bemesis\b/, /\bnausea\b/, /\bsick to.*stomach\b/],
    expansions: ["nausea", "vomiting", "emesis", "GI emergency", "protocol 1205", "ondansetron"],
  },
  {
    patterns: [/\bgi bleed\b/, /\bbleeding internally\b/, /\bvomiting blood\b/, /\bhematemesis\b/, /\bmelena\b/, /\bbloody stool\b/, /\bblack stool\b/, /\btarry stool\b/],
    expansions: ["GI bleed", "hemorrhage", "protocol 1207", "shock"],
  },

  // ======== BLEEDING/HEMORRHAGE ========
  {
    patterns: [/\bbleeding out\b/, /\bhemorrhage\b/, /\blost blood\b/, /\bheavy bleeding\b/, /\bprofuse bleeding\b/, /\bwon't stop bleeding\b/],
    expansions: ["hemorrhage", "shock", "hypotension", "protocol 1207", "protocol 1230"],
  },

  // ======== ALLERGIC/ANAPHYLAXIS ========
  {
    patterns: [/\banaphylaxis\b/, /\ballergic reaction\b/, /\bthroat swelling\b/, /\bangioedema\b/, /\ballergic\b/, /\bhives\b/, /\bswelling.*face\b/, /\bswelling.*tongue\b/, /\bbee sting\b/],
    expansions: ["protocol 1219", "anaphylaxis", "epinephrine", "diphenhydramine", "benadryl"],
  },

  // ======== OB/GYN - Pregnancy Related ========
  {
    patterns: [/\bpregnant\b/, /\bpregnancy\b/, /\bdelivery\b/, /\blabor\b/, /\bcontractions\b/, /\bhaving a baby\b/, /\bwater broke\b/],
    expansions: ["protocol 1217", "pregnancy complication", "delivery", "eclampsia"],
  },
  {
    patterns: [/\beclampsia\b/, /\bpre-eclampsia\b/, /\bpreeclampsia\b/, /\bseizure.*pregnant\b/, /\bhigh blood pressure.*pregnant\b/],
    expansions: ["eclampsia", "protocol 1217", "magnesium sulfate", "base contact"],
  },
  {
    patterns: [/\bprecipitous delivery\b/, /\bbaby coming\b/, /\bcrowning\b/, /\bimminent delivery\b/],
    expansions: ["protocol 1217", "emergency delivery", "neonatal resuscitation"],
  },

  // ======== OVERDOSE/POISONING ========
  {
    patterns: [/\boverdose\b/, /\bpoison\b/, /\bingestion\b/, /\bopioid\b/, /\bod\b(?!\s*or)/, /\btook too many pills\b/, /\bswallowed pills\b/],
    expansions: ["protocol 1241", "overdose", "naloxone", "activated charcoal"],
  },
  {
    patterns: [/\bnarcan\b/, /\bnaloxone\b/, /\bheroin\b/, /\bfentanyl overdose\b/, /\bopiate\b/, /\bpinpoint pupils\b/],
    expansions: ["naloxone", "opioid overdose", "protocol 1241"],
  },
  {
    patterns: [/\bmeth\b/, /\bmethamphetamine\b/, /\bcoke\b(?!.*drink)/, /\bcocaine\b/, /\bspeed\b/, /\bstimulant\b/],
    expansions: ["protocol 1241", "stimulant overdose", "tachycardia", "agitation"],
  },
  {
    patterns: [/\bcarbon monoxide\b/, /\bco poisoning\b/, /\bco exposure\b/, /\bgas leak\b/, /\bsmoke inhalation\b/],
    expansions: ["protocol 1241", "carbon monoxide", "inhalation injury", "high flow oxygen"],
  },
  {
    patterns: [/\borgano\s*phosphate\b/, /\bnerve agent\b/, /\bchemical exposure\b/, /\bpesticide\b/, /\bsludge\b/, /\bdumbels\b/],
    expansions: ["protocol 1241", "organophosphate poisoning", "atropine", "pralidoxime"],
  },

  // ======== BEHAVIORAL/PSYCH ========
  {
    patterns: [/\bbehavioral\b/, /\bagitation\b/, /\bpsych\b/, /\bagitated\b/, /\bviolent\b/, /\bgoing crazy\b/, /\bout of control\b/, /\bpsychotic\b/, /\b5150\b/],
    expansions: ["protocol 1209", "behavioral crisis", "psychiatric", "midazolam", "ketamine"],
  },
  {
    patterns: [/\bsuicidal\b/, /\bsuicide\b/, /\bwants to die\b/, /\bhurt themselves\b/, /\bself harm\b/],
    expansions: ["protocol 1209", "behavioral emergency", "psychiatric", "safety"],
  },

  // ======== DIABETIC EMERGENCIES ========
  {
    patterns: [/\bdiabetic\b/, /\bhypoglycemi\w+\b/, /\bhyperglycemi\w+\b/, /\blow blood sugar\b/, /\bhigh blood sugar\b/, /\bsugar low\b/, /\bsugar high\b/, /\bdka\b/, /\bdiabetic coma\b/],
    expansions: ["protocol 1203", "diabetic emergency", "hypoglycemia", "dextrose", "glucagon", "D50"],
  },

  // ======== ENVIRONMENTAL EMERGENCIES ========
  {
    patterns: [/\bheat stroke\b/, /\bheat exhaustion\b/, /\bhyperthermia\b/, /\boverheated\b/, /\bhot.*not sweating\b/],
    expansions: ["protocol 1220", "hyperthermia", "heat emergency", "cooling"],
  },
  {
    patterns: [/\bhypothermia\b/, /\bcold exposure\b/, /\bfreezing\b/, /\bfrostbite\b/, /\bfound.*cold\b/],
    expansions: ["protocol 1221", "hypothermia", "rewarming"],
  },
  {
    patterns: [/\bsnake bite\b/, /\bspider bite\b/, /\bbite\b/, /\bsting\b/, /\bvenomous\b/, /\banimal bite\b/],
    expansions: ["protocol 1219", "envenomation", "allergic reaction"],
  },
  {
    patterns: [/\bdecompression\b/, /\bdiving\b/, /\bthe bends\b/, /\bdcs\b/, /\bscuba\b/],
    expansions: ["protocol 1223", "decompression sickness", "hyperbaric"],
  },
  {
    patterns: [/\bhigh altitude\b/, /\baltitude sickness\b/, /\bams\b(?!.*altered)/, /\bhape\b/, /\bhace\b/],
    expansions: ["protocol 1222", "altitude sickness", "descent"],
  },

  // ======== MCI/DISASTER ========
  {
    patterns: [/\bmci\b/, /\bmass casualty\b/, /\bmultiple patients\b/, /\bmass shooting\b/, /\bactive shooter\b/, /\bmultiple victims\b/],
    expansions: ["MCI protocol", "triage", "START triage", "mass casualty incident"],
  },
  {
    patterns: [/\bhazmat\b/, /\bchemical spill\b/, /\bcontamination\b/, /\bdecon\b/, /\bdecontamination\b/],
    expansions: ["hazmat protocol", "decontamination", "chemical exposure"],
  },

  // ======== SHOCK/HYPOTENSION ========
  {
    patterns: [/\bshock\b/, /\bhypotension\b/, /\blow bp\b/, /\blow blood pressure\b/, /\bpoor perfusion\b/, /\bpale.*sweaty\b/, /\bclammy\b/],
    expansions: ["protocol 1207", "shock", "hypotension", "fluid resuscitation"],
  },
  {
    patterns: [/\bsepsis\b/, /\bseptic\b/, /\binfection\b/, /\bfever.*altered\b/, /\bfever.*low bp\b/],
    expansions: ["protocol 1207", "sepsis", "shock", "fluid resuscitation"],
  },

  // ======== PEDIATRIC ========
  {
    patterns: [/\bpediatric\b/, /\bchild\b/, /\bnewborn\b/, /\bneonate\b/, /\binfant\b/, /\bbaby\b/, /\bpeds\b/, /\bkid\b/, /\btoddler\b/],
    expansions: ["MCG 1309", "color code", "weight based", "pediatric doses", "Broselow tape"],
  },
  {
    patterns: [/\bsids\b/, /\bsudden infant death\b/, /\bdead baby\b/, /\bbaby not breathing\b/, /\bchild.*not breathing\b/],
    expansions: ["protocol 1210", "pediatric cardiac arrest", "neonatal resuscitation"],
  },
  {
    patterns: [/\bcroup\b/, /\bbarking cough\b/, /\bstridor\b(?!.*adult)/, /\bepiglottitis\b/],
    expansions: ["protocol 1234", "pediatric airway", "croup", "stridor"],
  },
  {
    patterns: [/\bfebrile seizure\b/, /\bfever.*seizure\b/, /\bchild.*seizure\b/],
    expansions: ["protocol 1231", "pediatric seizure", "febrile seizure", "midazolam"],
  },

  // ======== MEDICATION BRAND TO GENERIC ========
  {
    patterns: [/\bversed\b/],
    expansions: ["midazolam", "seizure", "sedation", "protocol 1231"],
  },
  {
    patterns: [/\bbenadryl\b/],
    expansions: ["diphenhydramine", "allergy", "protocol 1219"],
  },
  {
    patterns: [/\bzofran\b/],
    expansions: ["ondansetron", "nausea", "vomiting", "protocol 1205"],
  },
  {
    patterns: [/\btoradol\b/],
    expansions: ["ketorolac", "pain management", "protocol 1245"],
  },
  {
    patterns: [/\btylenol\b/],
    expansions: ["acetaminophen", "pain management", "fever"],
  },
  {
    patterns: [/\bd50\b/, /\bd5w\b/, /\bdextrose\b/, /\bsugar water\b/],
    expansions: ["dextrose", "D50", "hypoglycemia", "protocol 1203"],
  },
  {
    patterns: [/\bepi\b/, /\bepinephrine\b/, /\badrenaline\b/],
    expansions: ["epinephrine", "anaphylaxis", "cardiac arrest", "protocol 1219", "protocol 1210"],
  },
  {
    patterns: [/\bamiodarone\b/, /\bcordarone\b/],
    expansions: ["amiodarone", "cardiac arrest", "ventricular fibrillation", "protocol 1210"],
  },
  {
    patterns: [/\blasix\b/, /\bfurosemide\b/],
    expansions: ["furosemide", "lasix", "CHF", "pulmonary edema", "protocol 1214"],
  },
  {
    patterns: [/\bnitro\b/, /\bnitroglycerin\b/, /\bntg\b/],
    expansions: ["nitroglycerin", "chest pain", "CHF", "protocol 1211", "protocol 1214"],
  },
  {
    patterns: [/\bmorphine\b/, /\bms contin\b/],
    expansions: ["morphine", "pain management", "chest pain", "protocol 1245"],
  },
  {
    patterns: [/\bfentanyl\b/, /\bduragesic\b/, /\bsublimaze\b/],
    expansions: ["fentanyl", "pain management", "protocol 1245"],
  },
  {
    patterns: [/\bketamine\b/, /\bketalar\b/],
    expansions: ["ketamine", "pain management", "sedation", "protocol 1245", "protocol 1209"],
  },
  {
    patterns: [/\balbuterol\b/, /\bproventil\b/, /\bventolin\b/],
    expansions: ["albuterol", "bronchospasm", "asthma", "protocol 1237"],
  },
  {
    patterns: [/\batropine\b/],
    expansions: ["atropine", "bradycardia", "organophosphate", "protocol 1212", "protocol 1241"],
  },
  {
    patterns: [/\badenosine\b/, /\badenocard\b/],
    expansions: ["adenosine", "SVT", "supraventricular tachycardia", "protocol 1212"],
  },
  {
    patterns: [/\bglucagon\b/],
    expansions: ["glucagon", "hypoglycemia", "beta blocker overdose", "protocol 1203"],
  },
  {
    patterns: [/\baspirin\b/, /\basa\b/],
    expansions: ["aspirin", "chest pain", "cardiac", "protocol 1211"],
  },
  {
    patterns: [/\bsolu-?medrol\b/, /\bmethylprednisolone\b/],
    expansions: ["methylprednisolone", "asthma", "anaphylaxis", "protocol 1237"],
  },
  {
    patterns: [/\bcalcium chloride\b/, /\bcacl\b/, /\bcalcium\b/],
    expansions: ["calcium chloride", "hyperkalemia", "calcium channel blocker overdose"],
  },
  {
    patterns: [/\bmagnesium\b/, /\bmag\b/],
    expansions: ["magnesium sulfate", "eclampsia", "torsades", "asthma"],
  },
  {
    patterns: [/\blidocaine\b/, /\bxylocaine\b/],
    expansions: ["lidocaine", "ventricular arrhythmia", "pain management"],
  },
  {
    patterns: [/\b2-pam\b/, /\bpralidoxime\b/, /\bprotopam\b/],
    expansions: ["pralidoxime", "organophosphate poisoning", "nerve agent", "protocol 1241"],
  },

  // ======== EXISTING RULES (PRESERVED) ========
  {
    patterns: [
      /\bsodium\s*bi\s*carb\b/,
      /\bbicarb\b/,
      /\bbi\s*carb\b/,
      /\bnahco3\b/,
    ],
    expansions: ["sodium bicarbonate"],
  },
  {
    patterns: [/\b(tca|tricyclic)\b/],
    expansions: ["tricyclic overdose", "qrs widening", "sodium bicarbonate"],
  },
  {
    patterns: [/\bhyperk\b/, /\bhyperkalemi\w*/],
    expansions: ["hyperkalemia", "sodium bicarbonate", "cardiac arrest", "bradycardia"],
  },
  {
    patterns: [/\bdialysis\b/, /\brenal failure\b/, /\bckd\b/],
    expansions: ["hyperkalemia", "sodium bicarbonate", "renal failure"],
  },
  {
    patterns: [/\bpeaked\s*t\s*waves?\b/],
    expansions: ["hyperkalemia", "sodium bicarbonate"],
  },

  // ======== BASE HOSPITAL / TRANSPORT ========
  {
    patterns: [/\bbase contact\b/, /\bbase hospital\b/, /\bonline medical control\b/, /\bmed control\b/],
    expansions: ["base hospital contact", "online medical control", "orders"],
  },
  {
    patterns: [/\btrauma center\b/, /\blevel 1\b/, /\blevel one\b/, /\bstemi center\b/, /\bstroke center\b/],
    expansions: ["trauma center", "specialty center", "destination hospital"],
  },
];

let index: MiniSearch<KBDoc> | null = null;
let kbDocs: KBDoc[] | null = null;

async function loadKnowledgeBase(): Promise<KBDoc[]> {
  if (!kbDocs) {
    const manager = new KnowledgeBaseManager();
    const docs = await manager.load();
    kbDocs = applyScopeFilter(docs);
  }
  return kbDocs;
}

function getLoadedKB(): KBDoc[] {
  if (!kbDocs) {
    throw new Error("Knowledge base not loaded. Call initializeKnowledgeBase() before using retrieval utilities.");
  }
  return kbDocs;
}

function ensureIndexLoaded() {
  if (index) return;
  const docs = getLoadedKB();
  const ms = new MiniSearch<KBDoc>({
    fields: ["title", "category", "subcategory", "content", "keywords"],
    storeFields: ["id", "title", "category", "subcategory", "content"],
    searchOptions: {
      boost: { title: 3, category: 1.5 },
      prefix: true,
      fuzzy: 0.2
    }
  });
  ms.addAll(docs);
  index = ms;
}

export async function initializeKnowledgeBase(): Promise<void> {
  await loadKnowledgeBase();
  ensureIndexLoaded();
}

function applyQueryNormalization(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export function augmentQueryWithSynonyms(originalQuery: string): string {
  const normalized = applyQueryNormalization(originalQuery);
  const lower = normalized.toLowerCase();
  const expansions = new Set<string>();

  SYNONYM_RULES.forEach((rule) => {
    const matched = rule.patterns.some((pattern) => pattern.test(lower));
    if (!matched) return;
    rule.expansions.forEach((expansion) => expansions.add(expansion));
  });

  return [normalized, ...expansions].join(" ").trim();
}

export function expandQueryForTesting(query: string): string {
  return augmentQueryWithSynonyms(query);
}

function isPCMDoc(d: KBDoc): boolean {
  const category = String(d.category || "").toLowerCase();
  const subcat = String(d.subcategory || "").toLowerCase();
  // Prehospital Care Manual docs come from our PDFs/Markdown ingest
  // which are categorized as PDF/Markdown with subcategory 'LA County EMS'
  return (category === "markdown" || category === "pdf") && subcat.includes("la county ems");
}

function applyScopeFilter(docs: KBDoc[]): KBDoc[] {
  const scope = (process.env.KB_SCOPE || "pcm").toLowerCase();
  if (scope === "pcm") {
    return docs.filter(isPCMDoc);
  }
  return docs;
}

type SearchHit = { id: string };

export async function searchKB(query: string, limit = 6): Promise<KBDoc[]> {
  ensureIndexLoaded();
  const docs = getLoadedKB();
  const expanded = augmentQueryWithSynonyms(query);
  const results = index!.search(expanded, { combineWith: "OR" }).slice(0, limit) as unknown as SearchHit[];
  const mapped = mapSearchResults(results, docs);
  return augmentWithRelatedDocs(query, mapped, docs);
}

function mapSearchResults(results: SearchHit[], docs: KBDoc[]): KBDoc[] {
  const mapped: KBDoc[] = [];
  for (const r of results) {
    const found = docs.find((d) => d.id === r.id);
    if (found) mapped.push(found);
  }
  return mapped;
}

export async function buildContext(query: string, limit = 6): Promise<string> {
  const hits = await searchKB(query, limit);
  const ql = query.toLowerCase();
  // if (process.env.NODE_ENV !== 'production' && isSpecialDebugQuery(ql)) debugLogQuery(ql, hits);
  if (!hits.length) return "No direct matches in knowledge base.";
  const pcmOnly = (process.env.KB_SCOPE || "").toLowerCase() === "pcm";
  const context = buildProviderImpressionsSection(ql, pcmOnly);
  const chunks = buildKBChunks(hits);
  return context + chunks.join("\n\n---\n\n");
}

// Debug helpers kept for local investigation only
// function isSpecialDebugQuery(ql: string): boolean {
//   const tokens = ['mcg', '1309', 'pink', 'grey', 'red', 'purple', 'yellow', 'white', 'blue', 'orange', 'green', 'stroke'];
//   return tokens.some(t => ql.includes(t));
// }
// function debugLogQuery(ql: string, hits: KBDoc[]) {
//   console.log('Debug Query:', ql);
//   console.log('Search hits:', hits.length);
//   hits.forEach((hit, i) => console.log(`Hit ${i + 1}:`, hit.title));
// }

function buildProviderImpressionsSection(ql: string, pcmOnly: boolean): string {
  const medicalTerms = ['chest pain', 'cardiac', 'stroke', 'seizure', 'trauma', 'respiratory', 'abdominal', 'allergic', 'burn', 'overdose', 'diabetic', 'fever', 'shock', 'hypotension', 'bradycardia', 'tachycardia', 'syncope', 'dizziness', 'headache', 'nausea', 'vomiting', 'bleeding', 'pregnancy', 'childbirth', 'newborn', 'behavioral', 'psychiatric', 'alcohol', 'intoxication', 'electrocution', 'hypothermia', 'hyperthermia', 'carbon monoxide', 'hazmat', 'dystonic', 'epistaxis', 'eye', 'dental', 'ent', 'brue', 'airway', 'obstruction', 'choking', 'inhalation', 'smoke', 'stings', 'bites', 'submersion', 'drowning'];
  const hasMedicalTerms = medicalTerms.some(term => ql.includes(term));
  if (!hasMedicalTerms) return "";

  const relevantPIs = provider_impressions.filter(pi =>
    ql.includes(pi.pi_name.toLowerCase()) ||
    ql.includes(pi.pi_code.toLowerCase()) ||
    ql.includes(pi.tp_name.toLowerCase()) ||
    pi.keywords?.some(keyword => ql.includes(keyword.toLowerCase()))
  ).slice(0, 3);
  if (!relevantPIs.length) return "";

  let section = "**PROVIDER IMPRESSIONS REFERENCE (LA County):**\n";
  for (const pi of relevantPIs) {
    section += `• **${pi.pi_name} (${pi.pi_code})** → **${pi.tp_name} (${pi.tp_code}${pi.tp_code_pediatric ? '/' + pi.tp_code_pediatric : ''})**\n`;
    if (!pcmOnly && pi.guidelines) section += `  ${pi.guidelines}\n\n`;
    else section += `\n`;
  }
  return section + "---\n\n";
}

function buildKBChunks(hits: KBDoc[]): string[] {
  return hits.map((d, i) => {
    const trimmed = d.content.length > 3000 ? d.content.slice(0, 3000) + " …" : d.content;
    return `#${i + 1} • ${d.title} [${d.category}${d.subcategory ? " / " + d.subcategory : ""}]\n${trimmed}`;
  });
}

function augmentWithRelatedDocs(query: string, hits: KBDoc[], allDocs: KBDoc[]): KBDoc[] {
  const augmented: KBDoc[] = [...hits];
  const lowerQuery = query.toLowerCase();

  const ensureDoc = (predicate: (doc: KBDoc) => boolean, priority = false) => {
    const existing = augmented.find(predicate);
    if (existing) return;
    const found = allDocs.find(predicate);
    if (found) {
      if (priority) augmented.unshift(found);
      else augmented.push(found);
    }
  };

  // Ensure protocol documents for any protocol codes mentioned in the query
  const protocolMatches = Array.from(new Set(Array.from(lowerQuery.matchAll(/\b(1[0-3]\d{2})\b/g)).map((match) => match[1])));
  for (const code of protocolMatches) {
    ensureDoc((doc) => doc.title.toLowerCase().includes(code));
  }

  // If the query or existing hits suggest medication guidance, ensure MCG 1309 is present
  const mentionsMedication =
    /\b(dose|dosing|mg|mcg|medication|meds|epinephrine|epi|albuterol|ketorolac|acetaminophen|midazolam|fentanyl|pediatric|weight)\b/.test(
      lowerQuery,
    ) || hits.some((hit) => hit.category.toLowerCase().includes("medication"));
  if (mentionsMedication) {
    ensureDoc(
      (doc) => (doc.subcategory || "").toLowerCase().includes("mcg 1309") || doc.title.toLowerCase().includes("mcg 1309"),
      true,
    );
  }

  // Include base contact guidance when requested explicitly
  if (lowerQuery.includes("base contact")) {
    ensureDoc((doc) => doc.title.toLowerCase().includes("base contact"));
  }

  return augmented;
}
