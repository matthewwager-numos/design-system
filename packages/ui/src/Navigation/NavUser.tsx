import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Avatar } from "../Avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../DropdownMenu";
import { useNavigationContext } from "./NavigationContext";

export interface NavUserProps {
  name: string;
  avatarSrc?: string;
  initials?: string;
  /** <DropdownMenuItem>s — the account menu (Profile, Preferences, Sign out, whatever's relevant). Not hardcoded, since that's app-specific. */
  children: ReactNode;
}

/**
 * The username row at the bottom of `<Navigation>` — an avatar, name, and a
 * `<DropdownMenu>` for account actions (matching Figma's "Username" Nav Item
 * state, which shows a chevron but doesn't itself specify what it opens).
 * Collapsed, the row shrinks to just the avatar, which shows `name` in its
 * own built-in tooltip — the same affordance every other collapsed
 * `<NavItem>` gets, for free from `<Avatar>`.
 */
export function NavUser({ name, avatarSrc, initials, children }: NavUserProps) {
  const { expanded } = useNavigationContext("NavUser");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="ds-nav-user">
          <Avatar name={name} src={avatarSrc} initials={initials} size="sm" color="info" tooltip={!expanded} />
          {expanded && (
            <>
              <span className="ds-nav-user__name">{name}</span>
              <ChevronDown size={16} aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="top">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
