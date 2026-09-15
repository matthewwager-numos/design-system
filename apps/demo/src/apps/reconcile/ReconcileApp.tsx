import { Scale } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type ReconcileAppTab = WorkflowTabId;

export interface ReconcileAppProps {
  tab: ReconcileAppTab;
  onTabChange: (tab: ReconcileAppTab) => void;
}

/**
 * The "Reconcile" workflow — one of four independent apps whose own Output
 * feeds Close. Distinct from the `close` app (`apps/close/CloseApp.tsx`),
 * which used to be folder-named `reconciliation` before this pass renamed
 * it to match its true identity as the Close hub. Not built yet; see
 * `WorkflowAppShell`.
 */
export function ReconcileApp({ tab, onTabChange }: ReconcileAppProps) {
  return (
    <WorkflowAppShell
      icon={Scale}
      title="Reconcile"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of reconciliation status will live here." },
        inputs: {
          description: "Bank statements, sub-ledger balances, and the GL trial balance to compare against each other will land here.",
        },
        work: { description: "Line-item account reconciliation will happen here." },
        output: { description: "Finalized, reconciled balances, ready to feed into Close, will appear here." },
        history: { description: "A record of past reconciliation runs will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
