import { useState } from "react";

import type { CarePlan, Citation, NarrativeDraft, NemsisNarrative } from "../types/chat";

export function useNarrativeState() {
  const [soap, setSoap] = useState<NarrativeDraft | undefined>(undefined);
  const [chronological, setChronological] = useState<NarrativeDraft | undefined>(undefined);
  const [nemsis, setNemsis] = useState<NemsisNarrative | undefined>(undefined);
  const [carePlan, setCarePlan] = useState<CarePlan | undefined>(undefined);
  const [citations, setCitations] = useState<Citation[] | undefined>(undefined);
  const [recentOrders, setRecentOrders] = useState<string[] | undefined>(undefined);

  function reset() {
    setSoap(undefined);
    setChronological(undefined);
    setNemsis(undefined);
    setCarePlan(undefined);
    setCitations(undefined);
    setRecentOrders(undefined);
  }

  return {
    soap,
    chronological,
    nemsis,
    carePlan,
    citations,
    recentOrders,
    setSoap,
    setChronological,
    setNemsis,
    setCarePlan,
    setCitations,
    setRecentOrders,
    reset,
  };
}
