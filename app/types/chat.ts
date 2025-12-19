export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  citations?: Citation[];
};

export type NarrativeSection = {
  title: string;
  lines: string[];
};

export type NarrativeDraft = {
  template: string;
  sections: NarrativeSection[];
};

export type NarrativeMedicationEntry = {
  time?: string;
  name: string;
  dose?: string;
  route?: string;
  response?: string;
};

export type NarrativeProcedureEntry = {
  time?: string;
  name: string;
  response?: string;
};

export type NarrativeVitalEntry = {
  time?: string;
  bp?: string;
  hr?: string;
  rr?: string;
  spo2?: string;
  gcs?: string;
  temp?: string;
};

export type NemsisNarrative = {
  eTimes?: {
    unitNotified?: string;
    unitEnRoute?: string;
    unitArrived?: string;
    patientContact?: string;
    departScene?: string;
    arriveDest?: string;
    transfer?: string;
  };
  eSituation?: {
    primaryComplaint?: string;
    providerPrimaryImpression?: string;
    providerSecondaryImpression?: string;
    mechanismOfInjury?: string;
    causeOfInjury?: string;
  };
  eVitals?: NarrativeVitalEntry[];
  eMedications?: NarrativeMedicationEntry[];
  eProcedures?: NarrativeProcedureEntry[];
  eProtocols?: string[]; // LA County TP codes used
  eDisposition?: {
    destination?: string;
    destinationFacility?: string;
    transportMode?: string;
    transportPriority?: string; // Code 2, Code 3, etc.
    condition?: string;
    patientCondition?: string;
  };
  baseContact?: {
    time?: string;
    hospital?: string;
    hospitalPhone?: string;
    physician?: string;
    ordersReceived?: string[];
    summary?: string;
  };
};

export type CarePlan = {
  protocolCode: string;
  protocolTitle: string;
  actions: string[];
  baseContact: string;
  basicMedications: string[];
  criticalNotes: string[];
  protocolReferences?: string[]; // LA County TP codes referenced
  medicationsDetailed?: Array<{
    name: string;
    details: string[];
    citations: string[];
  }>;
  weightBased?: Array<{
    name: string;
    route: string;
    dosePerKg: string;
    range: string;
    citations: string[];
  }>;
};

export type Citation = {
  title: string;
  category: string;
  subcategory?: string;
  referenceNumber?: string; // LA County Reference number (e.g., "510", "506")
  protocolCode?: string; // LA County TP code (e.g., "1211", "1237-P")
};
