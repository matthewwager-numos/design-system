import type { HTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { BanknoteArrowUp, Bell, Calculator, CalendarCheck, FlaskConical, Inbox, RadioTower, Scale, Settings, Sparkles, Telescope, Users } from "lucide-react";
import { clsx } from "clsx";
import "./AppIcon.css";

// Matches this demo's own `PageId` 1:1 (minus "home", which has no tile of
// its own) plus "assistant" — the one entry that isn't a page, for the
// cross-cutting AI entry point (same glyph HomePage's own prompt input
// already uses for it).
export type AppIconName =
  | "collect"
  | "pay"
  | "accruals"
  | "reconcile"
  | "close"
  | "analyze"
  | "forecast"
  | "communicate"
  | "team"
  | "notifications"
  | "settings"
  | "assistant";

export type AppIconSize = "sm" | "md" | "lg";

export interface AppIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Which app the tile represents. */
  app: AppIconName;
  /** Tile size — "sm" is a 24px tile with a 16px icon, "md" (default) 40px/24px, "lg" 64px/48px. Matches Figma's own S/M/L 1:1. */
  size?: AppIconSize;
}

const ICONS: Record<AppIconName, LucideIcon> = {
  collect: Inbox,
  pay: BanknoteArrowUp,
  accruals: Calculator,
  reconcile: Scale,
  close: CalendarCheck,
  analyze: FlaskConical,
  forecast: Telescope,
  communicate: RadioTower,
  team: Users,
  notifications: Bell,
  settings: Settings,
  assistant: Sparkles,
};

const ICON_PX: Record<AppIconSize, number> = { sm: 16, md: 24, lg: 48 };

/**
 * A branded app-switcher tile. One glyph per `app`, matching Figma's
 * updated "🧰 Icon" (App Icons) component — now built from real Lucide
 * icons (one per actual app in this demo) instead of hand-drawn per-app
 * paths, so a new app just needs an entry in `ICONS` above, not a traced
 * SVG. Background/glyph color are both tokens
 * (`--app-icon-fill`/`--app-icon-stroke`) that swap places between light
 * and dark mode — see their own comment in `tokens.css` for why.
 *
 * `lg`'s icon renders at `strokeWidth={1.25}`, not the Lucide default of 2
 * — at 48px (2x a normal 24px icon), a strokeWidth of 2 comes out twice as
 * heavy on screen as every other icon in this app; 1.25 lands it back
 * around the same ~2.5px perceived weight (same reasoning `HomePage`'s own
 * 48px flow tiles already use).
 */
export function AppIcon({ app, size = "md", className, ...rest }: AppIconProps) {
  const Icon = ICONS[app];
  return (
    <span className={clsx("ds-app-icon", `ds-app-icon--${size}`, className)} {...rest}>
      <Icon size={ICON_PX[size]} strokeWidth={size === "lg" ? 1.25 : 2} aria-hidden />
    </span>
  );
}
