import { useState } from "react";
import { Users } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import { OverviewTab } from "./OverviewTab";
import { ObjectManagementTab } from "./ObjectManagementTab";
import { HistoryTab } from "./HistoryTab";
import { SettingsTab } from "./SettingsTab";
import { AddEmployeeWizard } from "./AddEmployeeWizard";

export type EmployeesAppTab = "overview" | "objectManagement" | "history" | "settings";

export interface EmployeesAppProps {
  /** Lifted to `App.tsx` (rather than this component's own `useState`) so it survives switching to a different app and back — the last tab you had open here is what you see again next time. */
  tab: EmployeesAppTab;
  onTabChange: (tab: EmployeesAppTab) => void;
}

/**
 * The "People" app — the anatomy every left-nav app shares: a header
 * (icon + title + Overview/People/History/Settings tabs) above
 * a scrollable body showing whichever tab is selected. Confirmed from the
 * List & Detail Figma template, which shows this exact anatomy.
 *
 * Renders both the desktop `<Header>` and mobile `<MobileAppHeader>`
 * sharing the same tab state, toggled by the same CSS breakpoint as
 * `<Navigation>`/`<MobileNav>` in App.tsx — the mobile Settings/List &
 * Detail template shows `MobileNav` + `MobileAppHeader` stacked above the
 * page content, confirmed from Figma's own iPhone frames.
 */
export function EmployeesApp({ tab, onTabChange }: EmployeesAppProps) {
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
          title="People"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as EmployeesAppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="objectManagement">People</Tab>
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
          title="People"
          value={tab}
          onValueChange={(value) => onTabChange(value as EmployeesAppTab)}
          onIconClick={() => onTabChange("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="objectManagement">People</Tab>
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
