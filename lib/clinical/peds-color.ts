export function colorForWeight(weightKg: number): string {
  const ranges: Array<{ min: number; max: number; color: string }> = [
    { min: 3, max: 5, color: "Grey" },
    { min: 6, max: 7, color: "Pink" },
    { min: 8, max: 9, color: "Red" },
    { min: 10, max: 11, color: "Purple" },
    { min: 12, max: 14, color: "Yellow" },
    { min: 15, max: 18, color: "White" },
    { min: 19, max: 22, color: "Blue" },
    { min: 24, max: 28, color: "Orange" },
    { min: 30, max: 36, color: "Green" },
  ];
  for (const r of ranges) {
    if (weightKg >= r.min && weightKg <= r.max) return r.color;
  }
  return "Unknown";
}


