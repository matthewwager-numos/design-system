import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  Bell,
  ChartColumn,
  CreditCard,
  LogOut,
  Lightbulb,
  Mail,
  MessageCircle,
  Receipt,
  Settings,
  SquareCheckBig,
  Workflow,
} from "lucide-react";
import { DropdownMenuItem, NavItem, NavSection, NavUser, Navigation } from "@numosai/ui";

const meta: Meta<typeof Navigation> = {
  title: "Components/Navigation",
  component: Navigation,
  // No "autodocs" tag — Navigation.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Navigation>;

// Navigation is height: 100% of its container — without an explicit height,
// Storybook's Canvas gives it nothing to fill and it collapses to 0.
const PREVIEW_STYLE = { height: "40rem" };

export const Default: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Navigation>
        <NavSection grow>
          <NavItem icon={<SquareCheckBig size={24} />} href="#tasks">
            Tasks
          </NavItem>
          <NavItem icon={<CreditCard size={24} />} href="#reconciliations">
            Reconciliations
          </NavItem>
          <NavItem icon={<Lightbulb size={24} />} href="#transactions">
            Transactions
          </NavItem>
          <NavItem icon={<Receipt size={24} />} href="#accruals" selected>
            Accruals
          </NavItem>
          <NavItem icon={<Activity size={24} />} href="#variance">
            Variance
          </NavItem>
          <NavItem icon={<ChartColumn size={24} />} href="#reports">
            Reports
          </NavItem>
          <NavItem icon={<MessageCircle size={24} />} href="#chat">
            Chat
          </NavItem>
          <NavItem icon={<Mail size={24} />} href="#helpdesk">
            Helpdesk
          </NavItem>
          <NavItem icon={<Workflow size={24} />} href="#workflows">
            Workflows
          </NavItem>
        </NavSection>
        <NavSection>
          <NavUser name="Matthew Wager">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </NavUser>
          <NavItem icon={<Bell size={24} />}>Notifications</NavItem>
          <NavItem icon={<Settings size={24} />}>Settings</NavItem>
          <NavItem icon={<LogOut size={24} />}>Sign Out</NavItem>
        </NavSection>
      </Navigation>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Navigation defaultExpanded={false}>
        <NavSection grow>
          <NavItem icon={<SquareCheckBig size={24} />} href="#tasks">
            Tasks
          </NavItem>
          <NavItem icon={<CreditCard size={24} />} href="#reconciliations">
            Reconciliations
          </NavItem>
          <NavItem icon={<Receipt size={24} />} href="#accruals" selected>
            Accruals
          </NavItem>
        </NavSection>
        <NavSection>
          <NavUser name="Matthew Wager">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </NavUser>
          <NavItem icon={<Settings size={24} />}>Settings</NavItem>
          <NavItem icon={<LogOut size={24} />}>Sign Out</NavItem>
        </NavSection>
      </Navigation>
    </div>
  ),
};

export const WithExpandableGroup: Story = {
  name: "With an expandable group",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Navigation>
        <NavSection grow>
          <NavItem icon={<SquareCheckBig size={24} />} href="#tasks">
            Tasks
          </NavItem>
          <NavItem
            icon={<Receipt size={24} />}
            defaultOpen
            items={[
              { label: "Recurring", href: "#recurring", active: true },
              { label: "One-time", href: "#one-time" },
              { label: "Templates", href: "#templates" },
              { label: "Archived", href: "#archived" },
            ]}
          >
            Accruals
          </NavItem>
          <NavItem icon={<Activity size={24} />} href="#variance">
            Variance
          </NavItem>
        </NavSection>
        <NavSection>
          <NavUser name="Matthew Wager">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </NavUser>
        </NavSection>
      </Navigation>
    </div>
  ),
};
