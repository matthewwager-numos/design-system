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
import { DropdownMenuItem, MobileNav, NavItem, NavSection, NavUser } from "@numosai/ui";

const meta: Meta<typeof MobileNav> = {
  title: "Components/MobileNav",
  component: MobileNav,
  // No "autodocs" tag — MobileNav.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

// A narrow wrapper to preview the collapsed bar at a representative mobile
// width — the expanded panel is position: fixed (like <Modal>), so it
// covers the real browser viewport regardless of this wrapper's width.
const PREVIEW_STYLE = { width: "24rem", maxWidth: "100%" };

// The exact same content Navigation.stories.tsx passes to <Navigation> —
// same <NavSection>/<NavItem>/<NavUser> tree, since that's the whole point:
// one nav definition, rendered responsively by either component.
const NAV_CONTENT = (
  <>
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
  </>
);

// The collapsed bar's own quick-access avatar dropdown — same items as the
// <NavUser> above, since the bar can't reach into NAV_CONTENT to reuse it.
const ACCOUNT_MENU = (
  <>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Preferences</DropdownMenuItem>
    <DropdownMenuItem>Sign out</DropdownMenuItem>
  </>
);

export const Default: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <MobileNav name="Matthew Wager" accountMenu={ACCOUNT_MENU} onNotificationsClick={() => {}}>
        {NAV_CONTENT}
      </MobileNav>
    </div>
  ),
};

export const Expanded: Story = {
  name: "Expanded (open by default)",
  // defaultExpanded renders a real position:fixed, portaled overlay — under
  // the usual light/dark split decorator that'd mount two of them at once
  // (one per half), fighting over the same document.body scroll-lock/focus
  // trap. noThemeSplit keeps this story to a single copy, the same fix
  // used for Wizard's own "full viewport" story.
  parameters: { noThemeSplit: true },
  render: () => (
    <div style={PREVIEW_STYLE}>
      <MobileNav name="Matthew Wager" accountMenu={ACCOUNT_MENU} onNotificationsClick={() => {}} defaultExpanded>
        {NAV_CONTENT}
      </MobileNav>
    </div>
  ),
};

export const WithoutAccountMenu: Story = {
  name: "Without accountMenu",
  parameters: { noThemeSplit: true },
  render: () => (
    <div style={PREVIEW_STYLE}>
      <MobileNav name="Matthew Wager" defaultExpanded>
        {NAV_CONTENT}
      </MobileNav>
    </div>
  ),
};
