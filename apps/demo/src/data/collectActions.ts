export interface CollectActionThreadMessage {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  attachment?: string;
}

export interface CollectActionItem {
  id: string;
  /** The customer this line item is about. */
  customer: string;
  /** Short reference shown as the detail's subtitle — an invoice/account number and amount. */
  reference: string;
  description: string;
  timestamp: Date;
  attachment?: string;
  thread: CollectActionThreadMessage[];
  replyDraft: string;
}

export interface CollectBulkAction {
  id: string;
  /** The Task's own title on the Collect Work tab, e.g. "Send overdue payment notices to 12 customers". */
  title: string;
  description: string;
  /** e.g. "overdue payment notices" — builds the review modal's own dynamic header ("Send 11 overdue payment notices"). */
  noun: string;
  items: CollectActionItem[];
}

const TIMESTAMP = new Date(2026, 8, 11, 9, 15);

function overdueItem(id: string, customer: string, invoice: string, amount: string, daysOverdue: number): CollectActionItem {
  return {
    id,
    customer,
    reference: `Invoice ${invoice} · ${amount}`,
    description: `${customer}'s ${amount} invoice (${invoice}) is ${daysOverdue} days past due, with no response to the last reminder.`,
    timestamp: TIMESTAMP,
    thread: [],
    replyDraft: `Hi,\n\nThis is a reminder that invoice ${invoice} (${amount}) is now ${daysOverdue} days past due. Please remit payment at your earliest convenience, or reply if you have any questions.\n\nBest regards,`,
  };
}

function newInvoiceItem(id: string, customer: string, invoice: string, amount: string): CollectActionItem {
  return {
    id,
    customer,
    reference: `Invoice ${invoice} · ${amount}`,
    description: `${customer}'s invoice (${invoice}) for ${amount} is ready to send for this billing cycle's completed work.`,
    timestamp: TIMESTAMP,
    attachment: `Invoice-${invoice}.pdf`,
    thread: [],
    replyDraft: `Hi,\n\nPlease find attached invoice ${invoice} for ${amount}, due within 30 days. Let us know if you have any questions.\n\nBest regards,`,
  };
}

function confirmationItem(id: string, customer: string, invoice: string, amount: string): CollectActionItem {
  return {
    id,
    customer,
    reference: `Invoice ${invoice} · ${amount}`,
    description: `${customer}'s payment of ${amount} against invoice ${invoice} was received and applied.`,
    timestamp: TIMESTAMP,
    thread: [],
    replyDraft: `Hi,\n\nThank you — we've received and applied your payment of ${amount} against invoice ${invoice}. No further action is needed on your end.\n\nBest regards,`,
  };
}

export const COLLECT_BULK_ACTIONS: CollectBulkAction[] = [
  {
    id: "overdue",
    title: "Send overdue payment notices to 12 customers",
    description: "Customers with invoices more than 30 days past due — a reminder is queued for each.",
    noun: "overdue payment notices",
    items: [
      overdueItem("overdue-1", "Meridian Fitness Co.", "8821", "$1,240", 34),
      {
        ...overdueItem("overdue-2", "Blue Harbor Realty", "8834", "$3,600", 41),
        thread: [{ id: "overdue-2-t1", author: "Blue Harbor Realty", text: "Sorry for the delay — processing this week.", timestamp: TIMESTAMP }],
      },
      overdueItem("overdue-3", "Sunrise Bakery LLC", "8847", "$420", 32),
      overdueItem("overdue-4", "Ferro Metalworks", "8852", "$5,180", 47),
      overdueItem("overdue-5", "Cascade Dental Group", "8860", "$960", 33),
      overdueItem("overdue-6", "Union Square Cafe", "8871", "$310", 30),
      overdueItem("overdue-7", "Harbor View Consulting", "8879", "$2,750", 52),
      overdueItem("overdue-8", "Willow Creek Landscaping", "8884", "$1,090", 31),
      overdueItem("overdue-9", "Pinecrest Veterinary", "8892", "$680", 38),
      overdueItem("overdue-10", "Ashgrove Interiors", "8901", "$4,420", 45),
      overdueItem("overdue-11", "Riverside Auto Repair", "8909", "$1,530", 36),
      overdueItem("overdue-12", "Maple Street Bookshop", "8915", "$275", 30),
    ],
  },
  {
    id: "new-invoices",
    title: "Send invoices to 6 customers",
    description: "New invoices for completed work this billing cycle, ready to go out.",
    noun: "invoices",
    items: [
      newInvoiceItem("invoice-1", "Lantern Hill Yoga", "9021", "$540"),
      newInvoiceItem("invoice-2", "Cobalt Print Shop", "9022", "$1,860"),
      newInvoiceItem("invoice-3", "Greenfield Organic Market", "9023", "$2,240"),
      newInvoiceItem("invoice-4", "Anchor Point Marina", "9024", "$3,975"),
      newInvoiceItem("invoice-5", "Briarwood Dental", "9025", "$1,120"),
      newInvoiceItem("invoice-6", "Copperline Electric", "9026", "$4,650"),
    ],
  },
  {
    id: "confirmations",
    title: "Send payment confirmations to 4 customers",
    description: "Payments received and applied this week — a confirmation receipt is queued for each.",
    noun: "payment confirmations",
    items: [
      confirmationItem("confirm-1", "Thistle & Sage Florist", "8790", "$610"),
      {
        ...confirmationItem("confirm-2", "Ironclad Fitness", "8801", "$2,300"),
        thread: [{ id: "confirm-2-t1", author: "Ironclad Fitness", text: "Great, thanks for confirming!", timestamp: TIMESTAMP }],
      },
      confirmationItem("confirm-3", "Nightingale Media", "8814", "$1,475"),
      confirmationItem("confirm-4", "Foothill Hardware", "8822", "$890"),
    ],
  },
];
