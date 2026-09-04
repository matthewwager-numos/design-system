import { HistoryTimeline } from "../../components/HistoryTimeline";
import { ACCRUALS_HISTORY } from "../../data/accrualsHistory";

export function HistoryTab() {
  return (
    <div className="page page--full-width page--fill-height">
      <HistoryTimeline entries={ACCRUALS_HISTORY} />
    </div>
  );
}
