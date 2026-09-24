import {
  Banknote,
  Bell,
  Calculator,
  CalendarCheck,
  FlaskConical,
  Home,
  Inbox,
  LogOut,
  RadioTower,
  Scale,
  Settings,
  Telescope,
  Users,
} from "lucide-react";
import { DropdownMenuItem, NavItem, NavSection, NavUser } from "@numosai/ui";
import { DAYS_UNTIL_CLOSE, closeBadgeStatus } from "./data/close";
import type { PageId } from "./pages";

export interface NavContentProps {
  active: PageId;
  onNavigate: (page: PageId) => void;
  onSignOut: () => void;
}

/**
 * The one nav content definition passed to both `<Navigation>` (desktop) and
 * `<MobileNav>` (mobile) in App.tsx — same `<NavSection>`/`<NavItem>`/
 * `<NavUser>` tree either way, since that's the whole point of the two
 * components sharing context/CSS.
 *
 * The middle two groups mirror the standard finance "Record to Report"
 * shape: **Record** is Collect/Pay/Accrue/Reconcile plus Close itself —
 * Close is Record's own capstone step (the period gets *locked* there), not
 * a separate category, so it's a plain fifth peer in the same group, no
 * different from the other four. **Report** is three more independent
 * workflows (Analyze/Forecast/Communicate) fed by Close's own Output — see
 * the plan doc for the full feedback-loop model (those three's own output
 * eventually feeds back into next cycle's Collect/Pay/Accrue/Reconcile).
 */
export function NavContent({ active, onNavigate, onSignOut }: NavContentProps) {
  return (
    <>
      <NavSection grow>
        <NavItem icon={<Home size={24} />} selected={active === "home"} onClick={() => onNavigate("home")}>
          Home
        </NavItem>

        <NavSection label="Record">
          <NavItem icon={<Inbox size={24} />} selected={active === "collect"} onClick={() => onNavigate("collect")}>
            Collect
          </NavItem>
          <NavItem icon={<Banknote size={24} />} selected={active === "pay"} onClick={() => onNavigate("pay")}>
            Pay
          </NavItem>
          <NavItem icon={<Calculator size={24} />} selected={active === "accruals"} onClick={() => onNavigate("accruals")}>
            Accrue
          </NavItem>
          <NavItem icon={<Scale size={24} />} selected={active === "reconcile"} onClick={() => onNavigate("reconcile")}>
            Reconcile
          </NavItem>
          <NavItem
            icon={<CalendarCheck size={24} />}
            selected={active === "close"}
            onClick={() => onNavigate("close")}
            badge={`${DAYS_UNTIL_CLOSE}d`}
            badgeStatus={closeBadgeStatus(DAYS_UNTIL_CLOSE)}
          >
            Close
          </NavItem>
        </NavSection>

        <NavSection label="Report">
          <NavItem icon={<FlaskConical size={24} />} selected={active === "analyze"} onClick={() => onNavigate("analyze")}>
            Analyze
          </NavItem>
          <NavItem icon={<Telescope size={24} />} selected={active === "forecast"} onClick={() => onNavigate("forecast")}>
            Forecast
          </NavItem>
          <NavItem icon={<RadioTower size={24} />} selected={active === "communicate"} onClick={() => onNavigate("communicate")}>
            Communicate
          </NavItem>
        </NavSection>
      </NavSection>

      <NavSection>
        <NavUser name="Matthew Wager">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Preferences</DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
        </NavUser>
        <NavItem icon={<Bell size={24} />} selected={active === "notifications"} onClick={() => onNavigate("notifications")}>
          Notifications
        </NavItem>
        <NavItem icon={<Users size={24} />} selected={active === "team"} onClick={() => onNavigate("team")}>
          Team
        </NavItem>
        <NavItem icon={<Settings size={24} />} selected={active === "settings"} onClick={() => onNavigate("settings")}>
          Settings
        </NavItem>
        <NavItem icon={<LogOut size={24} />} onClick={onSignOut}>
          Sign Out
        </NavItem>
      </NavSection>
    </>
  );
}

export function accountMenu(onSignOut: () => void) {
  return (
    <>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Preferences</DropdownMenuItem>
      <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
    </>
  );
}
