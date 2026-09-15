import { Inbox } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type CollectAppTab = WorkflowTabId;

export interface CollectAppProps {
  tab: CollectAppTab;
  onTabChange: (tab: CollectAppTab) => void;
}

/** The "Collect" workflow (accounts receivable) — one of four independent apps whose own Output feeds Close. Not built yet; see `WorkflowAppShell`. */
export function CollectApp({ tab, onTabChange }: CollectAppProps) {
  return (
    <WorkflowAppShell
      icon={Inbox}
      title="Collect"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of collections status will live here." },
        inputs: { description: "Invoices and payment data will land here." },
        work: { description: "Line-item collection tracking will happen here." },
        output: { description: "Finalized collections data, ready to feed into Close, will appear here." },
        history: { description: "A record of past collection runs will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
