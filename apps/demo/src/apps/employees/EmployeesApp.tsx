import { useState } from "react";
import { Users } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs } from "@numosai/ui";
import { EmployeesProvider, useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import { useMeasuredHeightVar } from "../../useMeasuredHeightVar";
import { OverviewTab } from "./OverviewTab";
import { ObjectManagementTab } from "./ObjectManagementTab";
import { HistoryTab } from "./HistoryTab";
import { SettingsTab } from "./SettingsTab";
import { AddEmployeeWizard } from "./AddEmployeeWizard";

type AppTab = "overview" | "objectManagement" | "history" | "settings";

/**
 * The "Employees" app — the anatomy every left-nav app shares: a header
 * (icon + title + Overview/Object Management/History/Settings tabs) above
 * a scrollable body showing whichever tab is selected. Confirmed from the
 * List & Detail Figma template, which shows this exact anatomy.
 *
 * Renders both the desktop `<Header>` and mobile `<MobileAppHeader>`
 * sharing the same tab state, toggled by the same CSS breakpoint as
 * `<Navigation>`/`<MobileNav>` in App.tsx — the mobile Settings/List &
 * Detail template shows `MobileNav` + `MobileAppHeader` stacked above the
 * page content, confirmed from Figma's own iPhone frames.
 */
export function EmployeesApp() {
  return (
    <EmployeesProvider>
      <EmployeesAppContent />
    </EmployeesProvider>
  );
}

function EmployeesAppContent() {
  const [tab, setTab] = useState<AppTab>("overview");
  const [adding, setAdding] = useState(false);
  const { addEmployee } = useEmployees();
  const showToast = useToast();
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  // Confirmed from Figma: the Wizard fills this whole content container
  // edge-to-edge (Navigation stays put beside it) — it doesn't sit nested
  // under this app's own header/tabs/body like a normal tab's content does.
  if (adding) {
    return (
      <AddEmployeeWizard
        onFinish={(employee) => {
          addEmployee(employee);
          setAdding(false);
          showToast({ status: "positive", title: `Added ${employee.fullName}` });
        }}
        onCancel={() => setAdding(false)}
      />
    );
  }

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Users size={24} />
            </span>
          }
          title="Employees"
          subNav={
            <Tabs value={tab} onValueChange={(value) => setTab(value as AppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="objectManagement">Object Management</Tab>
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
              <Users size={16} />
            </span>
          }
          title="Employees"
          value={tab}
          onValueChange={(value) => setTab(value as AppTab)}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="objectManagement">Object Mgmt</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <OverviewTab />}
        {tab === "objectManagement" && <ObjectManagementTab onAddEmployee={() => setAdding(true)} />}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </>
  );
}
