import { Telescope } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type ForecastAppTab = WorkflowTabId;

export interface ForecastAppProps {
  tab: ForecastAppTab;
  onTabChange: (tab: ForecastAppTab) => void;
}

/** The "Forecast" workflow — one of three independent apps fed by Close's own Output. Not built yet; see `WorkflowAppShell`. */
export function ForecastApp({ tab, onTabChange }: ForecastAppProps) {
  return (
    <WorkflowAppShell
      icon={Telescope}
      title="Forecast"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of forecast status will live here." },
        inputs: {
          description: "Close's finished output, prior forecasts, and business drivers like headcount plans and sales pipeline will land here.",
        },
        work: { description: "Line-item forecast modeling will happen here." },
        output: { description: "Forecast figures, ready to inform next month's accrual estimates, will appear here." },
        history: { description: "A record of past forecast runs will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
