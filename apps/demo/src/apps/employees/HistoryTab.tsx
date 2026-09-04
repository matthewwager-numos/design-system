import { HistoryTimeline } from "../../components/HistoryTimeline";
import { EMPLOYEE_HISTORY } from "../../data/employeeHistory";

export function HistoryTab() {
  return (
    <div className="page page--full-width page--fill-height">
      <HistoryTimeline entries={EMPLOYEE_HISTORY} />
    </div>
  );
}
