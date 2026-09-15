import { useEffect, useState } from "react";
import type { PageId } from "./index";

const PAGE_IDS: PageId[] = [
  "home",
  "team",
  "close",
  "accruals",
  "collect",
  "pay",
  "reconcile",
  "analyze",
  "forecast",
  "communicate",
  "settings",
];

function pageFromHash(): PageId {
  const id = window.location.hash.replace(/^#\/?/, "");
  return (PAGE_IDS as string[]).includes(id) ? (id as PageId) : "home";
}

/**
 * Keeps `page` state in sync with the URL hash (`#/accrue`, `#/close`, ...)
 * instead of plain in-memory `useState`, so a direct link or a refresh
 * lands back on the right app. Plain hash routing, not a real router or
 * browser-history paths (`/demo/accrue`) — this demo deploys to GitHub
 * Pages (`.github/workflows/deploy-pages.yml`), a static host with no
 * server-side rewrite rule: a path like that 404s on refresh since no
 * file exists there. Only the part before `#` is ever sent to the server,
 * so `index.html` is always what gets served regardless of which page the
 * hash names — no server config needed.
 */
export function useHashRoute(): [PageId, (page: PageId) => void] {
  const [page, setPageState] = useState<PageId>(() => pageFromHash());

  useEffect(() => {
    function handleHashChange() {
      setPageState(pageFromHash());
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function setPage(next: PageId) {
    window.location.hash = `/${next}`;
    setPageState(next);
  }

  return [page, setPage];
}
