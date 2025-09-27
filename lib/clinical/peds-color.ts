export function colorForWeight(weightKg: number): string {
  if (weightKg >= 3 && weightKg <= 5) return "Grey";
  if (weightKg >= 6 && weightKg <= 7) return "Pink";
  if (weightKg >= 8 && weightKg <= 9) return "Red";
  if (weightKg >= 10 && weightKg <= 11) return "Purple";
  if (weightKg >= 12 && weightKg <= 14) return "Yellow";
  if (weightKg >= 15 && weightKg <= 18) return "White";
  if (weightKg >= 19 && weightKg <= 22) return "Blue";
  if (weightKg >= 24 && weightKg <= 28) return "Orange";
  if (weightKg >= 30 && weightKg <= 36) return "Green";
  return "Unknown";
}


