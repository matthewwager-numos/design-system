import { Inbox } from "lucide-react";
import { EmptyState } from "@numosai/ui";

/** Scaffolded, not built yet — the receiving dock for Collect/Pay/Accrue/Reconcile's own finished Output, all converging here. */
export function InputsTab() {
  return (
    <EmptyState
      icon={<Inbox size={24} />}
      title="Not built yet"
      description="Collect, Pay, Accrue, and Reconcile's own finished Output will land here."
    />
  );
}
