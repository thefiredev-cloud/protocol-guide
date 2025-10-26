"use client";

import type { CarePlan } from "@/app/types/chat";

import { ActionsList } from "./actions/actions-list";
import { BaseContactAlert } from "./base-contact-alert";
import { MedicationDetailsTable } from "./medication-details-table";
import { MedicationSection } from "./medication-section";
import { WeightBasedTable } from "./weight-based-table";

export function CarePlanSection({ carePlan }: { carePlan: CarePlan }) {
  return (
    <section className="panel-section">
      <h2>Care Plan</h2>
      <p>
        Protocol {carePlan.protocolCode} – {carePlan.protocolTitle}
      </p>

      <BaseContactAlert baseContact={carePlan.baseContact} />
      <ActionsList actions={carePlan.actions} />
      <MedicationSection medications={carePlan.basicMedications} />

      {carePlan.medicationsDetailed?.length ? (
        <MedicationDetailsTable details={carePlan.medicationsDetailed} />
      ) : null}
      {carePlan.weightBased?.length ? (
        <WeightBasedTable weightBased={carePlan.weightBased} />
      ) : null}
      {carePlan.criticalNotes?.length ? (
        <>
          <h3>Critical Notes</h3>
          <ul>
            {carePlan.criticalNotes.map((note, index) => (
              <li key={index} style={{ color: "var(--critical-red-light)" }}>{note}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}


