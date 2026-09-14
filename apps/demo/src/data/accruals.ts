/**
 * Vendor spend/accrual tracking — modeled on a real product screenshot:
 * a vendor row rolls up its own subsidiaries/sub-accounts, with three
 * months of actual spend, the current month's MTD figure, a month-over-
 * month variance, a trailing 3-month average, and the accrual amount
 * itself (cost incurred but not yet invoiced — AWS/Cursor below carry a
 * real accrual with $0 actuals for exactly that reason, matching the
 * reference). Numbers here are independently made up, not copied from
 * that screenshot.
 */
export interface AccrualSubsidiary {
  id: string;
  name: string;
  mayActual: number;
  junActual: number;
  julActual: number;
  augMtd: number;
  accrualAmount: number;
  category: string;
}

export interface AccrualVendor {
  id: string;
  name: string;
  subsidiaries: AccrualSubsidiary[];
}

export interface AccrualTotals {
  mayActual: number;
  junActual: number;
  julActual: number;
  augMtd: number;
  momVariance: number;
  threeMonthAverage: number;
  accrualAmount: number;
  ytdActual: number;
  /** The independent, budgeted figure this total was expected to land at — on the old vendor→subsidiary model (which has no real forecast input of its own) this is still just `ytdActual + accrualAmount`, unchanged from before; the dimensional model below sums a genuine per-posting `forecast` instead. */
  forecast: number;
}

/**
 * Every column this table can show — the row label column isn't here
 * since it's always shown first and never reorderable (and, since it can
 * show any of the 5 dimensions depending on Table Settings' own "Group
 * by", it isn't a fixed "Vendor" column anymore either). `numeric` drives
 * both alignment and currency formatting — `false` for a few (`assignedTo`,
 * `confidence`, `journalEntry`) that aren't plain figures and get their own
 * bespoke `<Cell>` rendering in `TableTab` instead.
 *
 * `assignedTo`/`forecast`/`confidence`/`journalEntry` are the new default
 * columns for the Table tab's own action-oriented view (see `TableTab`'s
 * `DEFAULT_COLUMN_IDS`); the older per-month figures stay defined here too
 * so they're still addable via Table Settings, just no longer shown by
 * default. `accrualAmount`/`ytdActual` are unchanged data, only relabeled
 * ("Accrual"/"Actual") to match that same new default view.
 */
export interface AccrualColumnDef {
  id: string;
  label: string;
  numeric: boolean;
}

export const ACCRUAL_COLUMNS: AccrualColumnDef[] = [
  { id: "assignedTo", label: "Assigned to", numeric: false },
  { id: "forecast", label: "Forecast", numeric: true },
  { id: "mayActual", label: "May-26 Actual", numeric: true },
  { id: "junActual", label: "Jun-26 Actual", numeric: true },
  { id: "julActual", label: "Jul-26 Actual", numeric: true },
  { id: "augMtd", label: "Aug-26 MTD", numeric: true },
  { id: "momVariance", label: "MoM Variance", numeric: true },
  { id: "threeMonthAverage", label: "3-Month Average", numeric: true },
  { id: "accrualAmount", label: "Accrual", numeric: true },
  { id: "ytdActual", label: "Actual", numeric: true },
  { id: "confidence", label: "Confidence", numeric: false },
  { id: "journalEntry", label: "Journal Entry", numeric: false },
];

export const DEFAULT_ACCRUAL_COLUMN_IDS = [
  "mayActual",
  "junActual",
  "julActual",
  "augMtd",
  "momVariance",
  "threeMonthAverage",
  "accrualAmount",
];

