export interface NotificationThreadMessage {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  attachment?: string;
}

export interface NotificationItem {
  id: string;
  /** The row's own full headline, e.g. "Jordan Lee assigned you an accrual review" — a complete sentence, not a subject line, so the detail header can show it as-is with no extra concatenation. */
  title: string;
  /** The colleague this notification is from/about — who "To:" addresses in the reply, not an external vendor/customer. */
  actor: string;
  /** Short object reference shown as the detail's subtitle and the reply's "Re:" line, e.g. "REC-107" or "Collect · Acme Plumbing, Inc." */
  reference: string;
  description: string;
  timestamp: Date;
  read: boolean;
  /** Bulk-only, like every other email client's own archive — no per-item affordance, see InboxTab.tsx's own footer. Archived items drop out of the inbox entirely (there's no separate "Archived" view in this demo yet). */
  archived: boolean;
  /** Bulk-only for now, same as `archived` — a visible marker (see the row's own meta) rather than an action with further consequences. */
  flagged: boolean;
  attachment?: string;
  thread: NotificationThreadMessage[];
  replyDraft: string;
}

const TIMESTAMP = new Date(2026, 6, 10, 12, 48);

/**
 * Seed data for the Notifications app's Inbox. This is a *global utility*
 * (see NavContent.tsx) sitting alongside Team/Settings, not one of the 8
 * workflow apps — so what lands here is internal finance-team collaboration
 * (assignments, comments, requests for evidence) generated *by* Collect/Pay/
 * Accrue/Reconcile/Close, not those apps' own external vendor/customer
 * correspondence. Reuses this demo's own established people (data/
 * employees.ts), task IDs (data/tasks.ts's REC-### board), and vendors
 * (data/accruals.ts) for continuity rather than inventing a parallel cast.
 */
