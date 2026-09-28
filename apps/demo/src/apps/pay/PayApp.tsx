import { Banknote, Factory, History as HistoryIcon, Inbox, Settings as SettingsIcon, Warehouse } from "lucide-react";
import { EmptyState, Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { OverviewTab } from "./OverviewTab";

export type PayAppTab = "overview" | "inputs" | "work" | "output" | "history" | "settings";

export interface PayAppProps {
  /** Lifted to `App.tsx` (rather than this component's own `useState`) so it survives switching to a different app and back — the last tab you had open here is what you see again next time. */
  tab: PayAppTab;
  onTabChange: (tab: PayAppTab) => void;
}

/**
 * The Pay app (accounts payable) — same header/tabs anatomy every left-nav
 * app shares (see `AccrualsApp`/`CloseApp`/`CollectApp`). "Overview" is the
 * one tab built out so far. The other 5 are still the same stub
 * `<EmptyState>` copy this app had under `<WorkflowAppShell>` before —
 * replace them the same way, one at a time, when they're built out for real.
 */
export function PayApp({ tab, onTabChange }: PayAppProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Banknote size={24} />
            </span>
          }
          title="Pay"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as PayAppTab)}>
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="inputs">Inputs</Tab>
                <Tab value="work">Pay</Tab>
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
              <Banknote size={16} />
            </span>
          }
          title="Pay"
          value={tab}
          onValueChange={(value) => onTabChange(value as PayAppTab)}
          onIconClick={() => onTabChange("overview")}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="inputs">Inputs</Tab>
          <Tab value="work">Pay</Tab>
          <Tab value="output">Output</Tab>
          <Tab value="history">History</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "overview" && <OverviewTab />}
        {tab === "inputs" && (
          <EmptyState icon={<Inbox size={24} />} title="Not built yet" description="Vendor bills, purchase orders, banking details, and payment approval requests will land here." />
        )}
        {tab === "work" && <EmptyState icon={<Factory size={24} />} title="Not built yet" description="Line-item payment approval and processing will happen here." />}
        {tab === "output" && (
          <EmptyState icon={<Warehouse size={24} />} title="Not built yet" description="Finalized payment data, ready to feed into Close, will appear here." />
        )}
        {tab === "history" && <EmptyState icon={<HistoryIcon size={24} />} title="Not built yet" description="A record of past payment runs will appear here." />}
        {tab === "settings" && <EmptyState icon={<SettingsIcon size={24} />} title="Not built yet" description="Configuration for this workflow will live here." />}
      </div>
    </>
  );
}