export const ACCRUAL_VENDORS: AccrualVendor[] = [
  {
    id: "aws",
    name: "AWS",
    subsidiaries: [
      { id: "aws-compute", name: "AWS – Compute", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 512_300, category: "Cloud Infrastructure" },
      { id: "aws-storage", name: "AWS – Storage", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 233_679, category: "Cloud Infrastructure" },
    ],
  },
  {
    id: "anysphere",
    name: "Anysphere, Inc.",
    subsidiaries: [
      { id: "anysphere-api", name: "Anysphere – API", mayActual: 265_400, junActual: 312_900, julActual: 108_600, augMtd: 41_200, accrualAmount: 398_500, category: "AI/ML Platform" },
      { id: "anysphere-ent", name: "Anysphere – Enterprise", mayActual: 128_305, junActual: 174_864, julActual: 60_395, augMtd: 18_900, accrualAmount: 240_102, category: "AI/ML Platform" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    subsidiaries: [
      { id: "anthropic-api", name: "Anthropic – API", mayActual: 401_200, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 380_400, category: "AI/ML Platform" },
      { id: "anthropic-ent", name: "Anthropic – Enterprise", mayActual: 140_150, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 153_709, category: "AI/ML Platform" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI, LLC",
    subsidiaries: [
      { id: "openai-api", name: "OpenAI – API", mayActual: 88_390, junActual: 165_032, julActual: 241_106, augMtd: 96_500, accrualAmount: 220_822, category: "AI/ML Platform" },
      { id: "openai-ent", name: "OpenAI – Enterprise", mayActual: 43_000, junActual: 78_000, julActual: 120_000, augMtd: 51_400, accrualAmount: 130_000, category: "AI/ML Platform" },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    subsidiaries: [
      { id: "cursor-seats", name: "Cursor – Seats", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 187_452, category: "AI/ML Platform" },
      { id: "cursor-usage", name: "Cursor – Usage", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, accrualAmount: 139_460, category: "AI/ML Platform" },
    ],
  },
  {
    id: "iteration",
    name: "Iteration, Inc.",
    subsidiaries: [
      { id: "iteration-core", name: "Iteration – Core", mayActual: 155_442, junActual: 152_175, julActual: 149_213, augMtd: 480_947, accrualAmount: 162_367, category: "AI/ML Platform" },
      { id: "iteration-addon", name: "Iteration – Add-ons", mayActual: 69_000, junActual: 68_000, julActual: 67_000, augMtd: 279_000, accrualAmount: 100_000, category: "AI/ML Platform" },
    ],
  },
  {
    id: "confluent",
    name: "Confluent Inc.",
    subsidiaries: [
      { id: "confluent-cloud", name: "Confluent – Cloud", mayActual: -30_860, junActual: 55_885, julActual: -55_885, augMtd: 0, accrualAmount: 105_044, category: "Collaboration Software" },
      { id: "confluent-support", name: "Confluent – Support", mayActual: -18_000, junActual: 30_000, julActual: -30_000, augMtd: 0, accrualAmount: 70_000, category: "Collaboration Software" },
    ],
  },
  {
    id: "amazon-web-services",
    name: "Amazon Web Services Inc.",
    subsidiaries: [
      { id: "awsinc-prod", name: "AWS Inc. – Production", mayActual: 1_705_137, junActual: 1_666_902, julActual: 2_035_147, augMtd: 403_649, accrualAmount: 89_721, category: "Cloud Infrastructure" },
      { id: "awsinc-dr", name: "AWS Inc. – Disaster Recovery", mayActual: 900_000, junActual: 900_000, julActual: 1_100_000, augMtd: 200_000, accrualAmount: 40_000, category: "Cloud Infrastructure" },
    ],
  },
  {
    id: "safetykit",
    name: "SafetyKit, Inc.",
    subsidiaries: [
      { id: "safetykit-core", name: "SafetyKit – Core", mayActual: 18_266, junActual: 14_766, julActual: 14_766, augMtd: -60_193, accrualAmount: 76_940, category: "Security" },
      { id: "safetykit-addon", name: "SafetyKit – Add-ons", mayActual: 10_000, junActual: 8_000, julActual: 8_000, augMtd: -29_000, accrualAmount: 40_000, category: "Security" },
    ],
  },
];

function computeTotals(subsidiaries: AccrualSubsidiary[]): AccrualTotals {
  const mayActual = subsidiaries.reduce((sum, s) => sum + s.mayActual, 0);
  const junActual = subsidiaries.reduce((sum, s) => sum + s.junActual, 0);
  const julActual = subsidiaries.reduce((sum, s) => sum + s.julActual, 0);
  const augMtd = subsidiaries.reduce((sum, s) => sum + s.augMtd, 0);
  const accrualAmount = subsidiaries.reduce((sum, s) => sum + s.accrualAmount, 0);
  const ytdActual = mayActual + junActual + julActual + augMtd;
  return {
    mayActual,
    junActual,
    julActual,
    augMtd,
    momVariance: augMtd - julActual,
    threeMonthAverage: (mayActual + junActual + julActual) / 3,
    accrualAmount,
    ytdActual,
    forecast: ytdActual + accrualAmount,
  };
}

export function vendorTotals(vendor: AccrualVendor): AccrualTotals {
  return computeTotals(vendor.subsidiaries);
}

export function subsidiaryTotals(subsidiary: AccrualSubsidiary): AccrualTotals {
  return computeTotals([subsidiary]);
}

export function grandTotals(vendors: AccrualVendor[]): AccrualTotals {
  return computeTotals(vendors.flatMap((vendor) => vendor.subsidiaries));
}

/** A subsidiary carries no back-reference to its own vendor — this resolves one by id instead of denormalizing a `vendorId` onto `AccrualSubsidiary`. */
export function findSubsidiary(id: string): { vendor: AccrualVendor; subsidiary: AccrualSubsidiary } | undefined {
  for (const vendor of ACCRUAL_VENDORS) {
    const subsidiary = vendor.subsidiaries.find((candidate) => candidate.id === id);
    if (subsidiary) return { vendor, subsidiary };
  }
  return undefined;
}

/** A plain-language explanation built from the entry's own real numbers — not a static blob, since it needs to actually describe *this* entry. */
export function accrualReasoning(vendor: AccrualVendor, subsidiary: AccrualSubsidiary): string {
  const totals = subsidiaryTotals(subsidiary);
  const amount = accrualCurrency.format(subsidiary.accrualAmount);
  const varianceDirection = totals.momVariance >= 0 ? "up" : "down";
  const variance = accrualCurrency.format(Math.abs(totals.momVariance));
  const average = accrualCurrency.format(totals.threeMonthAverage);
  return `${vendor.name} – ${subsidiary.name} is accruing ${amount} this month for ${subsidiary.category}. Month-over-month spend is ${varianceDirection} ${variance} versus July, against a trailing 3-month average of ${average}.`;
}

/*
 * ── Dimensional model (Table tab only) ──────────────────────────────────
 *
 * A second, independent model of the same domain — the Table tab's own
 * "group by any dimension, break down by any other" pivot. Deliberately
 * NOT a replacement for `ACCRUAL_VENDORS` above (Overview/History/
 * `VendorDetailDrawer` all still use that one, unchanged): this is a real
 * fact table of individually-tagged postings, where the vendor/subsidiary/
 * department/location/GL-account model above is a fixed, pre-grouped
 * rollup. Keeping them separate means the Table tab's pivot doesn't have
 * to fight the other tabs' simpler, fixed vendor→subsidiary shape.
 *
 * `subsidiary` here means the user's own dummy company's legal entities
 * (e.g. "Numos UK Ltd."), not a vendor's own sub-account — an unfortunate
 * name collision with `AccrualSubsidiary` above (that one's a vendor's
 * *own* product line, e.g. "AWS – Compute"), but it's what the real
 * accounting term means, and what the Table Settings UI calls it.
 */

export type AccrualDimensionKey = "vendor" | "subsidiary" | "department" | "location" | "glAccount";

export interface AccrualDimensionValue {
  id: string;
  name: string;
}

export const ACCRUAL_DIMENSION_LABELS: Record<AccrualDimensionKey, string> = {
  vendor: "Vendor",
  subsidiary: "Subsidiary",
  department: "Department",
  location: "Location",
  glAccount: "GL Account",
};

/** Five values each, deliberately — every dimension is equally simple to pick as either the primary key or the breakdown. */
export const ACCRUAL_DIMENSION_VALUES: Record<AccrualDimensionKey, AccrualDimensionValue[]> = {
  vendor: [
    { id: "aws", name: "AWS" },
    { id: "anysphere", name: "Anysphere, Inc." },
    { id: "anthropic", name: "Anthropic" },
    { id: "openai", name: "OpenAI, LLC" },
    { id: "confluent", name: "Confluent Inc." },
  ],
  subsidiary: [
    { id: "numos-us", name: "Numos US, Inc." },
    { id: "numos-uk", name: "Numos UK Ltd." },
    { id: "numos-ca", name: "Numos Canada Inc." },
    { id: "numos-de", name: "Numos GmbH" },
    { id: "numos-sg", name: "Numos Pte. Ltd." },
  ],
  department: [
    { id: "engineering", name: "Engineering" },
    { id: "sales", name: "Sales" },
    { id: "marketing", name: "Marketing" },
    { id: "finance", name: "Finance" },
    { id: "operations", name: "Operations" },
  ],
  location: [
    { id: "sf", name: "San Francisco HQ" },
    { id: "nyc", name: "New York" },
    { id: "london", name: "London" },
    { id: "austin", name: "Austin" },
    { id: "remote", name: "Remote" },
  ],
  glAccount: [
    { id: "gl-software", name: "6100 – Software & Subscriptions" },
    { id: "gl-cloud", name: "6150 – Cloud Infrastructure" },
    { id: "gl-professional", name: "6200 – Professional Services" },
    { id: "gl-facilities", name: "6300 – Facilities & Equipment" },
    { id: "gl-travel", name: "6400 – Travel & Entertainment" },
  ],
};

/**
 * One line item = one posting, tagged with exactly one value from every
 * dimension at once — matches how a real GL entry is coded (vendor,
 * entity, department, location, and account, all on the same line).
 *
 * `forecast` is the independent figure this posting was budgeted/expected
 * to land at — set ahead of time, not derived from anything else here.
 * `augMtd` is what's actually been recorded (booked from real invoices) by
 * this month's close. The accrual itself is never stored: it's always
 * `accrualFor(item)`, the rounded gap between the two (see below) — an
 * accrual only ever plugs a shortfall against a target, it doesn't exist
 * independently of one.
 */
export interface AccrualLineItem {
  id: string;
  vendorId: string;
  subsidiaryId: string;
  departmentId: string;
  locationId: string;
  glAccountId: string;
  mayActual: number;
  junActual: number;
  julActual: number;
  augMtd: number;
  forecast: number;
}

/**
 * 25 postings — vendor × a fixed generator index, arranged as a set of
 * mutually orthogonal Latin squares over the other 4 dimensions. That's
 * what makes every possible primary-key/breakdown pair in Table Settings
 * come back fully populated: fixing any one dimension's value always
 * leaves the other four ranging over all 5 of *their* own values exactly
 * once — never a sparse or lopsided breakdown, whichever two dimensions
 * get picked.
 *
 * `li-26`/`li-27` are deliberate exceptions, added on top of that clean
 * 25 — each re-uses an existing (vendor, GL account) pair under a second
 * subsidiary, the real-world case of two entities both routing the same
 * kind of vendor spend through the same account code. That's a 3-key
 * relationship (vendor + account fixed, subsidiary varying) a 2-axis
 * pivot can't show as cleanly-separate single-posting cells, so the
 * default Vendor→GL Account view rolls the pair up into one combined row
 * instead (same treatment a parent group row already gets) — see
 * `relatedPostings` and the drawer's own "Related postings" section for
 * where this is surfaced directly.
 */
export const ACCRUAL_LINE_ITEMS: AccrualLineItem[] = [
  { id: "li-01", vendorId: "aws", subsidiaryId: "numos-us", departmentId: "engineering", locationId: "sf", glAccountId: "gl-software", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 186_300 },
  { id: "li-02", vendorId: "aws", subsidiaryId: "numos-uk", departmentId: "sales", locationId: "nyc", glAccountId: "gl-cloud", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 512_300 },
  { id: "li-03", vendorId: "aws", subsidiaryId: "numos-ca", departmentId: "marketing", locationId: "london", glAccountId: "gl-professional", mayActual: 42_000, junActual: 38_500, julActual: 45_200, augMtd: 12_100, forecast: 152_800 },
  { id: "li-04", vendorId: "aws", subsidiaryId: "numos-de", departmentId: "finance", locationId: "austin", glAccountId: "gl-facilities", mayActual: 8_200, junActual: 7_900, julActual: 8_400, augMtd: 2_100, forecast: 29_600 },
  { id: "li-05", vendorId: "aws", subsidiaryId: "numos-sg", departmentId: "operations", locationId: "remote", glAccountId: "gl-travel", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 0 },

  { id: "li-06", vendorId: "anysphere", subsidiaryId: "numos-ca", departmentId: "engineering", locationId: "nyc", glAccountId: "gl-facilities", mayActual: 265_400, junActual: 312_900, julActual: 108_600, augMtd: 41_200, forecast: 1_126_600 },
  { id: "li-07", vendorId: "anysphere", subsidiaryId: "numos-de", departmentId: "sales", locationId: "london", glAccountId: "gl-travel", mayActual: 32_000, junActual: 29_500, julActual: 31_200, augMtd: 9_800, forecast: 113_500 },
  { id: "li-08", vendorId: "anysphere", subsidiaryId: "numos-sg", departmentId: "marketing", locationId: "austin", glAccountId: "gl-software", mayActual: 128_305, junActual: 174_864, julActual: 60_395, augMtd: 18_900, forecast: 622_566 },
  { id: "li-09", vendorId: "anysphere", subsidiaryId: "numos-us", departmentId: "finance", locationId: "remote", glAccountId: "gl-cloud", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 0 },
  { id: "li-10", vendorId: "anysphere", subsidiaryId: "numos-uk", departmentId: "operations", locationId: "sf", glAccountId: "gl-professional", mayActual: 22_100, junActual: 20_800, julActual: 23_400, augMtd: 6_900, forecast: 81_300 },

  { id: "li-11", vendorId: "anthropic", subsidiaryId: "numos-sg", departmentId: "engineering", locationId: "london", glAccountId: "gl-cloud", mayActual: 401_200, junActual: 0, julActual: 0, augMtd: 0, forecast: 781_600 },
  { id: "li-12", vendorId: "anthropic", subsidiaryId: "numos-us", departmentId: "sales", locationId: "austin", glAccountId: "gl-professional", mayActual: 140_150, junActual: 0, julActual: 0, augMtd: 0, forecast: 293_859 },
  { id: "li-13", vendorId: "anthropic", subsidiaryId: "numos-uk", departmentId: "marketing", locationId: "remote", glAccountId: "gl-facilities", mayActual: 24_800, junActual: 22_100, julActual: 25_600, augMtd: 7_300, forecast: 89_000 },
  { id: "li-14", vendorId: "anthropic", subsidiaryId: "numos-ca", departmentId: "finance", locationId: "sf", glAccountId: "gl-travel", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 0 },
  { id: "li-15", vendorId: "anthropic", subsidiaryId: "numos-de", departmentId: "operations", locationId: "nyc", glAccountId: "gl-software", mayActual: 19_600, junActual: 18_200, julActual: 20_100, augMtd: 5_800, forecast: 71_100 },

  { id: "li-16", vendorId: "openai", subsidiaryId: "numos-uk", departmentId: "engineering", locationId: "austin", glAccountId: "gl-travel", mayActual: 88_390, junActual: 165_032, julActual: 241_106, augMtd: 96_500, forecast: 811_850 },
  { id: "li-17", vendorId: "openai", subsidiaryId: "numos-ca", departmentId: "sales", locationId: "remote", glAccountId: "gl-software", mayActual: 43_000, junActual: 78_000, julActual: 120_000, augMtd: 51_400, forecast: 422_400 },
  { id: "li-18", vendorId: "openai", subsidiaryId: "numos-de", departmentId: "marketing", locationId: "sf", glAccountId: "gl-cloud", mayActual: 21_400, junActual: 25_800, julActual: 31_200, augMtd: 13_100, forecast: 119_500 },
  { id: "li-19", vendorId: "openai", subsidiaryId: "numos-sg", departmentId: "finance", locationId: "nyc", glAccountId: "gl-professional", mayActual: 16_800, junActual: 19_200, julActual: 22_400, augMtd: 9_600, forecast: 87_500 },
  { id: "li-20", vendorId: "openai", subsidiaryId: "numos-us", departmentId: "operations", locationId: "london", glAccountId: "gl-facilities", mayActual: 12_100, junActual: 13_800, julActual: 15_900, augMtd: 6_700, forecast: 62_300 },

  { id: "li-21", vendorId: "confluent", subsidiaryId: "numos-de", departmentId: "engineering", locationId: "remote", glAccountId: "gl-professional", mayActual: -30_860, junActual: 55_885, julActual: -55_885, augMtd: 0, forecast: 74_184 },
  { id: "li-22", vendorId: "confluent", subsidiaryId: "numos-sg", departmentId: "sales", locationId: "sf", glAccountId: "gl-facilities", mayActual: -18_000, junActual: 30_000, julActual: -30_000, augMtd: 0, forecast: 52_000 },
  { id: "li-23", vendorId: "confluent", subsidiaryId: "numos-us", departmentId: "marketing", locationId: "nyc", glAccountId: "gl-travel", mayActual: 9_200, junActual: 8_600, julActual: 9_800, augMtd: 3_100, forecast: 36_900 },
  { id: "li-24", vendorId: "confluent", subsidiaryId: "numos-uk", departmentId: "finance", locationId: "london", glAccountId: "gl-software", mayActual: 0, junActual: 0, julActual: 0, augMtd: 0, forecast: 0 },
  { id: "li-25", vendorId: "confluent", subsidiaryId: "numos-ca", departmentId: "operations", locationId: "austin", glAccountId: "gl-cloud", mayActual: 11_200, junActual: 10_500, julActual: 11_900, augMtd: 3_800, forecast: 45_000 },

  { id: "li-26", vendorId: "confluent", subsidiaryId: "numos-de", departmentId: "operations", locationId: "remote", glAccountId: "gl-travel", mayActual: 4_100, junActual: 3_800, julActual: 4_400, augMtd: 1_200, forecast: 15_700 },
  { id: "li-27", vendorId: "anthropic", subsidiaryId: "numos-sg", departmentId: "sales", locationId: "austin", glAccountId: "gl-facilities", mayActual: 6_800, junActual: 6_200, julActual: 7_100, augMtd: 2_400, forecast: 25_800 },
];

/**
 * Accrual figures are rounded to a "nice" number, never booked to the
 * exact penny of an estimated gap — a real accrual is itself an estimate
 * (the true invoice hasn't arrived yet), so accountants round it, and the
 * rounding step scales with the size of the gap being covered.
 */
function roundAccrual(value: number): number {
  if (value <= 0) return 0;
  const step = value < 5_000 ? 100 : value < 50_000 ? 500 : 1_000;
  return Math.round(value / step) * step;
}

/** What's actually been recorded (booked from real invoices) so far — the same figure the table's own "Actual" column shows, just read off one posting directly instead of via `lineItemTotals`. */
function recordedFor(item: AccrualLineItem): number {
  return item.mayActual + item.junActual + item.julActual + item.augMtd;
}

/**
 * What still needs to be accrued: the rounded gap between what this
 * posting was forecasted to cost and what's actually been recorded so
 * far — never negative, since a posting that's already recorded at or
 * above its forecast has nothing left to accrue for. Matched against
 * `recordedFor` (not just this month's own MTD figure) so this lines up
 * with the same "Actual" total the table shows next to it — forecast,
 * actual, and accrual read as one consistent triangle on every row.
 */
export function accrualFor(item: AccrualLineItem): number {
  return roundAccrual(Math.max(0, item.forecast - recordedFor(item)));
}

/** Same math as `computeTotals` above, generalized to postings instead of a vendor's own subsidiaries — kept as a separate function since the two models' record shapes don't otherwise overlap. */
export function lineItemTotals(items: AccrualLineItem[]): AccrualTotals {
  const mayActual = items.reduce((sum, item) => sum + item.mayActual, 0);
  const junActual = items.reduce((sum, item) => sum + item.junActual, 0);
  const julActual = items.reduce((sum, item) => sum + item.julActual, 0);
  const augMtd = items.reduce((sum, item) => sum + item.augMtd, 0);
  const forecast = items.reduce((sum, item) => sum + item.forecast, 0);
  const accrualAmount = items.reduce((sum, item) => sum + accrualFor(item), 0);
  return {
    mayActual,
    junActual,
    julActual,
    augMtd,
    momVariance: augMtd - julActual,
    threeMonthAverage: (mayActual + junActual + julActual) / 3,
    accrualAmount,
    ytdActual: mayActual + junActual + julActual + augMtd,
    forecast,
  };
}

/** Other postings that share this same vendor *and* GL account, booked by a different subsidiary — two entities routing the same kind of vendor spend through the same account code, a real and common case a 2-axis pivot can't show as separately-clickable rows (see the `ACCRUAL_LINE_ITEMS` comment above `li-26`/`li-27`). */
export function relatedPostings(item: AccrualLineItem): AccrualLineItem[] {
  return ACCRUAL_LINE_ITEMS.filter(
    (candidate) => candidate.id !== item.id && candidate.vendorId === item.vendorId && candidate.glAccountId === item.glAccountId,
  );
}

/** True when every figure a posting (or a summed group of them) could show is exactly zero — no accrual and no actuals in any month. The Table tab treats this as "nothing here" and omits the row entirely, rather than showing a $0 line for a combination that has no real activity. */
export function isEmptyTotals(totals: AccrualTotals): boolean {
  return (
    totals.accrualAmount === 0 &&
    totals.mayActual === 0 &&
    totals.junActual === 0 &&
    totals.julActual === 0 &&
    totals.augMtd === 0
  );
}

/** A posting's own id for a given dimension — e.g. `lineItemDimensionId(item, "department")` reads `item.departmentId`. Centralizes the `${dimension}Id` field-name convention in one place instead of a switch repeated at every call site. */
export function lineItemDimensionId(item: AccrualLineItem, dimension: AccrualDimensionKey): string {
  return item[`${dimension}Id` as keyof AccrualLineItem] as string;
}

export function dimensionValueName(dimension: AccrualDimensionKey, id: string): string {
  return ACCRUAL_DIMENSION_VALUES[dimension].find((value) => value.id === id)?.name ?? id;
}

export function findLineItem(id: string): AccrualLineItem | undefined {
  return ACCRUAL_LINE_ITEMS.find((item) => item.id === id);
}

/** A plain-language explanation for one posting — same "describe the real numbers" approach as `accrualReasoning` above, adapted to a posting's own 5 dimension tags instead of a vendor/subsidiary pair. */
export function lineItemReasoning(item: AccrualLineItem): string {
  const vendor = dimensionValueName("vendor", item.vendorId);
  const glAccount = dimensionValueName("glAccount", item.glAccountId);
  const department = dimensionValueName("department", item.departmentId);
  const location = dimensionValueName("location", item.locationId);
  const accrual = accrualCurrency.format(accrualFor(item));
  const forecast = accrualCurrency.format(item.forecast);
  const recorded = accrualCurrency.format(recordedFor(item));
  return `${vendor} is accruing ${accrual} against ${glAccount}, coded to ${department} in ${location} — closing the gap between a ${forecast} forecast and ${recorded} recorded so far.`;
}

export const accrualCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Totals row only — matches the reference's own accounting-style negative format ("($3,584,537)"), distinct from individual rows' "-$X". */
export const accrualCurrencyAccounting = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  currencySign: "accounting",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** A short "$3.2M" form — for tight spaces like a donut chart's own center value, where even the no-decimal accounting format still runs long. */
export const accrualCurrencyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/*
 * ── Confidence / History / Evidence (Accrual detail drawer only) ────────
 *
 * All three are deterministic functions of a posting's own existing
 * fields (never a stored, hand-authored array per line item) — the same
 * "compute a real-looking value from real numbers" approach `lineItemTotals`/
 * `lineItemReasoning` already use, just extended to the drawer's newer
 * Confidence/History/Evidence sections. A small locally-seeded PRNG (from
 * the item's own id) stands in for "the actual signal a real confidence
 * model would use" — enough to vary plausibly across all 25 postings
 * without inventing 25 more hand-picked records.
 */

function seedFromId(id: string): number {
  const digits = Number(id.replace(/\D/g, "")) || 1;
  return digits;
}

export interface ConfidenceFactor {
  label: string;
  passed: boolean;
}

export interface Confidence {
  score: number;
  factors: ConfidenceFactor[];
}

/**
 * How accurate this posting's own recent estimates have turned out to be:
 * for each of the last 3 months, compares what the books actually landed
 * on (recorded + accrual — the same total the journal entry books) against
 * `final`, the true amount later verified by evidence. A posting whose
 * recorded+accrual consistently lands close to its own eventual final is
 * "historically accurate"; one that regularly needs correcting isn't —
 * which is exactly what real supporting evidence is for.
 */
function historicalAccuracyPct(item: AccrualLineItem): number {
  const errors = historyForLineItem(item).map(({ values }) => {
    if (values.final === 0) return 0;
    return Math.abs(values.final - (values.recorded + values.accrual)) / values.final;
  });
  const avgError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  return Math.round(Math.max(0, Math.min(100, 100 - avgError * 100)) * 10) / 10;
}

export function confidenceForLineItem(item: AccrualLineItem): Confidence {
  const seed = seedFromId(item.id);
  const hasMtd = item.augMtd !== 0;
  const accuracyPct = historicalAccuracyPct(item);
  const purchaseOrderOnFile = seed % 3 !== 0;
  const invoiceTimingConsistent = seed % 4 !== 0;

  const factors: ConfidenceFactor[] = [
    { label: `Actuals complete — through ${hasMtd ? "Aug MTD" : "Jul 31"}`, passed: true },
    { label: `${accuracyPct}% historical accuracy — 3 months`, passed: accuracyPct >= 80 },
    { label: `Budget aligned — ${accrualCurrencyCompact.format(accrualFor(item))}`, passed: true },
    { label: "Invoice timing consistent — after close", passed: invoiceTimingConsistent },
    { label: purchaseOrderOnFile ? "Purchase order on file" : "Purchase order unavailable", passed: purchaseOrderOnFile },
  ];

  // Weighted so a clean sweep tops out near 100 without any single factor
  // dominating — the accuracy factor's own share scales with how accurate
  // it actually is, not just a flat pass/fail, since "how accurate" is
  // itself a matter of degree the other four factors aren't.
  const weights = [20, 25, 20, 20, 15];
  const score = Math.round(
    factors.reduce((sum, factor, index) => {
      if (!factor.passed) return sum;
      return sum + (index === 1 ? weights[index]! * (accuracyPct / 100) : weights[index]!);
    }, 0),
  );

  return { score, factors };
}

/**
 * Whether a posting's own journal entry (the two auto-balanced lines
 * `AccrualDetailDrawer` seeds it with) is filled in and balanced — the
 * Table tab's own "Journal Entry" column and "Ready" pill in the drawer
 * both key off this exact status, not off confidence (a real entry can be
 * fully complete and still low-confidence, or vice versa — they're
 * independent axes, matching how the Table tab's own Action column
 * crosses both).
 */
export type JournalEntryCompleteness = "Complete" | "Incomplete" | "Not started";

export function journalEntryStatus(item: AccrualLineItem): JournalEntryCompleteness {
  const seed = seedFromId(item.id);
  if (seed % 7 === 0) return "Not started";
  if (seed % 4 === 0) return "Incomplete";
  return "Complete";
}

export type ConfidenceTier = "high" | "med" | "low";

/** Same red/yellow/green thresholds `<GaugeChart>`'s own default `"negative-to-positive"` mode uses, so a score reads the same way everywhere it's shown. */
export function confidenceTier(score: number): ConfidenceTier {
  if (score >= 67) return "high";
  if (score >= 34) return "med";
  return "low";
}

/** `null` before the journal entry has even started — there's nothing yet to be confident about. */
export function confidenceScoreForLineItem(item: AccrualLineItem): number | null {
  if (journalEntryStatus(item) === "Not started") return null;
  return confidenceForLineItem(item).score;
}

/**
 * The Table tab's own Action column — crosses confidence (high vs.
 * med-or-low-or-absent) with journal entry completeness:
 * high confidence + complete → Submit; med/low + complete → Review;
 * high confidence + incomplete → Complete; anything else + incomplete → Start.
 */
export type RowAction = "Submit" | "Review" | "Complete" | "Start";

export function actionForLineItem(item: AccrualLineItem): RowAction {
  const complete = journalEntryStatus(item) === "Complete";
  const score = confidenceScoreForLineItem(item);
  const highConfidence = score !== null && confidenceTier(score) === "high";
  if (complete) return highConfidence ? "Submit" : "Review";
  return highConfidence ? "Complete" : "Start";
}

export interface Assignee {
  name: string;
  subLabel: string;
}

/** Also the drawer's own "Assign" dropdown roster — the same small cast of people the Table tab can already assign a posting to. */
export const ACCRUAL_TEAMMATES: Assignee[] = [
  { name: "M. Lamont", subLabel: "Controller" },
  { name: "A. Butler", subLabel: "Staff Accountant" },
  { name: "J. Rivera", subLabel: "Senior Accountant" },
  { name: "S. Okafor", subLabel: "Staff Accountant" },
];

/** `null` means unassigned — the Table tab renders that as an "Assign" link instead of a name. */
export function assigneeForLineItem(item: AccrualLineItem): Assignee | null {
  const seed = seedFromId(item.id);
  if (seed % 5 === 0) return null;
  return ACCRUAL_TEAMMATES[seed % ACCRUAL_TEAMMATES.length]!;
}

/** 3 months, not 6 — matches the "3 months" of real actuals (`mayActual`/`junActual`/`julActual`) already referenced elsewhere (e.g. a Confidence factor's own "historical accuracy — 3 months"), and is what the drawer's own History chart is built around: 2 bars per month (a stacked Recorded+Accrual bar, and a solo Final bar), not one bar per month. */
export const ACCRUAL_HISTORY_MONTHS = ["Jan", "Feb", "Mar"];

export interface AccrualHistoryPoint {
  category: string;
  values: { recorded: number; accrual: number; final: number };
}

/**
 * A 3-month trend of one posting's own forecast → recorded → accrual →
 * final chain, deterministically varied per month rather than three flat
 * repeats of the same figure:
 *  - `recorded` — what actually got booked from real invoices by that
 *    month's close (a real fraction of `forecast`; invoices trickle in
 *    over the month, so this never quite reaches it).
 *  - `accrual` — the rounded gap between `forecast` and `recorded`, same
 *    as `accrualFor` above (this is what a real accrual always is: a
 *    plug against a target, not an independent figure).
 *  - `final` — what evidence later verifies the true cost to have been.
 *    Sometimes that lands close to `recorded + accrual`, sometimes it
 *    reveals a real miss — this gap is exactly what `historicalAccuracyPct`
 *    below measures.
 */
export function historyForLineItem(item: AccrualLineItem): AccrualHistoryPoint[] {
  const seed = seedFromId(item.id);
  return ACCRUAL_HISTORY_MONTHS.map((month, index) => {
    const bookedFraction = 0.82 + ((seed + index * 7) % 13) / 100; // 82%..94% booked by close
    const recorded = Math.round(item.forecast * bookedFraction);
    const accrual = roundAccrual(item.forecast - recorded);
    const verificationError = ((seed + index * 5) % 11) / 100 - 0.05; // -5%..+5%, what evidence later reveals
    const final = Math.round((recorded + accrual) * (1 + verificationError));
    return { category: month, values: { recorded, accrual, final } };
  });
}

export const EVIDENCE_TYPES = ["Purchase Order", "Trailing 3m Avg", "Budget", "Invoice", "Email", "GL Actual"] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** How many consecutive months (starting Jan) each evidence type has been collected for — the remaining months show an "add" affordance instead of a checkmark icon in the drawer's own Evidence table. */
export function evidenceCoverage(item: AccrualLineItem): Record<EvidenceType, number> {
  const seed = seedFromId(item.id);
  return {
    "Purchase Order": 2 + (seed % 2),
    "Trailing 3m Avg": 3,
    Budget: 3,
    Invoice: 2 + ((seed + 1) % 2),
    Email: 3,
    "GL Actual": 3,
  };
}
