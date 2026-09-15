import { FlaskConical } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type AnalyzeAppTab = WorkflowTabId;

export interface AnalyzeAppProps {
  tab: AnalyzeAppTab;
  onTabChange: (tab: AnalyzeAppTab) => void;
}

/** The "Analyze" workflow — one of three independent apps fed by Close's own Output. Not built yet; see `WorkflowAppShell`. */
export function AnalyzeApp({ tab, onTabChange }: AnalyzeAppProps) {
  return (
    <WorkflowAppShell
      icon={FlaskConical}
      title="Analyze"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of analysis status will live here." },
        inputs: {
          description: "Close's finished output, plus budget and prior-period actuals to compare it against, will land here.",
        },
        work: { description: "Line-item variance and trend analysis will happen here." },
        output: { description: "Finalized findings, ready to inform next month's cycle, will appear here." },
        history: { description: "A record of past analysis runs will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
