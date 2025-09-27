"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function DosingPage() {
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

  const selected = useMemo(() => medications.find((m) => m.id === form.medicationId), [form.medicationId, medications]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <div className="dosingPage">
      <h1>Medication Dosing</h1>
      <form onSubmit={onSubmit} className="dosingForm">
        <div className="row">
          <label htmlFor="medication">Medication</label>
          <select
            id="medication"
            value={form.medicationId}
            onChange={(e) => setForm((s) => ({ ...s, medicationId: e.target.value }))}
          >
            {medications.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <label htmlFor="weightKg">Weight (kg)</label>
          <input
            id="weightKg"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={form.weightKg ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, weightKg: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="e.g., 70"
          />
        </div>

        <div className="row">
          <label htmlFor="ageYears">Age (years)</label>
          <input
            id="ageYears"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={form.ageYears ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, ageYears: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="e.g., 30"
          />
        </div>

        <div className="row">
          <label htmlFor="route">Route</label>
          <select id="route" value={form.route ?? ""} onChange={(e) => setForm((s) => ({ ...s, route: e.target.value || undefined }))}>
            <option value="">Auto</option>
            <option value="IM">IM</option>
            <option value="IV">IV</option>
            <option value="IO">IO</option>
            <option value="Neb">Neb</option>
            <option value="IN">IN</option>
            <option value="SL">SL</option>
          </select>
        </div>

        <div className="row">
          <label htmlFor="scenario">Scenario</label>
          <input
            id="scenario"
            type="text"
            value={form.scenario ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, scenario: e.target.value || undefined }))}
            placeholder="e.g., anaphylaxis, arrest, stridor"
          />
        </div>

        <div className="row">
          <label htmlFor="sbp">Systolic BP</label>
          <input
            id="sbp"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={form.sbp ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, sbp: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="e.g., 100"
          />
        </div>

        <div className="row">
          <button type="submit" disabled={loading}>
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="results">
          <h2>{result.medicationName}</h2>
          {selected?.aliases?.length ? <p className="aliases">Aliases: {selected.aliases.join(", ")}</p> : null}
          {result.warnings?.length ? (
            <ul className="warnings">
              {result.warnings.map((w, i) => (
                <li key={`warn-${i}`}>{w}</li>
              ))}
            </ul>
          ) : null}
          <ul className="recs">
            {result.recommendations.map((r, i) => (
              <li key={`rec-${i}`} className="rec">
                <div className="recHeader">
                  <strong>{r.label}</strong> — Route: {r.route}
                </div>
                <div className="dose">
                  Dose: {r.dose.quantity} {r.dose.unit}
                  {r.concentration?.label ? ` @ ${r.concentration.label}` : ""}
                </div>
                {r.repeat ? (
                  <div className="repeat">Repeat: {r.repeat.intervalMinutes} min{r.repeat.maxRepeats ? ` × ${r.repeat.maxRepeats}` : ""}{r.repeat.criteria ? ` — ${r.repeat.criteria}` : ""}</div>
                ) : null}
                {r.administrationNotes?.length ? (
                  <ul className="notes">
                    {r.administrationNotes.map((n, j) => (
                      <li key={`note-${i}-${j}`}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {result.citations?.length ? <div className="citations">Citations: {result.citations.join(", ")}</div> : null}
        </div>
      ) : null}

      <style jsx>{`
        .dosingPage { padding: 16px; max-width: 720px; margin: 0 auto; }
        .dosingForm { display: grid; gap: 12px; }
        .row { display: grid; gap: 6px; }
        .error { margin-top: 12px; color: #b00020; }
        .results { margin-top: 20px; }
        .recs { display: grid; gap: 12px; padding-left: 16px; }
        .rec { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
        .recHeader { margin-bottom: 6px; }
        .warnings { color: #92400e; background: #fffbeb; padding: 8px 12px; border-radius: 6px; }
        .aliases, .citations { margin-top: 6px; color: #6b7280; }
      `}</style>
    </div>
  );
}


