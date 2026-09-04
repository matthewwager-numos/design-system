import type { HistoryEntry } from "../components/HistoryTimeline";

// Illustrative log entries for the Close Checklist app's History tab —
// invented content (not derived from `tasks.ts`'s own live board), matching
// the LogEntry schema: [what happened]+[where]+[why/how]+[to whom], by
// [who acted] on [when]. Dated November 2026 – January 2027 rather than
// this demo's usual 2026 months: `tasks.ts`'s own live board is already
// set in early 2027 (its review due dates are literally "2027-02-05"),
// so this history reads as "closes completed before the board's current,
// still-open Jan/Feb 2027 period" — consistent with that, not invented
// separately.
export const RECONCILIATION_HISTORY: HistoryEntry[] = [
  {
    id: "rh1",
    subject: "REC-098 “December bank reconciliation”",
    description: "was reconciled",
    actor: "Alex Kim",
    timestamp: "Jan 31, 2027 at 4:30p PST",
    date: new Date(2027, 0, 31, 16, 30),
    searchText: "rec-098 december bank reconciliation reconciled alex kim",
  },
  {
    id: "rh2",
    subject: "REC-095 “Stripe payouts for November”",
    description: "was assigned to Sam Rivera",
    actor: "Maya Chen",
    timestamp: "Jan 28, 2027 at 2:15p PST",
    date: new Date(2027, 0, 28, 14, 15),
    searchText: "rec-095 stripe payouts november assigned sam rivera maya chen",
  },
  {
    id: "rh3",
    subject: "REC-090 “Vendor 1099 totals”",
    description: "moved to In Review",
    actor: "Priya Patel",
    timestamp: "Jan 20, 2027 at 10:00a PST",
    date: new Date(2027, 0, 20, 10, 0),
    searchText: "rec-090 vendor 1099 totals in review priya patel",
  },
  {
    id: "rh4",
    subject: "REC-085 “December bank reconciliation”",
    description: "was created",
    actor: "System",
    timestamp: "Jan 10, 2027 at 9:00a PST",
    date: new Date(2027, 0, 10, 9, 0),
    searchText: "rec-085 december bank reconciliation created system",
  },
  {
    id: "rh5",
    subject: "REC-070 “November bank reconciliation”",
    description: "was reconciled",
    actor: "Maya Chen",
    timestamp: "Dec 29, 2026 at 3:00p PST",
    date: new Date(2026, 11, 29, 15, 0),
    searchText: "rec-070 november bank reconciliation reconciled maya chen",
  },
  {
    id: "rh6",
    subject: "REC-065 “Payroll tax withholdings, Q4”",
    description: "was flagged for review",
    actor: "Jordan Lee",
    timestamp: "Dec 15, 2026 at 1:30p PST",
    date: new Date(2026, 11, 15, 13, 30),
    searchText: "rec-065 payroll tax withholdings flagged review jordan lee",
  },
  {
    id: "rh7",
    subject: "REC-060 “Intercompany balances”",
    description: "was assigned to Priya Patel",
    actor: "Maya Chen",
    timestamp: "Dec 5, 2026 at 11:00a PST",
    date: new Date(2026, 11, 5, 11, 0),
    searchText: "rec-060 intercompany balances assigned priya patel maya chen",
  },
  {
    id: "rh8",
    subject: "REC-050 “October bank reconciliation”",
    description: "was reconciled",
    actor: "Alex Kim",
    timestamp: "Nov 28, 2026 at 4:00p PST",
    date: new Date(2026, 10, 28, 16, 0),
    searchText: "rec-050 october bank reconciliation reconciled alex kim",
  },
  {
    id: "rh9",
    subject: "REC-045 “Duplicate vendor payments”",
    description: "was reopened",
    actor: "Jordan Lee",
    timestamp: "Nov 15, 2026 at 2:00p PST",
    date: new Date(2026, 10, 15, 14, 0),
    searchText: "rec-045 duplicate vendor payments reopened jordan lee",
  },
  {
    id: "rh10",
    subject: "REC-040 “October close checklist”",
    description: "was created",
    actor: "System",
    timestamp: "Nov 3, 2026 at 9:30a PST",
    date: new Date(2026, 10, 3, 9, 30),
    searchText: "rec-040 october close checklist created system",
  },
];
