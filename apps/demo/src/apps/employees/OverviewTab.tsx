import { BarChart, DisplayMetric, DonutChart } from "@numosai/ui";
import { useEmployees } from "../../data/useEmployees";
import { departmentLabel, EMPLOYMENT_TYPE_OPTIONS } from "../../data/employees";

export function OverviewTab() {
  const { employees } = useEmployees();

  const byDepartment = new Map<string, number>();
  for (const employee of employees) {
    const key = employee.department || "—";
    byDepartment.set(key, (byDepartment.get(key) ?? 0) + 1);
  }

  const fullTimeCount = employees.filter((employee) => employee.employmentType === "fulltime").length;
  const adminCount = employees.filter((employee) => employee.role === "admin").length;

  const byDepartmentChart = Array.from(byDepartment.entries()).map(([department, count]) => ({
    label: department === "—" ? department : departmentLabel(department),
    value: count,
  }));

  const byEmploymentType = EMPLOYMENT_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: employees.filter((employee) => employee.employmentType === option.value).length,
  }));

  return (
    <div className="page page--full-width">
      <div className="overview-metrics">
        <DisplayMetric value={String(employees.length)} label="Total employees" color="brand" />
        <DisplayMetric value={String(fullTimeCount)} label="Full-time" color="green" />
        <DisplayMetric value={String(byDepartment.size)} label="Departments" color="magenta" />
        <DisplayMetric value={String(adminCount)} label="Admins" color="yellow" />
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Breakdown</h2>
        <div className="overview-chart-row">
          <div className="overview-chart-card overview-chart-card--centered">
            <h3 className="overview-chart-card__title">By department</h3>
            {byDepartmentChart.length === 0 ? (
              <p className="overview-chart-card__description">No employees yet.</p>
            ) : (
              <DonutChart data={byDepartmentChart} centerLabel="Employees" size={160} thickness={20} />
            )}
          </div>
          <div className="overview-chart-card">
            <h3 className="overview-chart-card__title">By employment type</h3>
            <BarChart data={byEmploymentType} height={220} />
          </div>
        </div>
      </div>
    </div>
  );
}
