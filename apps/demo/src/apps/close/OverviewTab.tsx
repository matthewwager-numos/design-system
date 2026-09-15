import { BarChart, DisplayMetric, GaugeChart } from "@numosai/ui";
import { useTasks } from "../../data/useTasks";
import { STAGES, UNASSIGNED } from "../../data/tasks";

export function OverviewTab() {
  const { tasks } = useTasks();
  const reconciled = tasks.filter((task) => task.stage === "reconciled").length;
  const unassigned = tasks.filter((task) => task.assignee === UNASSIGNED).length;
  const inReview = tasks.filter((task) => task.stage === "inReview").length;
  const reconciledPercent = tasks.length === 0 ? 0 : Math.round((reconciled / tasks.length) * 100);

  const byStage = STAGES.map((stage) => ({
    label: stage.label,
    value: tasks.filter((task) => task.stage === stage.id).length,
  }));

  return (
    <div className="page page--full-width">
      <div className="overview-metrics">
        <DisplayMetric value={String(tasks.length)} label="Total tasks" color="brand" />
        <DisplayMetric value={String(reconciled)} label="Reconciled" color="green" />
        <DisplayMetric value={String(unassigned)} label="Unassigned" color="yellow" />
        <DisplayMetric value={String(inReview)} label="In Review" color="magenta" />
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Breakdown</h2>
        <div className="overview-chart-row">
          <div className="overview-chart-card overview-chart-card--centered">
            <h3 className="overview-chart-card__title">Close progress</h3>
            <GaugeChart value={reconciledPercent} label="Reconciled" size="xl" />
          </div>
          <div className="overview-chart-card">
            <h3 className="overview-chart-card__title">By stage</h3>
            <BarChart data={byStage} orientation="horizontal" height={220} />
          </div>
        </div>
      </div>
    </div>
  );
}
