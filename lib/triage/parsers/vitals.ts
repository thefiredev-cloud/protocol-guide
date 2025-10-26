/* eslint-disable complexity */
export type Vitals = {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  temperatureF?: number;
  temperatureC?: number;
  glucose?: number;
  gcs?: number;
};

function toNumber(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

export function parseVitals(text: string): Vitals {
  const vitals: Vitals = {};
  const bp = text.match(/\b(?:bp|blood pressure)\s*(\d{2,3})\s*\/\s*(\d{2,3})\b/i);
  if (bp) {
    vitals.systolic = toNumber(bp[1]);
    vitals.diastolic = toNumber(bp[2]);
  }
  const sbp = text.match(/\bsbp\s*(\d{2,3})\b/i);
  if (sbp && !vitals.systolic) vitals.systolic = toNumber(sbp[1]);
  const dbp = text.match(/\bdbp\s*(\d{2,3})\b/i);
  if (dbp && !vitals.diastolic) vitals.diastolic = toNumber(dbp[1]);
  const hr = text.match(/\b(?:hr|heart ?rate|pulse)\s*(\d{2,3})\b/i);
  if (hr) vitals.heartRate = toNumber(hr[1]);
  const rr = text.match(/\b(?:rr|resp(?:iratory)? ?rate|resp)\s*(\d{1,2})\b/i);
  if (rr) vitals.respiratoryRate = toNumber(rr[1]);
  const spo2 = text.match(/\b(?:spo2|o2 sat|oxygen(?: saturation)?)\s*(\d{2,3})\s*%?\b/i);
  if (spo2) vitals.spo2 = toNumber(spo2[1]);
  const tempF = text.match(/\b(?:t|temp(?:erature)?)\s*(\d{2,3}(?:\.\d)?)\s*(?:f|\u00B0f)\b/i);
  const tempC = text.match(/\b(?:t|temp(?:erature)?)\s*(\d{2,3}(?:\.\d)?)\s*(?:c|\u00B0c)\b/i);
  if (tempF) vitals.temperatureF = toNumber(tempF[1]);
  if (tempC) vitals.temperatureC = toNumber(tempC[1]);
  const glucose = text.match(/\b(?:bs|dex(?:tro)?|glucose|bgl)\s*(\d{2,3})\b/i);
  if (glucose) vitals.glucose = toNumber(glucose[1]);
  const gcs = text.match(/\bgcs\s*(\d{1,2})\b/i);
  if (gcs) vitals.gcs = toNumber(gcs[1]);
  return vitals;
}


