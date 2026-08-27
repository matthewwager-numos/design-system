import { useTasks } from "../../data/useTasks";
import { STAGES, UNASSIGNED } from "../../data/tasks";

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
  const { tasks } = useTasks();
  const reconciled = tasks.filter((task) => task.stage === "reconciled").length;
  const unassigned = tasks.filter((task) => task.assignee === UNASSIGNED).length;

  return (
    <div className="page">
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <StatCard label="Total tasks" value={String(tasks.length)} />
        <StatCard label="Reconciled" value={String(reconciled)} />
        <StatCard label="Unassigned" value={String(unassigned)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ margin: 0, font: "var(--type-heading-l)", letterSpacing: "var(--type-heading-l-tracking)", color: "var(--content-emphasis)" }}>
          By stage
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {STAGES.map((stage) => (
            <li
              key={stage.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "var(--space-2) 0",
                borderBottom: "1px solid var(--border-subtle)",
                font: "var(--type-paragraph-s-regular)",
                color: "var(--content-base)",
              }}
            >
              <span>{stage.label}</span>
              <span style={{ color: "var(--content-subtle)" }}>{tasks.filter((task) => task.stage === stage.id).length}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
