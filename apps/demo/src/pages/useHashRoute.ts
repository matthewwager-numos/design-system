import { useEffect, useState } from "react";
import type { PageId } from "./index";

/**
 * A `Record`, not a plain `PageId[]` — a bare array silently tolerated a
 * missing id (exactly what happened when "notifications" was added to
 * `PageId` without landing here too: clicking it set the hash, but the
 * `hashchange` listener below immediately validated that hash against this
 * list, didn't find it, and reset straight back to "home" — only a second
 * click, which no-ops the hash and so never re-validates, actually landed
 * on the page). `Record<PageId, true>` makes the same omission a compile
 * error instead: every `PageId` must have an entry.
 */
const VALID_PAGE_IDS: Record<PageId, true> = {
  home: true,
  notifications: true,
  team: true,
  close: true,
  accruals: true,
  collect: true,
  pay: true,
  reconcile: true,
  analyze: true,
  forecast: true,
  communicate: true,
  settings: true,
};

export interface Route {
  page: PageId;
  /**
   * The tab segment of the hash, e.g. `"#/accruals/table"` → `"table"` —
   * `null` when the hash names no tab (or an invalid page). Left as a plain
   * string rather than validated here: every app has its own distinct tab
   * union (`AccrualsAppTab`, `NotificationsAppTab`, ...), so only the
   * consumer that actually knows which app this is can check it against
   * the right type — this hook only knows about `PageId`.
   */
  tab: string | null;
}

function parseHash(): Route {
  const [rawPage, rawTab] = window.location.hash.replace(/^#\/?/, "").split("/");
  const page = rawPage && rawPage in VALID_PAGE_IDS ? (rawPage as PageId) : "home";
  return { page, tab: rawTab || null };
}

/**
 * Keeps `{ page, tab }` in sync with the URL hash (`#/accruals/table`,
 * `#/close/history`, ...) instead of plain in-memory `useState`, so a
 * direct link or a refresh lands back on the right app *and* tab. Plain
 * hash routing, not a real router or browser-history paths
 * (`/demo/accruals/table`) — this demo deploys to GitHub Pages
 * (`.github/workflows/deploy-pages.yml`), a static host with no
 * server-side rewrite rule: a path like that 404s on refresh since no file
 * exists there. Only the part before `#` is ever sent to the server, so
 * `index.html` is always what gets served regardless of which page/tab the
 * hash names — no server config needed.
 */
export function useHashRoute(): [Route, (page: PageId, tab?: string) => void] {
  const [route, setRouteState] = useState<Route>(() => parseHash());

  useEffect(() => {
    function handleHashChange() {
      setRouteState(parseHash());
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(page: PageId, tab?: string) {
    window.location.hash = tab ? `/${page}/${tab}` : `/${page}`;
    setRouteState({ page, tab: tab ?? null });
  }

  return [route, navigate];
}
