import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Factory, History as HistoryIcon, Inbox, Settings as SettingsIcon, TowerControl, Warehouse } from "lucide-react";
import { EmptyState, Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";

/**
 * The 6 tabs every workflow app's factory-metaphor template defines, in
 * display order — fixed, not configurable per app, since the template
 * itself (Overview = control tower, Inputs = receiving dock, Work =
 * assembly line, Output = finished-goods warehouse, History = production
 * record, Settings = factory configuration) is the point. The "work" tab's
 * own displayed label isn't the generic word "Work", though — it's the
 * app's own name (e.g. Collect's assembly-line tab just reads "Collect"),
 * matching the same eponymous-tab convention `AccrualsApp`'s "Accrue" tab
 * and `CloseApp`'s "Close" tab already use.
 */
export type WorkflowTabId = "overview" | "inputs" | "work" | "output" | "history" | "settings";

const TAB_IDS: WorkflowTabId[] = ["overview", "inputs", "work", "output", "history", "settings"];

const STATIC_TAB_LABELS: Record<Exclude<WorkflowTabId, "work">, string> = {
  overview: "Overview",
  inputs: "Inputs",
  output: "Output",
  history: "History",
  settings: "Settings",
};

function tabLabel(id: WorkflowTabId, title: string): string {
  return id === "work" ? title : STATIC_TAB_LABELS[id];
}

/**
 * One icon per tab *type*, not per app — matching the factory metaphor
 * itself (a control tower, a receiving dock, an assembly line, a finished-
 * goods warehouse, a production record, factory configuration) rather than
 * each app's own header icon, so the same tab reads the same way whichever
 * of the six stub apps you're looking at.
 */
const DEFAULT_TAB_ICONS: Record<WorkflowTabId, LucideIcon> = {
  overview: TowerControl,
  inputs: Inbox,
  work: Factory,
  output: Warehouse,
  history: HistoryIcon,
  settings: SettingsIcon,
};

export interface WorkflowStubTab {
  /** Typically a lucide icon at size 24. Defaults to this tab type's own template icon (see `DEFAULT_TAB_ICONS`) — only pass this to override it for one specific app. */
  icon?: ReactNode;
  /** Defaults to "Not built yet" if omitted. */
  title?: ReactNode;
  description?: ReactNode;
}

export interface WorkflowAppShellProps {
  /** A lucide icon component (not a pre-sized element) — rendered at both the desktop (24) and mobile (16) sizes `<Header>`/`<MobileAppHeader>` need, so callers only specify it once. */
  icon: LucideIcon;
  title: string;
  tab: WorkflowTabId;
  onTabChange: (tab: WorkflowTabId) => void;
  /** One entry per `WorkflowTabId` above, rendered as an `<EmptyState>` in the body when that tab is selected. */
  tabs: Record<WorkflowTabId, WorkflowStubTab>;
}

/**
 * Shared header/tabs/body anatomy for a not-yet-built workflow app — the
 * same `desktop-app-header`/`mobile-app-header`/`app-body` shape every real
 * app (`AccrualsApp`, `CloseApp`, `TeamApp`) hand-rolls, minus the per-tab
 * content files, since there's no real content yet. Each tab's body is just
 * an `<EmptyState>` per the `tabs` config — when an app graduates from stub
 * to real, replace the `<WorkflowAppShell>` call in that app's own file with
 * the same hand-rolled shell the real apps use, plus real per-tab files;
 * nothing else (nav, routing) needs to change.
 */
export function WorkflowAppShell({ icon: Icon, title, tab, onTabChange, tabs }: WorkflowAppShellProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Icon size={24} />
            </span>
          }
          title={title}
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as WorkflowTabId)}>
              <TabList>
                {TAB_IDS.map((id) => (
                  <Tab key={id} value={id}>
                    {tabLabel(id, title)}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          }
        />
      </div>

      <div className="mobile-app-header" ref={mobileHeaderRef}>
        <MobileAppHeader
          icon={
            <span className="app-icon-tile app-icon-tile--sm">
              <Icon size={16} />
            </span>
          }
          title={title}
          value={tab}
          onValueChange={(value) => onTabChange(value as WorkflowTabId)}
          onIconClick={() => onTabChange("overview")}
        >
          {TAB_IDS.map((id) => (
            <Tab key={id} value={id}>
              {tabLabel(id, title)}
            </Tab>
          ))}
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {TAB_IDS.map((id) => {
          if (tab !== id) return null;
          const DefaultIcon = DEFAULT_TAB_ICONS[id];
          return (
            <EmptyState
              key={id}
              icon={tabs[id].icon ?? <DefaultIcon size={24} />}
              title={tabs[id].title ?? "Not built yet"}
              description={tabs[id].description}
            />
          );
        })}
      </div>
    </>
  );
}
