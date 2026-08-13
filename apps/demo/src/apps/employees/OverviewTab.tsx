import { useEmployees } from "../../data/useEmployees";
import { departmentLabel } from "../../data/employees";

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
  const { employees } = useEmployees();

  const byDepartment = new Map<string, number>();
  for (const employee of employees) {
    const key = employee.department || "—";
    byDepartment.set(key, (byDepartment.get(key) ?? 0) + 1);
  }

  const fullTimeCount = employees.filter((employee) => employee.employmentType === "fulltime").length;

  return (
    <div className="page">
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <StatCard label="Total employees" value={String(employees.length)} />
        <StatCard label="Full-time" value={String(fullTimeCount)} />
        <StatCard label="Departments" value={String(byDepartment.size)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ margin: 0, font: "var(--type-heading-l)", letterSpacing: "var(--type-heading-l-tracking)", color: "var(--content-emphasis)" }}>
          By department
        </h2>
        {byDepartment.size === 0 ? (
          <p style={{ margin: 0, color: "var(--content-subtle)" }}>No employees yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {Array.from(byDepartment.entries()).map(([department, count]) => (
              <li
                key={department}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  font: "var(--type-paragraph-s-regular)",
                  color: "var(--content-base)",
                }}
              >
                <span>{department === "—" ? department : departmentLabel(department)}</span>
                <span style={{ color: "var(--content-subtle)" }}>{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
