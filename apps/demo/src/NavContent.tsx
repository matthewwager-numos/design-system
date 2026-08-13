import { Home, LogOut, Settings, Users } from "lucide-react";
import { DropdownMenuItem, NavItem, NavSection, NavUser } from "@numosai/ui";
import type { PageId } from "./pages";

export interface NavContentProps {
  active: PageId;
  onNavigate: (page: PageId) => void;
  onSignOut: () => void;
}

/**
 * The one nav content definition passed to both `<Navigation>` (desktop)
 * and `<MobileNav>` (mobile) in App.tsx — same `<NavSection>`/`<NavItem>`/
 * `<NavUser>` tree either way, since that's the whole point of the two
 * components sharing context/CSS.
 */
export function NavContent({ active, onNavigate, onSignOut }: NavContentProps) {
  return (
    <>
      <NavSection grow>
        <NavItem icon={<Home size={24} />} selected={active === "home"} onClick={() => onNavigate("home")}>
          Home
        </NavItem>
        <NavItem icon={<Users size={24} />} selected={active === "employees"} onClick={() => onNavigate("employees")}>
          Employees
        </NavItem>
      </NavSection>
      <NavSection>
        <NavUser name="Matthew Wager">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Preferences</DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
        </NavUser>
        <NavItem icon={<Settings size={24} />}>Settings</NavItem>
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
