import { describe, expect, it } from 'vitest';

import { parseAge, parsePregnancy, parseSex, parseWeightKg } from '../../lib/triage/parsers/demographics';
import { parseVitals } from '../../lib/triage/parsers/vitals';
import { parseAllergies, parseMedications } from '../../lib/triage/parsers/history';
import { parseChiefComplaint } from '../../lib/triage/parsers/chief-complaint';

describe('triage parsers', () => {
  it('parses demographics', () => {
    expect(parseAge('45 yo male')).toBe(45);
    expect(parseSex('female')).toBe('female');
    expect(parseSex('m')).toBe('male');
    expect(parsePregnancy('pregnant 20 weeks')).toBe(true);
    expect(parseWeightKg('150 lb')).toBeCloseTo(68, 0);
    expect(parseWeightKg('70 kg')).toBe(70);
  });

  it('parses vitals', () => {
    const v = parseVitals('BP 120/80 HR 90 RR 16 SpO2 98% Temp 99F Glucose 120 GCS 15');
    expect(v.systolic).toBe(120);
    expect(v.diastolic).toBe(80);
    expect(v.heartRate).toBe(90);
    expect(v.respiratoryRate).toBe(16);
    expect(v.spo2).toBe(98);
    expect(v.temperatureF).toBe(99);
    expect(v.glucose).toBe(120);
    expect(v.gcs).toBe(15);
  });

  it('parses allergies and medications', () => {
    expect(parseAllergies('Allergies: Penicillin, Nuts and Latex')).toEqual(['Penicillin', 'Nuts', 'Latex']);
    expect(parseAllergies('NKDA')).toEqual(['NKDA']);
    expect(parseMedications('Meds: Metformin / Lisinopril and ASA')).toEqual(['Metformin', 'Lisinopril', 'ASA']);
  });

  it('parses chief complaints', () => {
    expect(parseChiefComplaint('Patient with CP and diaphoresis').cc).toBe('chest pain');
    expect(parseChiefComplaint('RUQ pain nausea').painLocation).toBe('RUQ');
    expect(parseChiefComplaint('Shortness of breath with wheezing').cc).toBe('shortness of breath');
  });
});


