import { RadioTower } from "lucide-react";
import { WorkflowAppShell } from "../../components/WorkflowAppShell";
import type { WorkflowTabId } from "../../components/WorkflowAppShell";

export type CommunicateAppTab = WorkflowTabId;

export interface CommunicateAppProps {
  tab: CommunicateAppTab;
  onTabChange: (tab: CommunicateAppTab) => void;
}

/**
 * The "Communicate" workflow — one of three independent apps fed by
 * Close's own Output, and the one most likely to *exit* the feedback loop
 * (a filed report has no further "output" of its own) — except when a
 * communication (a board deck, an investor update) draws a reaction:
 * questions, follow-up requests, action items. Capturing that reaction is
 * exactly what keeps this app inside the loop too — see the `output` tab's
 * own copy below. Not built yet; see `WorkflowAppShell`.
 */
export function CommunicateApp({ tab, onTabChange }: CommunicateAppProps) {
  return (
    <WorkflowAppShell
      icon={RadioTower}
      title="Communicate"
      tab={tab}
      onTabChange={onTabChange}
      tabs={{
        overview: { description: "A control-tower summary of communication status will live here." },
        inputs: { description: "Close's finished output will land here." },
        work: { description: "Board decks, investor updates, and management reports will be assembled here." },
        output: {
          description:
            "Finished communications will appear here — alongside feedback captured from delivering them (board minutes, follow-up questions, action items), ready to inform next cycle's Analyze and Forecast.",
        },
        history: { description: "A record of past communications will appear here." },
        settings: { description: "Configuration for this workflow will live here." },
      }}
    />
  );
}
