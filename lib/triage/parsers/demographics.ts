export function parseAge(text: string): number | undefined {
  const ageMatch = text.match(/\b(\d{1,3})\s*(?:yo|y\/o|years? old|y\s?o)\b/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (!isNaN(age) && age > 0 && age < 120) return age;
  }
  return undefined;
}

export function parseSex(text: string): "male" | "female" | "unknown" {
  const lower = text.toLowerCase();
  if (/\b(female|femal|femae|femail|woman|lady|girl|f|fml|fem)\b/.test(lower)) return "female";
  if (/\b(male|man|guy|boy|m)\b/.test(lower)) return "male";
  return "unknown";
}

export function parsePregnancy(text: string): boolean { return /\b(preg|pregnant|gravida|g\d+p\d+)\b/i.test(text); }

export function parseWeightKg(text: string): number | undefined {
  const lower = text.toLowerCase();
  const kgMatch = lower.match(/\b(\d{1,3}(?:\.\d+)?)\s*(?:kg|kilograms?)\b/);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    return (!isNaN(kg) && kg > 1 && kg < 200) ? kg : undefined;
  }
  const lbMatch = lower.match(/\b(\d{1,3}(?:\.\d+)?)\s*(?:lb|lbs|pounds?)\b/);
  if (lbMatch) {
    const lbs = parseFloat(lbMatch[1]);
    if (isNaN(lbs) || lbs <= 2 || lbs >= 440) return undefined;
    const kg = lbs * 0.45359237;
    const rounded = Math.round(kg * 10) / 10;
    return (rounded > 1 && rounded < 200) ? rounded : undefined;
  }
  return undefined;
}


