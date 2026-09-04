import { Calculator } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { OverviewTab } from "./OverviewTab";
import { TableTab } from "./TableTab";
import { HistoryTab } from "./HistoryTab";
import { SettingsTab } from "./SettingsTab";

export type AccrualsAppTab = "overview" | "table" | "history" | "settings";

export interface AccrualsAppProps {
  /** Lifted to `App.tsx` (rather than this component's own `useState`) so it survives switching to a different app and back — the last tab you had open here is what you see again next time. */
  tab: AccrualsAppTab;
  onTabChange: (tab: AccrualsAppTab) => void;
}

/**
 * The Accruals app — same header/tabs anatomy every left-nav app shares
 * (see `ReconciliationApp`/`EmployeesApp`). Its Table tab is the one built
 * out in detail: a region → country breakdown with collapsible region
 * rows, matching the reference design directly.
 */
export function AccrualsApp({ tab, onTabChange }: AccrualsAppProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Calculator size={24} />
            </span>
          }
          title="Accruals"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as AccrualsAppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="table">Table</Tab>
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
              <Calculator size={16} />
            </span>
          }
          title="Accruals"
          value={tab}
          onValueChange={(value) => onTabChange(value as AccrualsAppTab)}
          onIconClick={() => onTabChange("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="table">Table</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <OverviewTab />}
        {tab === "table" && <TableTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </>
  );
}
