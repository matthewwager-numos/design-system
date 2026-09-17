import { useState } from "react";
import { Task, TaskList } from "@numosai/ui";
import type { TaskState } from "@numosai/ui";
import { COLLECT_BULK_ACTIONS } from "../../data/collectActions";
import type { CollectBulkAction } from "../../data/collectActions";
import { BulkActionModal } from "./BulkActionModal";

/**
 * Collect's own eponymous "Work" tab — prescribed bulk actions grouped by
 * what they do (send a reminder, send an invoice, confirm a payment), each
 * a `<Task>` naming how many customers it affects. Opening one drops you
 * into the full-screen List & Detail review flow (`<BulkActionModal>`) to
 * preview and include/exclude individual customers before sending — and
 * reviewing (or sending) there changes the referring Task's own state/meta
 * here, via `onItemRead`/`onSent`.
 */
export function WorkTab() {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  // One Set of reviewed customer ids per action, plus which actions have
  // actually been sent — both reported up by `<BulkActionModal>`, not
  // derived from anything it renders, so this tab is the one place that
  // decides how "reviewed"/"sent" shows up on the Task itself.
  const [reviewedByAction, setReviewedByAction] = useState<Record<string, Set<string>>>({});
  const [sentActionIds, setSentActionIds] = useState<Set<string>>(new Set());

  const openAction: CollectBulkAction | null = COLLECT_BULK_ACTIONS.find((action) => action.id === openActionId) ?? null;

  function handleItemRead(actionId: string, itemId: string) {
    setReviewedByAction((prev) => {
      const next = new Set(prev[actionId]);
      next.add(itemId);
      return { ...prev, [actionId]: next };
    });
  }

  function handleSent(actionId: string) {
    setSentActionIds((prev) => new Set(prev).add(actionId));
  }

  return (
    <div className="page collect-work-tab">
      <TaskList title="Bulk actions" description="Grouped by the prescribed action — review who's included before anything sends.">
        {COLLECT_BULK_ACTIONS.map((action) => {
          const reviewedCount = reviewedByAction[action.id]?.size ?? 0;
          const sent = sentActionIds.has(action.id);
          const state: TaskState = sent ? "complete" : reviewedCount > 0 ? "inProgress" : "notStarted";
          const meta = sent ? "Sent" : reviewedCount > 0 ? `${reviewedCount} of ${action.items.length} reviewed` : `${action.items.length} customers`;

          return (
            <Task
              key={action.id}
              state={state}
              title={action.title}
              description={action.description}
              meta={meta}
              actionLabel={sent ? undefined : reviewedCount > 0 ? "Continue" : "Review"}
              onAction={sent ? undefined : () => setOpenActionId(action.id)}
            />
          );
        })}
      </TaskList>

      <BulkActionModal action={openAction} onClose={() => setOpenActionId(null)} onItemRead={handleItemRead} onSent={handleSent} />
    </div>
  );
}
