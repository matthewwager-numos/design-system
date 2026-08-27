import { useState } from "react";
import { CheckSquare } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { TasksProvider } from "../../data/useTasks";
import { OverviewTab } from "./OverviewTab";
import { TasksTab } from "./TasksTab";
import { HistoryTab } from "./HistoryTab";
import { SettingsTab } from "./SettingsTab";

type AppTab = "overview" | "tasks" | "history" | "settings";

/**
 * The "Close Checklist" app — same anatomy every left-nav app shares (see
 * `EmployeesApp`): a header (icon + title + Overview/Tasks/History/Settings
 * tabs) above a scrollable body. Its Tasks tab is the one built out in
 * detail — a kanban board of `<Card>`s per stage with a `<SankeyChart>`
 * (one-color mode) visualizing throughput across those same stages above
 * it, matching the reference design directly.
 */
export function ReconciliationApp() {
  return (
    <TasksProvider>
      <ReconciliationAppContent />
    </TasksProvider>
  );
}

function ReconciliationAppContent() {
  const [tab, setTab] = useState<AppTab>("tasks");
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
          title="Close Checklist"
          subNav={
            <Tabs value={tab} onValueChange={(value) => setTab(value as AppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="tasks">Tasks</Tab>
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
          title="Close Checklist"
          value={tab}
          onValueChange={(value) => setTab(value as AppTab)}
          onIconClick={() => setTab("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="tasks">Tasks</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <OverviewTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </>
  );
}
