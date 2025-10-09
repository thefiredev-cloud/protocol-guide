"use client";

import { useDosingViewModel } from "@/app/hooks/use-dosing-view-model";

export default function DosingPage() {
  const { medications, form, setForm, result, error, loading, selectedMedication, submit } = useDosingViewModel();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
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
          {selectedMedication?.aliases?.length ? <p className="aliases">Aliases: {selectedMedication.aliases.join(", ")}</p> : null}
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