export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Jordan Lee assigned you an accrual review",
    actor: "Jordan Lee",
    reference: "Accrue · AWS – Compute",
    description: "Jordan flagged the AWS – Compute accrual for your review before Friday's close — historical accuracy for this vendor is running at 92%.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    attachment: "AWS-Compute-Aug.xlsx",
    thread: [{ id: "n1-t1", author: "Jordan Lee", text: "Can you take a look before EOD Friday? Wanted a second set of eyes on the estimate.", timestamp: TIMESTAMP }],
    replyDraft: "Hi Jordan,\n\nOn it — I'll review the estimate and confirm before Friday's close.\n\nThanks,",
  },
  {
    id: "n2",
    title: "Maya Chen commented on your Acme Plumbing collection",
    actor: "Maya Chen",
    reference: "Collect · Acme Plumbing, Inc.",
    description: "Maya left a note on the Acme Plumbing collection — the customer is disputing a late fee and wants the payment terms confirmed.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    thread: [{ id: "n2-t1", author: "Maya Chen", text: "Customer says the late fee shouldn't apply — can you check the original terms?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Maya,\n\nChecking the original terms now — I'll follow up with what I find before we respond to the customer.\n\nThanks,",
  },
  {
    id: "n3",
    title: "Priya Patel requested evidence for REC-107",
    actor: "Priya Patel",
    reference: "REC-107 · Investigate unmatched wire transfer",
    description: "Priya can't close out the $12,400 unmatched wire without the confirmation on file — she's asked for it to be attached to the task.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: true,
    attachment: "Wire-Confirmation-12400.pdf",
    thread: [{ id: "n3-t1", author: "Priya Patel", text: "Do we have the wire confirmation on file for this one? Need it before I can close REC-107.", timestamp: TIMESTAMP }],
    replyDraft: "Hi Priya,\n\nFound it — confirmation is attached. Let me know if you need anything else to close this out.\n\nThanks,",
  },
  {
    id: "n4",
    title: "Alex Kim submitted an accrual for your review",
    actor: "Alex Kim",
    reference: "Accrue · Anthropic – Enterprise",
    description: "Alex submitted the Anthropic – Enterprise accrual for review ahead of month-end — flagged as a routine review, no exceptions noted.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    thread: [{ id: "n4-t1", author: "Alex Kim", text: "Submitted for review — nothing unusual this month, should be a quick approval.", timestamp: TIMESTAMP }],
    replyDraft: "Hi Alex,\n\nReviewed and looks good — approving now. Thanks for getting this in early.\n\nBest,",
  },
  {
    id: "n5",
    title: "Sam Rivera assigned you REC-111",
    actor: "Sam Rivera",
    reference: "REC-111 · Reconcile merchant processor fees",
    description: "Sam handed off the merchant processor fee reconciliation for January — processor statements are already attached to the task.",
    timestamp: TIMESTAMP,
    read: true,
    archived: false,
    flagged: false,
    thread: [{ id: "n5-t1", author: "Sam Rivera", text: "Reassigning this to you since I'm out next week — statements are already on the task.", timestamp: TIMESTAMP }],
    replyDraft: "Hi Sam,\n\nThanks for the heads up, I've got it from here. Enjoy the time off.\n\nBest,",
  },
  {
    id: "n6",
    title: "Drew Bennett commented on your Anysphere payment approval",
    actor: "Drew Bennett",
    reference: "Pay · Anysphere, Inc.",
    description: "Drew flagged that this month's Anysphere invoice total looks higher than usual and wants it double-checked before approval.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    attachment: "Anysphere-Invoice-Aug.pdf",
    thread: [{ id: "n6-t1", author: "Drew Bennett", text: "This total looks ~20% higher than last month — can you confirm before we approve the payment?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Drew,\n\nGood catch — checking the usage breakdown now before I approve.\n\nThanks,",
  },
  {
    id: "n7",
    title: "Casey Nguyen requested the OpenAI invoice",
    actor: "Casey Nguyen",
    reference: "Collect · OpenAI, LLC",
    description: "Casey needs the OpenAI, LLC invoice on hand for an upcoming audit sample and asked it be attached to this thread.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    attachment: "OpenAI-Invoice-Q3.pdf",
    thread: [{ id: "n7-t1", author: "Casey Nguyen", text: "Auditors pulled this one as a sample — can you attach the invoice here when you get a chance?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Casey,\n\nAttached — let me know if the auditors need anything else from this one.\n\nBest,",
  },
  {
    id: "n8",
    title: "Riley Thompson flagged an overdue task",
    actor: "Riley Thompson",
    reference: "REC-109 · Review flagged ACH returns",
    description: "Riley noticed REC-109 has been sitting in your queue for a few days and wanted to check whether it's blocked on anything.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    thread: [{ id: "n8-t1", author: "Riley Thompson", text: "This one's been open a few days — blocked on anything, or just backlog?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Riley,\n\nJust backlog — I'll get to it today and update the task.\n\nThanks for checking in,",
  },
  {
    id: "n9",
    title: "Taylor Kim approved your AWS – Storage accrual",
    actor: "Taylor Kim",
    reference: "Accrue · AWS – Storage",
    description: "Taylor reviewed and approved the AWS – Storage accrual — no further action needed.",
    timestamp: TIMESTAMP,
    read: true,
    archived: false,
    flagged: false,
    thread: [{ id: "n9-t1", author: "Taylor Kim", text: "Approved — nice work keeping the estimate tight this month.", timestamp: TIMESTAMP }],
    replyDraft: "Thanks, Taylor — appreciate it!",
  },
  {
    id: "n10",
    title: "Jamie Alvarez commented on REC-118",
    actor: "Jamie Alvarez",
    reference: "REC-118 · Verify vendor 1099 totals",
    description: "Jamie thinks one vendor's YTD total may be missing a late-filed payment and wants it confirmed before sign-off.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    thread: [{ id: "n10-t1", author: "Jamie Alvarez", text: "One vendor's total looks light — might be missing a late-filed payment. Can you confirm before we sign off?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Jamie,\n\nGood catch, checking now — will update the task with what I find.\n\nThanks,",
  },
  {
    id: "n11",
    title: "Morgan Diaz assigned you REC-103",
    actor: "Morgan Diaz",
    reference: "REC-103 · Review duplicate vendor payments",
    description: "Morgan spotted two potential duplicate payments in AP and assigned the review to you ahead of this week's close.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    attachment: "AP-Duplicate-Flags.xlsx",
    thread: [{ id: "n11-t1", author: "Morgan Diaz", text: "Flagged two possible duplicates in AP — details attached. Can you confirm before Thursday?", timestamp: TIMESTAMP }],
    replyDraft: "Hi Morgan,\n\nThanks for flagging — I'll confirm both and close this out before Thursday.\n\nBest,",
  },
  {
    id: "n12",
    title: "Skyler Brooks requested evidence for the Acme dispute",
    actor: "Skyler Brooks",
    reference: "Collect · Acme Plumbing, Inc.",
    description: "Awaiting the signed contract from Acme Plumbing before the late-fee dispute can be resolved.",
    timestamp: TIMESTAMP,
    read: false,
    archived: false,
    flagged: false,
    thread: [],
    replyDraft: "",
  },
];
