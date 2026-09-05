import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode, TransitionEvent } from "react";
import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";
import { clsx } from "clsx";
import { Avatar } from "../Avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../DropdownMenu";
import { NavigationContext } from "../Navigation/NavigationContext";
import { NumosLogomark, NumosWordmark } from "../Navigation/NumosLogo";
// <NavItem>/<NavSection>/<NavUser> render classes owned by Navigation.css,
// which only Navigation.tsx imports as a side effect — MobileNav renders
// those same components without ever rendering <Navigation> itself, so it
// needs this same import directly, or their styles wouldn't ship for an
// app that only uses <MobileNav>.
import "../Navigation/Navigation.css";
import "./MobileNav.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

export interface MobileNavProps {
  /**
   * The exact same `<NavSection>`/`<NavItem>`/`<NavUser>` tree you'd pass to
   * `<Navigation>` — rendered as-is in the expanded panel (with the same
   * `expanded: true` context those components already read), so one nav
   * content definition serves both.
   */
  children: ReactNode;
  name: string;
  avatarSrc?: string;
  initials?: string;
  /**
   * `<DropdownMenuItem>`s for the quick-access avatar in the collapsed bar —
   * typically the same items as whatever `<NavUser>` inside `children` uses.
   * A separate prop rather than reused from `children` because the
   * collapsed bar can't reach into `children` to reuse that `<NavUser>`
   * instance directly; omit for a plain, non-interactive avatar.
   */
  accountMenu?: ReactNode;
  onNotificationsClick?: () => void;
  /** Extra action rendered in the collapsed bar, between notifications and the avatar — e.g. a consuming app's own global icon button. Renders as-is; style it to match `.ds-mobile-nav-bar__icon-button`'s own treatment (plain, `--content-brand-primary`, no fill) for visual consistency with the bell beside it. */
  trailingAction?: ReactNode;
  /** Controlled open state for the full nav panel. Omit to let MobileNav manage its own. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * The mobile counterpart to `<Navigation>` — matches Figma's MobileNav
 * exactly: a persistent compact top bar (logomark, notifications, avatar)
 * that expands into a full nav panel. Expanded, it's nearly identical to
 * `<Navigation>` itself — same background/shadow, same `<NavItem>`/
 * `<NavSection>`/`<NavUser>` components and CSS, same account
 * `<DropdownMenu>` — the one real difference is the head's collapse arrow
 * becomes an × (a full close, not a shrink-to-rail), since a mobile drawer
 * has no icon-only collapsed state to shrink into.
 *
 * Closing happens four ways: the × button, tapping the wordmark (mirroring
 * how tapping the logomark is also how `<Navigation>`'s own collapsed rail
 * re-expands), Escape, or picking any real nav destination — the last one
 * via a single delegated click handler rather than special-casing every
 * item: anything clicked that's a real `<a>`/`<button>` *without*
 * `aria-expanded` counts as "navigated somewhere," closing the panel.
 * `aria-expanded` is what excludes the two things that shouldn't close it —
 * `<NavItem>`'s own sub-menu disclosure, and `<NavUser>`'s dropdown
 * trigger (set by `<DropdownMenuTrigger>`) — while still catching actual
 * destinations, sub-item links, and the dropdown's own menu items.
 *
 * The panel is a real full-screen overlay: portaled to `document.body`,
 * background scroll locks while open, and focus is trapped inside (Tab/
 * Shift+Tab cycle) until it closes — the same conventions `<Modal>`
 * already established for this library's overlays. Its open/close
 * transition mirrors `<Navigation>`'s own collapse/expand: a single
 * dimension animating with the same duration/easing tokens (there, rail
 * `width`; here, panel `height`, growing down from the bar the same way
 * the rail grows wider from its collapsed edge).
 */
export function MobileNav({
  children,
  name,
  avatarSrc,
  initials,
  accountMenu,
  onNotificationsClick,
  trailingAction,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: MobileNavProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded ?? uncontrolledExpanded;

  const panelRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(expanded);
  const [visible, setVisible] = useState(expanded);

  function setExpanded(next: boolean) {
    setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  }

  useEffect(() => {
    if (!expanded) {
      setVisible(false);
      return;
    }
    setRendered(true);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [expanded]);

  // Keyed off `rendered`, not `expanded`: when `expanded` first flips true,
  // the portal hasn't mounted yet in that same commit (it mounts one render
  // later, via the effect above's `setRendered(true)`) — so `panelRef.current`
  // would still be null here if this ran on `expanded`, and `.focus()` would
  // silently no-op, leaving focus (and Escape's keydown target) on whatever
  // triggered the open instead of the panel.
  useEffect(() => {
    if (!rendered) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [rendered]);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target === panelRef.current && !expanded) setRendered(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setExpanded(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest("a, button");
    if (!target || target.hasAttribute("aria-expanded")) return;
    setExpanded(false);
  }

  return (
    <div className={clsx("ds-mobile-nav", className)} data-theme="dark">
      <div className="ds-mobile-nav-bar">
        <button type="button" className="ds-mobile-nav-bar__logo" onClick={() => setExpanded(true)} aria-label="Open navigation">
          <NumosLogomark className="ds-mobile-nav-bar__logomark" />
        </button>
        <div className="ds-mobile-nav-bar__actions">
          <button type="button" className="ds-mobile-nav-bar__icon-button" onClick={onNotificationsClick} aria-label="Notifications">
            <Bell size={24} aria-hidden />
          </button>
          {trailingAction}
          {accountMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button type="button" className="ds-mobile-nav-bar__avatar" aria-label="Account menu">
                  <Avatar name={name} src={avatarSrc} initials={initials} size="sm" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>{accountMenu}</DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Avatar name={name} src={avatarSrc} initials={initials} size="sm" />
          )}
        </div>
      </div>

      {rendered &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            data-theme="dark"
            className={clsx("ds-mobile-nav-panel", visible && "ds-mobile-nav-panel--visible")}
            onKeyDown={handleKeyDown}
            onTransitionEnd={handleTransitionEnd}
            onClick={handlePanelClick}
          >
            <div className="ds-mobile-nav-panel__head">
              <button type="button" className="ds-mobile-nav-panel__logo" onClick={() => setExpanded(false)} aria-label="Collapse navigation">
                <NumosWordmark className="ds-mobile-nav-panel__wordmark" />
              </button>
              <button type="button" className="ds-mobile-nav-panel__close" onClick={() => setExpanded(false)} aria-label="Close navigation">
                <X size={24} aria-hidden />
              </button>
            </div>

            <NavigationContext.Provider value={{ expanded: true }}>{children}</NavigationContext.Provider>
          </div>,
          document.body,
        )}
    </div>
  );
}
