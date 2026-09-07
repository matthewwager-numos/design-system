import { Receipt } from "lucide-react";
import { AreaChart, BarChart, DisplayMetric, DonutChart, IconChart } from "@numosai/ui";
import { ACCRUAL_VENDORS, accrualCurrency, accrualCurrencyCompact, grandTotals, vendorTotals } from "../../data/accruals";

export function OverviewTab() {
  const totals = grandTotals(ACCRUAL_VENDORS);

  const spendTrend = [
    { date: new Date(2026, 4, 1), value: totals.mayActual },
    { date: new Date(2026, 5, 1), value: totals.junActual },
    { date: new Date(2026, 6, 1), value: totals.julActual },
    { date: new Date(2026, 7, 1), value: totals.augMtd },
  ];

  // BarChart/DonutChart show raw numbers with no currency/thousands
  // formatting hook (unlike AreaChart's own `formatValue`) — dividing by
  // 1000 keeps their axis ticks/tooltips readable for figures this large;
  // the section labels below say so explicitly rather than leaving it
  // unexplained.
  const categoryTotals = new Map<string, number>();
  for (const vendor of ACCRUAL_VENDORS) {
    for (const subsidiary of vendor.subsidiaries) {
      categoryTotals.set(subsidiary.category, (categoryTotals.get(subsidiary.category) ?? 0) + subsidiary.accrualAmount);
    }
  }
  const byCategory = Array.from(categoryTotals.entries()).map(([label, value]) => ({ label, value: Math.round(value / 1000) }));
  const categoryGrandTotal = Array.from(categoryTotals.values()).reduce((sum, value) => sum + value, 0);

  const byVendor = ACCRUAL_VENDORS.map((vendor) => ({ label: vendor.name, value: Math.round(vendorTotals(vendor).accrualAmount / 1000) })).sort(
    (a, b) => b.value - a.value,
  );

  // A count, not a dollar amount — how many accrual line items (not how
  // much money) fall under each category, a complementary reading to the
  // dollar-based donut above rather than the same data twice.
  const subsidiaryCountByCategory = new Map<string, number>();
  for (const vendor of ACCRUAL_VENDORS) {
    for (const subsidiary of vendor.subsidiaries) {
      subsidiaryCountByCategory.set(subsidiary.category, (subsidiaryCountByCategory.get(subsidiary.category) ?? 0) + 1);
    }
  }
  const byCategoryCount = Array.from(subsidiaryCountByCategory.entries()).map(([label, value]) => ({ label, value }));

  return (
    <div className="page page--full-width">
      <div className="overview-metrics">
        <DisplayMetric value={accrualCurrency.format(totals.augMtd)} label="Aug-26 MTD" color="green" />
        <DisplayMetric value={accrualCurrency.format(totals.momVariance)} label="MoM Variance" color="yellow" />
        <DisplayMetric value={accrualCurrency.format(totals.accrualAmount)} label="Accrual Amount" color="brand" />
        <DisplayMetric value={String(ACCRUAL_VENDORS.length)} label="Vendors" color="magenta" />
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Spend trend</h2>
        <div className="overview-chart-card">
          <AreaChart data={spendTrend} formatValue={(value) => accrualCurrency.format(value)} aria-label="Monthly actual spend, May through August 2026" />
        </div>
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Breakdown</h2>
        <div className="overview-chart-row">
          <div className="overview-chart-card overview-chart-card--centered">
            <h3 className="overview-chart-card__title">By category</h3>
            <p className="overview-chart-card__description">Accrual amount, in thousands of dollars</p>
            {/* A full `accrualCurrency` string (with cents) overflowed the
                ring's own inner circle and collided with the legend at this
                size — the compact "$3.2M" form fits comfortably. */}
            <DonutChart data={byCategory} centerValue={accrualCurrencyCompact.format(categoryGrandTotal)} centerLabel="Total accrual" size={200} thickness={22} />
          </div>
          <div className="overview-chart-card">
            <h3 className="overview-chart-card__title">By vendor</h3>
            <p className="overview-chart-card__description">Accrual amount, in thousands of dollars</p>
            <BarChart data={byVendor} orientation="horizontal" height={280} />
          </div>
          <div className="overview-chart-card">
            <h3 className="overview-chart-card__title">Line items by category</h3>
            <p className="overview-chart-card__description">Count of accrual line items, not dollar amount</p>
            <IconChart icon={Receipt} data={byCategoryCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
