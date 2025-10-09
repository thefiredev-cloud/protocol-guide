"use client";

import type { CarePlan } from "@/app/types/chat";

export function WeightBasedTable({ weightBased }: { weightBased: NonNullable<CarePlan["weightBased"]> }) {
  return (
    <div className="weight-table">
      <h3>Weight-Based Dosing (MCG 1309)</h3>
      <table>
        <thead>
          <tr>
            <th>Medication</th>
            <th>Route</th>
            <th>Dose / kg</th>
            <th>Range</th>
            <th>Citations</th>
          </tr>
        </thead>
        <tbody>
          {weightBased.map((entry) => (
            <tr key={`${entry.name}-${entry.route}`}>
              <td>{entry.name}</td>
              <td>{entry.route}</td>
              <td>{entry.dosePerKg}</td>
              <td>{entry.range}</td>
              <td>{entry.citations.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


