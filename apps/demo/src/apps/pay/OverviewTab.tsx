import { Calendar, DisplayMetric } from "@numosai/ui";
import type { CalendarDateStatus } from "@numosai/ui";
import { SystemsDiagram } from "../../components/SystemsDiagram";

// Pinned, not `new Date()` — matches every other Overview's own fictional
// "today" (see CloseApp's OverviewTab), so this reads the same regardless
// of when it's actually viewed instead of drifting into a month with none
// of the events below. Shares CollectApp's own anchor date, since both are
// telling the same September 2026 story from opposite sides of the ledger.
const TODAY = new Date(2026, 8, 28);

interface PayCalendarEvent {
  date: Date;
  status: CalendarDateStatus;
  details: string;
}

const PAY_CALENDAR_EVENTS: PayCalendarEvent[] = [
  { date: new Date(2026, 8, 9), status: "negative", details: "Brightline Logistics — Bill #4410 ($8,200) approval overdue, blocking payment." },
  { date: new Date(2026, 8, 14), status: "positive", details: "Argent Office Supply — payment of $940 sent via ACH." },
  { date: new Date(2026, 8, 16), status: "negative", details: "Northgate IT Services — Bill #4433 ($3,050) payment failed, needs retry." },
  { date: new Date(2026, 8, 19), status: "positive", details: "Solstice Print Co. — payment of $2,460 sent via ACH." },
  { date: new Date(2026, 8, 21), status: "default", details: "Brightline Logistics — new Bill #4490 ($4,120) received via Coupa, awaiting approval." },
  { date: new Date(2026, 8, 23), status: "negative", details: "Vantage Legal Group — Bill #4458 ($12,900) approval overdue." },
  { date: new Date(2026, 8, 25), status: "positive", details: "Wren Marketing Group — payment of $5,700 sent via wire." },
  { date: TODAY, status: "negative", details: "Anchorage Facilities — Bill #4471 ($6,340) past due, vendor has escalated." },
  { date: new Date(2026, 8, 30), status: "notice", details: "Cedar & Vine Catering — Bill #4479 ($1,180) due in 2 days." },
];

function findEvent(date: Date): PayCalendarEvent | undefined {
  return PAY_CALENDAR_EVENTS.find((event) => event.date.getFullYear() === date.getFullYear() && event.date.getMonth() === date.getMonth() && event.date.getDate() === date.getDate());
}

function countByStatus(status: CalendarDateStatus): number {
  return PAY_CALENDAR_EVENTS.filter((event) => event.status === status).length;
}

/**
 * Pay's own "control tower" summary: a few counts derived straight from the
 * calendar's own events below (so the metrics row can't drift out of sync
 * with what the calendar actually shows), and a month calendar of
 * representative payment activity — approvals overdue, payments sent, bills
 * due soon — each day clickable for the specific vendor/bill behind it.
 */
export function OverviewTab() {
  const negativeCount = countByStatus("negative");
  const noticeCount = countByStatus("notice");
  const positiveCount = countByStatus("positive");

  return (
    <div className="page page--full-width page--overview">
      <div className="overview-metrics">
        <DisplayMetric value={String(negativeCount)} label="Bills needing approval" color="magenta" />
        <DisplayMetric value={String(noticeCount)} label="Due this week" color="yellow" />
        <DisplayMetric value={String(positiveCount)} label="Payments sent" color="green" />
        <DisplayMetric value={String(negativeCount + noticeCount + positiveCount)} label="Total open items" color="brand" />
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Payment calendar</h2>
        <div className="overview-calendar">
          <Calendar month={TODAY} getDateStatus={(date) => findEvent(date)?.status} getDateDetails={(date) => findEvent(date)?.details} />
        </div>
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Connected systems</h2>
        <p className="overview-chart-card__description" style={{ margin: 0 }}>
          Gmail, Coupa, Expensify, NetSuite, and Ramp feed Numos directly; Numos posts finalized payment activity back to NetSuite and other downstream
          endpoints.
        </p>
        <SystemsDiagram />
      </div>
    </div>
  );
}
