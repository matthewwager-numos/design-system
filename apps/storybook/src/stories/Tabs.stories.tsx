import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Settings, User } from "lucide-react";
import { Tab, TabList, TabPanel, Tabs } from "@numosai/ui";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  // No "autodocs" tag — Tabs.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 28 * 16 }}>
      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
          <Tab value="settings">Settings</Tab>
        </TabList>
        <TabPanel value="overview">A summary of what's happened recently.</TabPanel>
        <TabPanel value="activity">A chronological feed of every change.</TabPanel>
        <TabPanel value="settings">Preferences for this workspace.</TabPanel>
      </Tabs>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 28 * 16 }}>
      <Tabs orientation="vertical" defaultValue="profile">
        <TabList style={{ minWidth: 8 * 16 }}>
          <Tab value="profile" leadingIcon={<User size={16} />}>
            Profile
          </Tab>
          <Tab value="notifications" leadingIcon={<Bell size={16} />}>
            Notifications
          </Tab>
          <Tab value="settings" leadingIcon={<Settings size={16} />}>
            Settings
          </Tab>
        </TabList>
        <TabPanel value="profile" style={{ flex: 1, minWidth: 0 }}>
          Name, photo, and bio.
        </TabPanel>
        <TabPanel value="notifications" style={{ flex: 1, minWidth: 0 }}>
          Choose what you get emailed about.
        </TabPanel>
        <TabPanel value="settings" style={{ flex: 1, minWidth: 0 }}>
          Preferences for this workspace.
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ width: 28 * 16 }}>
      <Tabs defaultValue="inbox">
        <TabList>
          <Tab value="inbox" badge={12}>
            Inbox
          </Tab>
          <Tab value="sent">Sent</Tab>
          <Tab value="drafts" badge={3}>
            Drafts
          </Tab>
        </TabList>
        <TabPanel value="inbox">12 unread messages.</TabPanel>
        <TabPanel value="sent">Messages you've sent.</TabPanel>
        <TabPanel value="drafts">3 unfinished messages.</TabPanel>
      </Tabs>
    </div>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <div style={{ width: 28 * 16 }}>
      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="billing" disabled>
            Billing
          </Tab>
          <Tab value="settings">Settings</Tab>
        </TabList>
        <TabPanel value="overview">A summary of what's happened recently.</TabPanel>
        <TabPanel value="billing">Not shown — this tab is disabled.</TabPanel>
        <TabPanel value="settings">Preferences for this workspace.</TabPanel>
      </Tabs>
    </div>
  ),
};
