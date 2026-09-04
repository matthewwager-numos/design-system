import { HistoryTimeline } from "../../components/HistoryTimeline";
import { RECONCILIATION_HISTORY } from "../../data/reconciliationHistory";

export function HistoryTab() {
  return (
    <div className="page page--full-width page--fill-height">
      <HistoryTimeline entries={RECONCILIATION_HISTORY} />
    </div>
  );
}
