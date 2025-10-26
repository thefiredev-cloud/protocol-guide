"use client";

import { SectionCard } from "./section-card";

export function OrdersSection({ orders }: { orders: string[] }) {
  if (!orders?.length) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3>Recent Base Orders / Notes</h3>
      <SectionCard title="Orders" items={orders} />
    </div>
  );
}


