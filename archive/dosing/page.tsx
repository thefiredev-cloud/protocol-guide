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
        .dosingPage { padding: 24px; max-width: 1200px; margin: 0 auto; }
        .dosingForm { 
          display: grid; 
          gap: 20px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) and (orientation: landscape) {
          .dosingForm {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px 32px;
          }
          .row:last-of-type {
            grid-column: 1 / -1;
          }
        }
        .row { display: grid; gap: 10px; }
        .row label {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .row input,
        .row select {
          min-height: 56px;
          font-size: 18px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: var(--surface-elevated);
          color: var(--text-primary);
        }
        .row button {
          min-height: 64px;
          font-size: 20px;
          font-weight: 700;
          border-radius: 14px;
          margin-top: 12px;
        }
        .error { margin-top: 20px; padding: 16px; color: #b00020; font-size: 17px; background: #ffebee; border-radius: 12px; }
        .results { margin-top: 32px; padding: 24px; background: var(--surface-elevated); border-radius: 16px; }
        .results h2 { font-size: 32px; font-weight: 800; margin-bottom: 16px; }
        .recs { display: grid; gap: 16px; padding-left: 0; list-style: none; margin-top: 20px; }
        .rec { padding: 20px; border: 3px solid var(--border); border-radius: 14px; background: var(--surface); }
        .recHeader { margin-bottom: 12px; font-size: 20px; }
        .dose { font-size: 28px; font-weight: 800; color: var(--accent); margin: 12px 0; }
        .repeat { font-size: 17px; color: var(--text-secondary); margin: 10px 0; }
        .warnings { color: #92400e; background: #fffbeb; padding: 16px 20px; border-radius: 12px; margin: 16px 0; font-size: 17px; }
        .aliases, .citations { margin-top: 12px; color: var(--text-secondary); font-size: 16px; }
        .notes { margin-top: 12px; font-size: 16px; line-height: 1.6; }
      `}</style>
    </div>
  );
}


