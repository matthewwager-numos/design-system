export interface AccrualCountry {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  /** Portion of this period's expenses not yet paid out. */
  accrued: number;
  /** Planned revenue for this period, for a Revenue vs. Budget variance. */
  budget: number;
  costCenter: string;
  glAccount: string;
}

export interface AccrualRegion {
  id: string;
  name: string;
  countries: AccrualCountry[];
}

export interface AccrualTotals {
  revenue: number;
  expenses: number;
  netProfit: number;
  accrued: number;
  budget: number;
  variance: number;
}

/**
 * Every column this table can show — "Region" isn't here since it's the
 * row label column, always shown first and never reorderable. `numeric`
 * drives both alignment and currency formatting; the two categorical ones
 * (`costCenter`/`glAccount`) are per-country attributes that don't
 * meaningfully aggregate, so region/grand-total rows show "—" for them.
 */
export interface AccrualColumnDef {
  id: string;
  label: string;
  numeric: boolean;
}

export const ACCRUAL_COLUMNS: AccrualColumnDef[] = [
  { id: "revenue", label: "Revenue", numeric: true },
  { id: "expenses", label: "Expenses", numeric: true },
  { id: "netProfit", label: "Net Profit", numeric: true },
  { id: "accrued", label: "Accrued Amount", numeric: true },
  { id: "budget", label: "Budget", numeric: true },
  { id: "variance", label: "Variance", numeric: true },
  { id: "costCenter", label: "Cost Center", numeric: false },
  { id: "glAccount", label: "GL Account", numeric: false },
];

export const DEFAULT_ACCRUAL_COLUMN_IDS = ["revenue", "expenses", "netProfit"];

export const ACCRUAL_REGIONS: AccrualRegion[] = [
  {
    id: "north-america",
    name: "North America",
    countries: [
      { id: "us", name: "US", revenue: 412_500, expenses: 268_300, accrued: 52_400, budget: 395_000, costCenter: "CC-100", glAccount: "4000 · Sales Revenue" },
      { id: "canada", name: "Canada", revenue: 98_200, expenses: 61_400, accrued: 11_800, budget: 102_000, costCenter: "CC-110", glAccount: "4000 · Sales Revenue" },
      { id: "mexico", name: "Mexico", revenue: 54_800, expenses: 39_900, accrued: 8_200, budget: 50_000, costCenter: "CC-120", glAccount: "4000 · Sales Revenue" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    countries: [
      { id: "uk", name: "UK", revenue: 187_300, expenses: 122_600, accrued: 24_100, budget: 180_000, costCenter: "CC-200", glAccount: "4010 · EMEA Revenue" },
      { id: "germany", name: "Germany", revenue: 165_900, expenses: 108_200, accrued: 21_300, budget: 175_000, costCenter: "CC-210", glAccount: "4010 · EMEA Revenue" },
      { id: "france", name: "France", revenue: 142_400, expenses: 97_800, accrued: 18_600, budget: 140_000, costCenter: "CC-220", glAccount: "4010 · EMEA Revenue" },
    ],
  },
  {
    id: "africa",
    name: "Africa",
    countries: [
      { id: "south-africa", name: "South Africa", revenue: 61_200, expenses: 44_500, accrued: 9_100, budget: 65_000, costCenter: "CC-300", glAccount: "4020 · EMEA Revenue" },
      { id: "nigeria", name: "Nigeria", revenue: 38_900, expenses: 27_100, accrued: 5_400, budget: 35_000, costCenter: "CC-310", glAccount: "4020 · EMEA Revenue" },
      { id: "egypt", name: "Egypt", revenue: 29_600, expenses: 21_300, accrued: 4_200, budget: 30_000, costCenter: "CC-320", glAccount: "4020 · EMEA Revenue" },
    ],
  },
  {
    id: "pacific",
    name: "Pacific",
    countries: [
      { id: "australia", name: "Australia", revenue: 103_700, expenses: 68_900, accrued: 13_500, budget: 95_000, costCenter: "CC-400", glAccount: "4030 · APAC Revenue" },
      { id: "new-zealand", name: "New Zealand", revenue: 31_200, expenses: 22_400, accrued: 4_300, budget: 32_000, costCenter: "CC-410", glAccount: "4030 · APAC Revenue" },
      { id: "fiji", name: "Fiji", revenue: 8_600, expenses: 6_100, accrued: 1_200, budget: 9_000, costCenter: "CC-420", glAccount: "4030 · APAC Revenue" },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    countries: [
      { id: "japan", name: "Japan", revenue: 221_800, expenses: 149_300, accrued: 29_400, budget: 210_000, costCenter: "CC-500", glAccount: "4040 · APAC Revenue" },
      { id: "china", name: "China", revenue: 356_400, expenses: 241_700, accrued: 47_800, budget: 330_000, costCenter: "CC-510", glAccount: "4040 · APAC Revenue" },
      { id: "india", name: "India", revenue: 178_500, expenses: 118_900, accrued: 23_200, budget: 190_000, costCenter: "CC-520", glAccount: "4040 · APAC Revenue" },
    ],
  },
];

export function regionTotals(region: AccrualRegion): AccrualTotals {
  const revenue = region.countries.reduce((sum, country) => sum + country.revenue, 0);
  const expenses = region.countries.reduce((sum, country) => sum + country.expenses, 0);
  const accrued = region.countries.reduce((sum, country) => sum + country.accrued, 0);
  const budget = region.countries.reduce((sum, country) => sum + country.budget, 0);
  return { revenue, expenses, netProfit: revenue - expenses, accrued, budget, variance: revenue - budget };
}

export function grandTotals(regions: AccrualRegion[]): AccrualTotals {
  return regions.reduce(
    (acc, region) => {
      const totals = regionTotals(region);
      return {
        revenue: acc.revenue + totals.revenue,
        expenses: acc.expenses + totals.expenses,
        netProfit: acc.netProfit + totals.netProfit,
        accrued: acc.accrued + totals.accrued,
        budget: acc.budget + totals.budget,
        variance: acc.variance + totals.variance,
      };
    },
    { revenue: 0, expenses: 0, netProfit: 0, accrued: 0, budget: 0, variance: 0 },
  );
}

export const accrualCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
