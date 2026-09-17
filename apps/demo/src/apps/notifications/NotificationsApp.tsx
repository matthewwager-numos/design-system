import { Bell } from "lucide-react";
import { Header, MobileAppHeader, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { InboxTab } from "./InboxTab";
import { SettingsTab } from "./SettingsTab";

export type NotificationsAppTab = "inbox" | "settings";

export interface NotificationsAppProps {
  /** Lifted to `App.tsx`, same as every other app's own tab state — survives switching away and back. */
  tab: NotificationsAppTab;
  onTabChange: (tab: NotificationsAppTab) => void;
}

/**
 * The "Notifications" app — a global utility alongside Team/Settings, not
 * one of the 8 monthly-rhythm workflow apps: a bulk-reviewable inbox for the
 * outbound sends those apps queue up (daily ACH confirmations, billing
 * invoices) rather than a workflow of its own. Same header/tabs/body anatomy
 * every other app shares.
 */
export function NotificationsApp({ tab, onTabChange }: NotificationsAppProps) {
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <Bell size={24} />
            </span>
          }
          title="Notifications"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as NotificationsAppTab)}>
              <TabList>
                <Tab value="inbox">Inbox</Tab>
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
              <Bell size={16} />
            </span>
          }
          title="Notifications"
          value={tab}
          onValueChange={(value) => onTabChange(value as NotificationsAppTab)}
          onIconClick={() => onTabChange("inbox")}
        >
          <Tab value="inbox">Inbox</Tab>
          <Tab value="settings">Settings</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {tab === "inbox" && <InboxTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </>
  );
}
