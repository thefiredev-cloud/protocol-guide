import type { TriageResult } from "@/lib/triage";

export function formatDemographics(result: TriageResult): string[] {
  const demo: string[] = [];
  if (result.age) demo.push(`${result.age}y`);
  if (result.sex && result.sex !== "unknown") demo.push(result.sex);
  if (result.pregnant) demo.push("pregnant");
  if (typeof result.weightKg === "number") demo.push(`${result.weightKg}kg`);
  if (result.chiefComplaint) demo.push(result.chiefComplaint + (result.painLocation ? ` (${result.painLocation})` : ""));
  return demo;
}

export function formatVitalsLine(result: TriageResult): string | undefined {
  const v = result.vitals || {};
  const parts: string[] = [];
  const hasBloodPressure = v.systolic !== undefined && v.diastolic !== undefined;
  pushIf(parts, hasBloodPressure, `BP ${v.systolic}/${v.diastolic}`);
  pushIf(parts, !!v.heartRate, `HR ${v.heartRate}`);
  pushIf(parts, !!v.respiratoryRate, `RR ${v.respiratoryRate}`);
  pushIf(parts, !!v.spo2, `SpO2 ${v.spo2}%`);
  pushIf(parts, !!v.temperatureF, `Temp ${v.temperatureF}F`);
  pushIf(parts, !!v.temperatureC, `Temp ${v.temperatureC}C`);
  pushIf(parts, !!v.glucose, `Glucose ${v.glucose}`);
  pushIf(parts, !!v.gcs, `GCS ${v.gcs}`);
  return parts.length ? parts.join(", ") : undefined;
}

function pushIf(list: string[], condition: boolean, value: string) {
  if (condition) list.push(value);
}

export function formatProtocolCandidates(result: TriageResult): string[] {
  const seen = new Set<string>();
  const unique = result.matchedProtocols.filter(mp => {
    const key = mp.tp_code;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
  return unique.map(mp => (
    `- ${mp.pi_name} (${mp.pi_code}) → ${mp.tp_name} ${mp.tp_code}${mp.tp_code_pediatric ? "/" + mp.tp_code_pediatric : ""}`
  ));
}


