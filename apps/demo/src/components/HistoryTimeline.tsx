import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { LogEntry, SearchFilter, Tab, TabList, Tabs } from "@numosai/ui";

export interface HistoryEntry {
  id: string;
  /** The bold, link-colored lead segment — typically the record's own name. */
  subject?: ReactNode;
  description: ReactNode;
  actor: ReactNode;
  /** Already-formatted display text (e.g. `"Sep 15, 2026 at 3:45p PST"`) — `date` below drives grouping/sorting instead. */
  timestamp: ReactNode;
  date: Date;
  /** Plain-text version of subject+description+actor, for the search field — `LogEntry`'s own props are `ReactNode`, not necessarily searchable strings. */
  searchText: string;
  /** Opens `subject`'s own detail view (a drawer, most often) — omit when there's nothing real to open (a departed record, a settings change). Forwarded directly to `<LogEntry>`. */
  onSubjectClick?: () => void;
  /** Same idea, for `actor`. */
  onActorClick?: () => void;
}

/**
 * The shape each app's own history data file exports — everything
 * `HistoryEntry` has except the two click handlers, which need a live
 * component's state (which record is currently selected) to close over and
 * so can't live in a plain, module-level data array. `subjectId`/
 * `actorEmployeeId` are that array's own stand-in: opaque record ids each
 * app's own `HistoryTab` resolves into a real `onSubjectClick`/
 * `onActorClick` (and a real record to show) at render time — present only
 * when the entry is actually about a record that still exists to show.
 */
export interface RawHistoryEntry extends Omit<HistoryEntry, "onSubjectClick" | "onActorClick"> {
  /** App-specific meaning (a vendor id, an employee id, ...) — whatever `subject` refers to. */
  subjectId?: string;
  /** An employee id — the byline's own `actor`, when it's a real, still-employed person rather than "System" or someone no longer around. */
  actorEmployeeId?: string;
}

export interface HistoryTimelineProps {
  entries: HistoryEntry[];
}

const GROUP_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long" });

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/**
 * A month-grouped changelog feed with a search + jump-to-month sidebar —
 * matches Figma's History page template, shared by every app's own History
 * tab (Accruals, Employees, ...) rather than rebuilt per app, since the
 * template itself doesn't know or care what the entries are actually
 * about — that's on each app's own data, same relationship `<LogEntry>`
 * itself has to its `subject`/`description`.
 *
 * The sidebar's month list is a real jump-to-section index, not a second
 * set of tab panels — `<Tabs>` is reused here purely for its own vertical
 * ("Stacked") selected-indicator styling and keyboard nav, wired to
 * `scrollIntoView` instead of swapping panel content. It's also a scroll
 * spy: scrolling the feed by hand (not just clicking a month) keeps the
 * selected tab in sync with whichever month is actually at the top of the
 * visible feed.
 */
export function HistoryTimeline({ entries }: HistoryTimelineProps) {
  const [query, setQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const feedRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.getTime() - a.date.getTime()), [entries]);

  const allMonths = useMemo(() => {
    const seen = new Map<string, Date>();
    for (const entry of sorted) {
      const key = monthKey(entry.date);
      if (!seen.has(key)) seen.set(key, entry.date);
    }
    return [...seen.entries()];
  }, [sorted]);

  const [activeMonth, setActiveMonth] = useState(() => allMonths[0]?.[0] ?? "");

  const trimmedQuery = query.trim().toLowerCase();
  const filtered = trimmedQuery ? sorted.filter((entry) => entry.searchText.toLowerCase().includes(trimmedQuery)) : sorted;

  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const entry of filtered) {
      const key = monthKey(entry.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return [...map.entries()];
  }, [filtered]);

  function jumpToMonth(key: string) {
    setActiveMonth(key);
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Scroll spy: whichever group's own header has scrolled up to (or past)
  // the top of the feed is the "active" one — walking the groups in order
  // and taking the last one whose header is at/above a small threshold
  // finds that section, the same logic a docs site's own "on this page"
  // nav uses. Re-attaches whenever the visible set of groups changes (a
  // search narrows/widens it), not just once on mount.
  useEffect(() => {
    const feedEl = feedRef.current;
    if (!feedEl || groups.length === 0) return;

    let queued = false;
    function updateActiveFromScroll() {
      queued = false;
      const containerTop = feedEl!.getBoundingClientRect().top;
      let current: string | null = null;
      for (const [key] of groups) {
        const el = sectionRefs.current[key];
        if (!el) continue;
        const top = el.getBoundingClientRect().top - containerTop;
        if (top <= 32) current = key;
      }
      if (current) setActiveMonth(current);
    }
    function handleScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(updateActiveFromScroll);
    }

    updateActiveFromScroll();
    feedEl.addEventListener("scroll", handleScroll);
    return () => feedEl.removeEventListener("scroll", handleScroll);
  }, [groups]);

  return (
    <div className="history-timeline">
      <div className="history-timeline__feed" ref={feedRef}>
        {groups.length === 0 ? (
          <p className="history-timeline__empty">No log entries match &ldquo;{query}&rdquo;.</p>
        ) : (
          groups.map(([key, groupEntries]) => (
            <div
              key={key}
              ref={(el) => {
                sectionRefs.current[key] = el;
              }}
              className="history-timeline__group"
            >
              <div className="history-timeline__group-header">
                <span className="history-timeline__group-label">{GROUP_FORMAT.format(groupEntries[0]!.date)}</span>
              </div>
              {groupEntries.map((entry) => (
                <LogEntry
                  key={entry.id}
                  subject={entry.subject}
                  description={entry.description}
                  actor={entry.actor}
                  timestamp={entry.timestamp}
                  onSubjectClick={entry.onSubjectClick}
                  onActorClick={entry.onActorClick}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="history-timeline__sidebar">
        <SearchFilter size="md" placeholder="Search history" value={query} onChange={setQuery} />
        {allMonths.length > 0 && (
          <div className="history-timeline__nav">
            <Tabs orientation="vertical" value={activeMonth} onValueChange={jumpToMonth}>
              <TabList>
                {allMonths.map(([key, date]) => (
                  <Tab key={key} value={key}>
                    {MONTH_FORMAT.format(date)}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
