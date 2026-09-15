import { CheckSquare } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { TasksProvider } from "../../data/useTasks";
import { OverviewTab } from "./OverviewTab";
import { InputsTab } from "./InputsTab";
import { TasksTab } from "./TasksTab";
import { HistoryTab } from "./HistoryTab";
import { SettingsTab } from "./SettingsTab";

export type CloseAppTab = "overview" | "inputs" | "tasks" | "history" | "settings";

export interface CloseAppProps {
  /** Lifted to `App.tsx` (rather than this component's own `useState`) so it survives switching to a different app and back — the last tab you had open here is what you see again next time. */
  tab: CloseAppTab;
  onTabChange: (tab: CloseAppTab) => void;
}

/**
 * The "Close" app — the hub where Collect/Pay/Accrue/Reconcile's own
 * Output all feed in, and whose own Output in turn feeds Analyze/Forecast/
 * Report. Same anatomy every left-nav app shares (see `TeamApp`): a header
 * (icon + title + Overview/Inputs/Close/History/Settings tabs) above a
 * scrollable body. Its own eponymous tab is the one built out in detail —
 * a kanban board of `<Card>`s per stage with a `<SankeyChart>` (one-color mode) visualizing
 * throughput across those same stages above it, matching the reference
 * design directly.
 */
export function CloseApp({ tab, onTabChange }: CloseAppProps) {
  return (
    <TasksProvider>
      <CloseAppContent tab={tab} onTabChange={onTabChange} />
    </TasksProvider>
  );
}

function CloseAppContent({ tab, onTabChange }: CloseAppProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <CheckSquare size={24} />
            </span>
          }
          title="Close"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as CloseAppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="inputs">Inputs</Tab>
                <Tab value="tasks">Close</Tab>
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
              <CheckSquare size={16} />
            </span>
          }
          title="Close"
          value={tab}
          onValueChange={(value) => onTabChange(value as CloseAppTab)}
          onIconClick={() => onTabChange("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="inputs">Inputs</Tab>
          <Tab value="tasks">Close</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <OverviewTab />}
        {tab === "inputs" && <InputsTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </>
  );
}
