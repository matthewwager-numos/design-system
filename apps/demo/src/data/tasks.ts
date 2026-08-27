export type TaskStage = "backlog" | "assigned" | "inProgress" | "inReview" | "reconciled";

/** Sentinel `assignee` value — matches Figma's own unassigned "person+" placeholder in Backlog. Only a `backlog` task should ever have this value; every later stage requires a real assignee to get there. */
export const UNASSIGNED = "unassigned";

export interface Task {
  id: string;
  title: string;
  description: string;
  stage: TaskStage;
  /** `UNASSIGNED` only ever occurs on a `backlog` task. Entering In Review re-assigns this to the chosen reviewer — there's no separate "reviewer" field, since a task only ever has one owner at a time. */
  assignee: string;
  /** Display date only (this is a demo, not a real date-math app) — paired with `done` to decide the "Due"/"Done" prefix. */
  date: string;
  done: boolean;
  /** Set when a task enters In Review — an ISO `yyyy-mm-dd`, native `<input type="date">` value. Persists across a backward move out of In Review (see `TasksTab`'s move-gating logic), cleared only when the task is unassigned back to Backlog. */
  reviewDueDate?: string;
}

export interface StageDef {
  id: TaskStage;
  label: string;
}

export const STAGES: StageDef[] = [
  { id: "backlog", label: "Backlog" },
  { id: "assigned", label: "Assigned" },
  { id: "inProgress", label: "In Progress" },
  { id: "inReview", label: "In Review" },
  { id: "reconciled", label: "Reconciled" },
];

export const ASSIGNEES = ["Maya Chen", "Jordan Lee", "Priya Patel", "Alex Kim", "Sam Rivera"];

/** Which ERP ledger a task's reconciliation work belongs to — same "picked from a fixed list, not modeled per task" scope as the month selector: a toolbar filter with nothing behind it yet, not a real field on `Task`. */
export const ERP_ACCOUNTS = ["NetSuite — Corporate", "NetSuite — EU Subsidiary", "SAP — Manufacturing", "QuickBooks — APAC"];

let nextTaskNumber = 126;

export function nextTaskId(): string {
  return `REC-${nextTaskNumber++}`;
}

