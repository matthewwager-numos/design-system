import { Inbox, History as HistoryIcon, Settings as SettingsIcon, TowerControl, Warehouse } from "lucide-react";
import { EmptyState, Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { WorkTab } from "./WorkTab";

export type CollectAppTab = "overview" | "inputs" | "work" | "output" | "history" | "settings";

export interface CollectAppProps {
  /** Lifted to `App.tsx` (rather than this component's own `useState`) so it survives switching to a different app and back — the last tab you had open here is what you see again next time. */
  tab: CollectAppTab;
  onTabChange: (tab: CollectAppTab) => void;
}

/**
 * The Collect app (accounts receivable) — same header/tabs anatomy every
 * left-nav app shares (see `AccrualsApp`/`CloseApp`). Its own eponymous
 * "Collect" tab (`WorkTab`) is the one built out so far: a `<TaskList>` of
 * prescribed bulk actions, each opening a full-screen review flow. The
 * other 5 tabs are still the same stub `<EmptyState>` copy this app had
 * under `<WorkflowAppShell>` before — replace them the same way, one at a
 * time, when they're built out for real.
 */
export function CollectApp({ tab, onTabChange }: CollectAppProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Inbox size={24} />
            </span>
          }
          title="Collect"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as CollectAppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="inputs">Inputs</Tab>
                <Tab value="work">Collect</Tab>
                <Tab value="output">Output</Tab>
                <Tab value="history">History</Tab>
                <Tab value="settings">Settings</Tab>
              </TabList>
            </Tabs>
          }
        />
      </div>

      <div className="mobile-app-header" ref={mobileHeaderRef}>
        <MobileAppHeader
          icon={
            <span className="app-icon-tile app-icon-tile--sm">
              <Inbox size={16} />
            </span>
          }
          title="Collect"
          value={tab}
          onValueChange={(value) => onTabChange(value as CollectAppTab)}
          onIconClick={() => onTabChange("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="inputs">Inputs</Tab>
          <Tab value="work">Collect</Tab>
          <Tab value="output">Output</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <EmptyState icon={<TowerControl size={24} />} title="Not built yet" description="A control-tower summary of collections status will live here." />}
        {tab === "inputs" && (
          <EmptyState icon={<Inbox size={24} />} title="Not built yet" description="Customer invoices, payment terms, incoming remittances, and aging data will land here." />
        )}
        {tab === "work" && <WorkTab />}
        {tab === "output" && (
          <EmptyState icon={<Warehouse size={24} />} title="Not built yet" description="Finalized collections data, ready to feed into Close, will appear here." />
        )}
        {tab === "history" && <EmptyState icon={<HistoryIcon size={24} />} title="Not built yet" description="A record of past collection runs will appear here." />}
        {tab === "settings" && <EmptyState icon={<SettingsIcon size={24} />} title="Not built yet" description="Configuration for this workflow will live here." />}
      </div>
    </>
  );
}
