import { Calendar, DisplayMetric } from "@numosai/ui";
import type { CalendarDateStatus } from "@numosai/ui";
import { SystemsDiagram } from "../../components/SystemsDiagram";
import { COLLECT_BULK_ACTIONS } from "../../data/collectActions";

// Pinned, not `new Date()` — matches every other Overview's own fictional
// "today" (see CloseApp's OverviewTab), so this reads the same regardless
// of when it's actually viewed instead of drifting into a month with none
// of the events below.
const TODAY = new Date(2026, 8, 28);

interface CollectCalendarEvent {
  date: Date;
  status: CalendarDateStatus;
  details: string;
}

// Reuses real customers/invoices/amounts from the Work tab's own bulk
// actions (not the exact "days overdue" math those carry — this is a
// separate, illustrative spread of *when* across the month, not a literal
// join), so the calendar and the Work tab tell the same story instead of
// inventing a second, disconnected cast of customers.
const COLLECT_CALENDAR_EVENTS: CollectCalendarEvent[] = [
  { date: new Date(2026, 8, 8), status: "negative", details: "Meridian Fitness Co. — Invoice 8821 ($1,240) reminder sent, 34 days past due." },
  { date: new Date(2026, 8, 12), status: "negative", details: "Sunrise Bakery LLC — Invoice 8847 ($420) reminder sent, 32 days past due." },
  { date: new Date(2026, 8, 15), status: "negative", details: "Ferro Metalworks — Invoice 8852 ($5,180) reminder sent, 47 days past due." },
  { date: new Date(2026, 8, 18), status: "positive", details: "Thistle & Sage Florist — payment of $610 received and applied to Invoice 8790." },
  { date: new Date(2026, 8, 20), status: "positive", details: "Ironclad Fitness — payment of $2,300 received and applied to Invoice 8801." },
  { date: new Date(2026, 8, 22), status: "negative", details: "Harbor View Consulting — Invoice 8879 ($2,750) reminder sent, 52 days past due." },
  { date: new Date(2026, 8, 24), status: "default", details: "Lantern Hill Yoga — Invoice 9021 ($540) sent, due in 30 days." },
  { date: new Date(2026, 8, 27), status: "positive", details: "Nightingale Media — payment of $1,475 received and applied to Invoice 8814." },
  { date: TODAY, status: "negative", details: "Ashgrove Interiors — Invoice 8901 ($4,420) escalated to a second reminder, 45 days past due." },
  { date: new Date(2026, 8, 30), status: "notice", details: "Cobalt Print Shop — Invoice 9022 ($1,860) due in 2 days." },
];

function findEvent(date: Date): CollectCalendarEvent | undefined {
  return COLLECT_CALENDAR_EVENTS.find((event) => event.date.getFullYear() === date.getFullYear() && event.date.getMonth() === date.getMonth() && event.date.getDate() === date.getDate());
}

/**
 * Collect's own "control tower" summary: a few counts pulled straight from
 * the Work tab's own bulk actions (so this can't drift out of sync with the
 * real list there), and a month calendar of representative collections
 * activity — overdue reminders, payments received, invoices sent — each day
 * clickable for the specific customer/invoice behind it.
 */
export function OverviewTab() {
  const overdueCount = COLLECT_BULK_ACTIONS.find((action) => action.id === "overdue")?.items.length ?? 0;
  const newInvoiceCount = COLLECT_BULK_ACTIONS.find((action) => action.id === "new-invoices")?.items.length ?? 0;
  const confirmationCount = COLLECT_BULK_ACTIONS.find((action) => action.id === "confirmations")?.items.length ?? 0;

  return (
    <div className="page page--full-width page--overview">
      <div className="overview-metrics">
        <DisplayMetric value={String(overdueCount)} label="Overdue invoices" color="magenta" />
        <DisplayMetric value={String(newInvoiceCount)} label="Invoices to send" color="brand" />
        <DisplayMetric value={String(confirmationCount)} label="Payments to confirm" color="green" />
        <DisplayMetric value={String(overdueCount + newInvoiceCount + confirmationCount)} label="Total open items" color="yellow" />
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Collections calendar</h2>
        <div className="overview-calendar">
          <Calendar month={TODAY} getDateStatus={(date) => findEvent(date)?.status} getDateDetails={(date) => findEvent(date)?.details} />
        </div>
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Connected systems</h2>
        <p className="overview-chart-card__description" style={{ margin: 0 }}>
          Gmail, Coupa, Expensify, NetSuite, and Ramp feed Numos directly; Numos posts finalized collections activity back to NetSuite and other downstream
          endpoints.
        </p>
        <SystemsDiagram />
      </div>
    </div>
  );
}
