"use client";

import { useCallback } from "react";

import { CarePlanSection } from "@/app/components/narrative/care-plan-section";
import { CitationsSection } from "@/app/components/narrative/citations-section";
import { EmptyNarrativeState } from "@/app/components/narrative/empty-narrative-state";
import { NarrativeSections } from "@/app/components/narrative/narrative-sections";
import { NemsisSection } from "@/app/components/narrative/nemsis-section";
import { OrdersSection } from "@/app/components/narrative/orders-section";
import type { CarePlan, Citation, NarrativeDraft, NemsisNarrative } from "@/app/types/chat";

type CandidateInput = {
  soap?: NarrativeDraft;
  chronological?: NarrativeDraft;
  nemsis?: NemsisNarrative;
  carePlan?: CarePlan | null;
  citations?: Citation[];
  recentOrders?: string[];
};

type RenderCandidate = {
  shouldRender: boolean;
  node: JSX.Element | null;
};

function draftHasLines(draft?: NarrativeDraft): boolean {
  if (!draft) return false;
  return draft.sections.some((section) => (section.lines || []).some((line) => line.trim().length > 0));
}

function buildCandidates({ soap, chronological, nemsis, carePlan, citations, recentOrders }: CandidateInput): RenderCandidate[] {
  return [
    { shouldRender: Boolean(recentOrders?.length), node: recentOrders ? <OrdersSection orders={recentOrders} /> : null },
    { shouldRender: draftHasLines(soap), node: soap ? <NarrativeSections draft={soap} label="SOAP Narrative" /> : null },
    {
      shouldRender: draftHasLines(chronological),
      node: chronological ? <NarrativeSections draft={chronological} label="Chronological Narrative" /> : null,
    },
    {
      shouldRender: Boolean(nemsis && (nemsis.eSituation?.primaryComplaint || nemsis.eVitals?.length)),
      node: nemsis ? <NemsisSection nemsis={nemsis} /> : null,
    },
    { shouldRender: Boolean(carePlan), node: carePlan ? <CarePlanSection carePlan={carePlan} /> : null },
    { shouldRender: Boolean(citations?.length), node: citations ? <CitationsSection citations={citations} /> : null },
  ];
}

export function NarrativePanel({
  soap,
  chronological,
  nemsis,
  carePlan,
  citations,
  recentOrders,
  onBuildNarrative,
}: {
  soap?: NarrativeDraft;
  chronological?: NarrativeDraft;
  nemsis?: NemsisNarrative;
  carePlan?: CarePlan | null;
  citations?: Citation[];
  recentOrders?: string[];
  onBuildNarrative?: () => Promise<void>;
}) {
  const candidates = buildCandidates({ soap, chronological, nemsis, carePlan, citations, recentOrders });
  const sections = candidates.filter((candidate) => candidate.shouldRender && candidate.node !== null);
  const handleBuild = useCallback(() => {
    void onBuildNarrative?.();
  }, [onBuildNarrative]);
  if (!sections.length) return <EmptyNarrativeState onBuild={handleBuild} />;

  return (
    <div className="narrative-panel" style={{ marginTop: "16px" }}>
      {sections.map((candidate, index) => (
        <div key={index}>{candidate.node}</div>
      ))}
    </div>
  );
}
