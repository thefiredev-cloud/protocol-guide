"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MedicationRef = { id: string; name: string; aliases: string[]; categories: string[] };

type DoseForm = {
  medicationId: string;
  weightKg?: number;
  ageYears?: number;
  route?: string;
  scenario?: string;
  sbp?: number;
};

type Recommendation = {
  label: string;
  route: string;
  dose: { quantity: number; unit: string };
  concentration?: { label?: string; amount: number; amountUnit: string; volume: number; volumeUnit: string };
  repeat?: { intervalMinutes: number; maxRepeats?: number; criteria?: string };
  administrationNotes?: string[];
};

type CalcResult = {
  medicationId: string;
  medicationName: string;
  recommendations: Recommendation[];
  warnings: string[];
  citations: string[];
};

export function useDosingViewModel() {
  const [medications, setMedications] = useState<MedicationRef[]>([]);
  const [form, setForm] = useState<DoseForm>({ medicationId: "epinephrine" });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/dosing")
      .then((r) => r.json())
      .then((data) => setMedications(data.medications ?? []))
      .catch(() => setMedications([]));
  }, []);

  const selectedMedication = useMemo(
    () => medications.find((m) => m.id === form.medicationId),
    [form.medicationId, medications],
  );

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const payload = {
      medicationId: form.medicationId,
      request: {
        patientWeightKg: form.weightKg,
        patientAgeYears: form.ageYears,
        route: form.route,
        scenario: form.scenario,
        systolicBP: form.sbp,
      },
    };
    try {
      const res = await fetch("/api/dosing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as CalcResult;
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  return {
    medications,
    form,
    setForm,
    result,
    error,
    loading,
    selectedMedication,
    submit,
  } as const;
}


