import { Inbox } from "lucide-react";
import { EmptyState } from "@numosai/ui";

/** Scaffolded, not built yet — the receiving dock for whatever feeds this month's accrual estimates (vendor invoices, purchase orders, prior actuals). */
export function InputsTab() {
  return (
    <EmptyState
      icon={<Inbox size={24} />}
      title="Not built yet"
      description="Vendor invoices, purchase orders, and prior actuals feeding this month's accrual estimates will land here."
    />
  );
}
