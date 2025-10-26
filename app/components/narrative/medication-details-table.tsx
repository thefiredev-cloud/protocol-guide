"use client";

import type { CarePlan } from "@/app/types/chat";

export function MedicationDetailsTable({ details }: { details: NonNullable<CarePlan["medicationsDetailed"]> }) {
  return (
    <table className="medication-table">
      <thead>
        <tr>
          <th>Medication</th>
          <th>Details</th>
          <th>Citations</th>
        </tr>
      </thead>
      <tbody>
        {details.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>
              <ul>
                {row.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </td>
            <td>{row.citations.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


