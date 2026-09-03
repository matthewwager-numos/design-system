import { ACCRUAL_REGIONS, accrualCurrency, grandTotals, regionTotals } from "../../data/accruals";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: "1 1 10rem",
        padding: "var(--space-4)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <span style={{ font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>{label}</span>
      <span style={{ font: "var(--type-heading-xl)", letterSpacing: "var(--type-heading-xl-tracking)", color: "var(--content-emphasis)" }}>{value}</span>
    </div>
  );
}

export function OverviewTab() {
  const totals = grandTotals(ACCRUAL_REGIONS);

  return (
    <div className="page">
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <StatCard label="Revenue" value={accrualCurrency.format(totals.revenue)} />
        <StatCard label="Expenses" value={accrualCurrency.format(totals.expenses)} />
        <StatCard label="Net profit" value={accrualCurrency.format(totals.netProfit)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ margin: 0, font: "var(--type-heading-l)", letterSpacing: "var(--type-heading-l-tracking)", color: "var(--content-emphasis)" }}>
          By region
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {ACCRUAL_REGIONS.map((region) => (
            <li
              key={region.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "var(--space-2) 0",
                borderBottom: "1px solid var(--border-subtle)",
                font: "var(--type-paragraph-s-regular)",
                color: "var(--content-base)",
              }}
            >
              <span>{region.name}</span>
              <span style={{ color: "var(--content-subtle)" }}>{accrualCurrency.format(regionTotals(region).netProfit)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