export const INITIAL_TASKS: Task[] = [
  // Backlog — unpicked, no assignee yet.
  { id: "REC-101", title: "Reconcile Stripe payouts for December", description: "Match settlement batches against bank deposits.", stage: "backlog", assignee: UNASSIGNED, date: "Feb 3", done: false },
  { id: "REC-102", title: "Audit petty cash ledger", description: "Verify receipts against recorded disbursements.", stage: "backlog", assignee: UNASSIGNED, date: "Feb 4", done: false },
  { id: "REC-103", title: "Review duplicate vendor payments", description: "Flag and confirm potential double payments in AP.", stage: "backlog", assignee: UNASSIGNED, date: "Feb 5", done: false },
  { id: "REC-104", title: "Close out Q4 travel expense report", description: "Reconcile submitted receipts against the corporate card statement.", stage: "backlog", assignee: UNASSIGNED, date: "Feb 6", done: false },
  { id: "REC-105", title: "Verify customer refund postings", description: "Cross-check refund requests against processed credits.", stage: "backlog", assignee: UNASSIGNED, date: "Feb 7", done: false },

  // Assigned
  { id: "REC-106", title: "Match bank statement transactions", description: "Reconcile checking account activity for January.", stage: "assigned", assignee: "Maya Chen", date: "Jan 29", done: false },
  { id: "REC-107", title: "Investigate unmatched wire transfer", description: "Trace a $12,400 wire with no matching invoice.", stage: "assigned", assignee: "Jordan Lee", date: "Jan 29", done: false },
  { id: "REC-108", title: "Reconcile payroll tax withholdings", description: "Verify Q4 withholding matches the filed 941.", stage: "assigned", assignee: "Priya Patel", date: "Jan 30", done: false },
  { id: "REC-109", title: "Review flagged ACH returns", description: "Confirm cause and resolution for 3 returned ACH payments.", stage: "assigned", assignee: "Alex Kim", date: "Jan 30", done: false },
  { id: "REC-110", title: "Cross-check inventory valuation", description: "Compare the FIFO ledger against the physical count adjustment.", stage: "assigned", assignee: "Sam Rivera", date: "Jan 31", done: false },

  // In Progress
  { id: "REC-111", title: "Reconcile merchant processor fees", description: "Match processor statements to recorded fee expense.", stage: "inProgress", assignee: "Maya Chen", date: "Jan 29", done: false },
  { id: "REC-112", title: "Verify intercompany balances", description: "Confirm intercompany AR/AP nets to zero.", stage: "inProgress", assignee: "Jordan Lee", date: "Jan 29", done: false },
  { id: "REC-113", title: "Match Stripe payouts to bank deposits", description: "January settlement batch reconciliation.", stage: "inProgress", assignee: "Priya Patel", date: "Jan 29", done: false },
  { id: "REC-114", title: "Review month-end journal entries", description: "Confirm accruals reverse correctly in February.", stage: "inProgress", assignee: "Alex Kim", date: "Jan 30", done: false },
  { id: "REC-115", title: "Audit expense report receipts", description: "Spot-check receipts over $500 for policy compliance.", stage: "inProgress", assignee: "Sam Rivera", date: "Jan 30", done: false },

  // In Review — assignee here is who's reviewing it (see Task.assignee doc).
  { id: "REC-116", title: "Approve Q1 budget adjustment", description: "Confirm variance explanations before finance sign-off.", stage: "inReview", assignee: "Maya Chen", date: "Jan 29", done: false, reviewDueDate: "2027-02-05" },
  { id: "REC-117", title: "Reconcile credit card statement", description: "Corporate card January statement vs. the GL.", stage: "inReview", assignee: "Jordan Lee", date: "Jan 29", done: false, reviewDueDate: "2027-02-05" },
  { id: "REC-118", title: "Verify vendor 1099 totals", description: "Confirm YTD payments match 1099 thresholds.", stage: "inReview", assignee: "Priya Patel", date: "Jan 29", done: false, reviewDueDate: "2027-02-06" },
  { id: "REC-119", title: "Close out December bank reconciliation", description: "Final review before month close.", stage: "inReview", assignee: "Alex Kim", date: "Jan 29", done: false, reviewDueDate: "2027-02-06" },
  { id: "REC-120", title: "Review flagged duplicate transactions", description: "Confirm resolution for AP duplicate-payment flags.", stage: "inReview", assignee: "Sam Rivera", date: "Jan 29", done: false, reviewDueDate: "2027-02-07" },

  // Reconciled — done, past dates.
  { id: "REC-121", title: "Reconcile November payroll", description: "All variances explained and approved.", stage: "reconciled", assignee: "Maya Chen", date: "Jan 30", done: true },
  { id: "REC-122", title: "Match customer deposits to invoices", description: "November deposits fully matched.", stage: "reconciled", assignee: "Jordan Lee", date: "Jan 30", done: true },
  { id: "REC-123", title: "Close out November bank reconciliation", description: "Signed off by the controller.", stage: "reconciled", assignee: "Priya Patel", date: "Jan 30", done: true },
  { id: "REC-124", title: "Verify sales tax remittance", description: "Confirmed against filed returns.", stage: "reconciled", assignee: "Alex Kim", date: "Jan 30", done: true },
  { id: "REC-125", title: "Reconcile fixed asset ledger", description: "Depreciation schedule matches the GL.", stage: "reconciled", assignee: "Sam Rivera", date: "Jan 30", done: true },
];

const STORAGE_KEY = "numosai-demo:tasks";

/** `assignee` used to allow `null` — a browser with that older shape still in `localStorage` would otherwise load tasks that crash every `assignee`-reading component (e.g. `avatarColorFor` indexing into a `null`). Falling back to the seed data on a shape mismatch is simpler and safer than writing a real migration for a demo with no actual data worth preserving. */
function isCurrentTask(value: unknown): value is Task {
  return typeof value === "object" && value !== null && typeof (value as Task).assignee === "string";
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isCurrentTask) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
