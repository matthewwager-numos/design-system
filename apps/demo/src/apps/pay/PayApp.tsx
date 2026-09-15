import { Banknote } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type PayAppTab = WorkflowTabId;

export interface PayAppProps {
  tab: PayAppTab;
  onTabChange: (tab: PayAppTab) => void;
}

/** The "Pay" workflow (accounts payable) — one of four independent apps whose own Output feeds Close. Not built yet; see `WorkflowAppShell`. */
export function PayApp({ tab, onTabChange }: PayAppProps) {
  return (
    <WorkflowAppShell
      icon={Banknote}
      title="Pay"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of payment status will live here." },
        inputs: {
          description: "Vendor bills, purchase orders, banking details, and payment approval requests will land here.",
        },
        work: { description: "Line-item payment approval and processing will happen here." },
        output: { description: "Finalized payment data, ready to feed into Close, will appear here." },
        history: { description: "A record of past payment runs will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
