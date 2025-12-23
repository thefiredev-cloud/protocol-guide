import { useCallback } from "react";

import type { Citation } from "../types/chat";

export type OrdersCitationsController = {
  handleOrders: (text: string | undefined) => void;
  handleCitations: (value: unknown) => void;
};

export function useOrdersCitations(
  setRecentOrders: (orders: string[] | undefined) => void,
  setCitations: (citations: Citation[] | undefined) => void,
): OrdersCitationsController {
  const handleOrders = useCallback(
    (text: string | undefined) => {
      const lines = String(text ?? "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => /base (contact|order)|orders?:/i.test(line));
      const seen = new Set<string>();
      const orders: string[] = [];
      for (const line of lines) {
        if (!seen.has(line)) {
          seen.add(line);
          orders.push(line);
        }
      }
      setRecentOrders(orders.length ? orders : undefined);
    },
    [setRecentOrders],
  );

  const handleCitations = useCallback(
    (value: unknown) => {
      setCitations(Array.isArray(value) ? (value as Citation[]) : undefined);
    },
    [setCitations],
  );

  return { handleOrders, handleCitations };
}
