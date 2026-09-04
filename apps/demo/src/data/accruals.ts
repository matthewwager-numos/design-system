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
}

/**
 * Every column this table can show — "Vendor" isn't here since it's the
 * row label column, always shown first and never reorderable. `numeric`
 * drives both alignment and currency formatting; `category` is a
 * per-subsidiary attribute that doesn't meaningfully aggregate, so
 * vendor/grand-total rows show "—" for it.
 */
export interface AccrualColumnDef {
  id: string;
  label: string;
  numeric: boolean;
}

export const ACCRUAL_COLUMNS: AccrualColumnDef[] = [
  { id: "mayActual", label: "May-26 Actual", numeric: true },
  { id: "junActual", label: "Jun-26 Actual", numeric: true },
  { id: "julActual", label: "Jul-26 Actual", numeric: true },
  { id: "augMtd", label: "Aug-26 MTD", numeric: true },
  { id: "momVariance", label: "MoM Variance", numeric: true },
  { id: "threeMonthAverage", label: "3-Month Average", numeric: true },
  { id: "accrualAmount", label: "Accrual Amount", numeric: true },
  { id: "ytdActual", label: "YTD Actual", numeric: true },
  { id: "category", label: "Category", numeric: false },
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
  return {
    mayActual,
    junActual,
    julActual,
    augMtd,
    momVariance: augMtd - julActual,
    threeMonthAverage: (mayActual + junActual + julActual) / 3,
    accrualAmount,
    ytdActual: mayActual + junActual + julActual + augMtd,
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
