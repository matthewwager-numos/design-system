import { useState } from "react";
import type { DragEvent } from "react";
import { LayoutGrid, MoreVertical, Plus, Rows3 } from "lucide-react";
import {
  Cell,
  Checkbox,
  CheckboxGroup,
  Column,
  SearchFilter,
  SegmentedControl,
  SegmentedControlOption,
  Select,
  Button,
} from "@numosai/ui";
import { avatarColorFor } from "../../data/avatarColor";
import { ASSIGNEES, ERP_ACCOUNTS, STAGES, UNASSIGNED } from "../../data/tasks";
import type { Task, TaskStage } from "../../data/tasks";
import { useTasks } from "../../data/useTasks";
import { useToast } from "../../toast/ToastProvider";
import { TaskFlow } from "./TaskFlow";
import { TaskCard } from "./TaskCard";
import { AddTaskModal } from "./AddTaskModal";
import { AssignModal } from "./AssignModal";
import { ReviewModal } from "./ReviewModal";
import { UnassignConfirmModal } from "./UnassignConfirmModal";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import { TaskStatusDropdown } from "./TaskStatusDropdown";

type BoardView = "board" | "list";

const MONTH_OPTIONS = [
  { value: "Dec 2026", label: "Dec 2026" },
  { value: "Jan 2027", label: "Jan 2027" },
  { value: "Feb 2027", label: "Feb 2027" },
];
const ERP_ACCOUNT_OPTIONS = ERP_ACCOUNTS.map((name) => ({ value: name, label: name }));

/** Which stage(s) a pending Assign/Review prompt is for — resolved per task at confirm time via `targetStage ?? task.stage`, so "assign in place" (the card's own avatar) and "assign as part of a move" (drag, add-person icon) share one modal and one confirm handler. */
interface AssignContext {
  taskIds: string[];
  /** `null` — reassign in place, keeping each task's own current stage. */
  targetStage: TaskStage | null;
  defaultAssignee?: string;
}

interface ReviewContext {
  taskIds: string[];
  defaultReviewer?: string;
}

export function TasksTab() {
  const { tasks, addTask, moveTask, updateTask } = useTasks();
  const showToast = useToast();
  const [month, setMonth] = useState("Jan 2027");
  const [erpAccount, setErpAccount] = useState(ERP_ACCOUNTS[0]!);
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [view, setView] = useState<BoardView>("board");
  const [adding, setAdding] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [draggingStage, setDraggingStage] = useState<TaskStage | null>(null);
  const [assignContext, setAssignContext] = useState<AssignContext | null>(null);
  const [reviewContext, setReviewContext] = useState<ReviewContext | null>(null);
  const [unassignTaskIds, setUnassignTaskIds] = useState<string[] | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  function toggleSelected(id: string) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAssigneeFilter(name: string) {
    setAssigneeFilter((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  const filtered = tasks.filter((task) => {
    const haystack = `${task.id} ${task.title}`.toLowerCase();
    if (!haystack.includes(query.trim().toLowerCase())) return false;
    if (assigneeFilter.length === 0) return true;
    return assigneeFilter.includes(task.assignee);
  });

  function handleDragOver(event: DragEvent<HTMLDivElement>, stageId: TaskStage) {
    event.preventDefault();
    // Simple, single check: a card can never usefully drop back onto the
    // column it's already in — flag that with a blocked cursor instead of
    // the normal "move" one, rather than silently no-op-ing on drop.
    event.dataTransfer.dropEffect = draggingStage === stageId ? "none" : "move";
    if (dragOverStage !== stageId) setDragOverStage(stageId);
  }

  // Shared by dragging a card (or a whole multi-selection of cards) onto a
  // column and picking a stage from the table's Status dropdown.
  //
  //  - → In Review: always prompts for a reviewer + due date, regardless of
  //    the task's current assignee — naming the reviewer (even if it's the
  //    same person) is the point of entering review, not a shortcut around
  //    it. Confirming re-assigns the task to that reviewer.
  //  - → Backlog: always destructive-confirms — a backlog task is always
  //    unassigned (see `UNASSIGNED`'s own doc comment), so leaving Backlog
  //    for anywhere means picking up an owner, and returning to it means
  //    giving that up.
  //  - → Assigned / In Progress / Reconciled: only tasks that are still
  //    `UNASSIGNED` need a prompt; anything already owned just moves,
  //    keeping its current assignee (dragging In Progress back to Assigned
  //    shouldn't re-ask who it belongs to).
  function moveManyWithGate(taskIds: string[], destStage: TaskStage) {
    const movable = taskIds.filter((id) => tasks.find((t) => t.id === id)?.stage !== destStage);
    if (movable.length === 0) return;

    if (destStage === "inReview") {
      const solo = movable.length === 1 ? tasks.find((t) => t.id === movable[0]) : undefined;
      setReviewContext({ taskIds: movable, defaultReviewer: solo && solo.assignee !== UNASSIGNED ? solo.assignee : undefined });
      return;
    }

    if (destStage === "backlog") {
      setUnassignTaskIds(movable);
      return;
    }

    const needsAssign = movable.filter((id) => tasks.find((t) => t.id === id)?.assignee === UNASSIGNED);
    const readyToMove = movable.filter((id) => !needsAssign.includes(id));
    readyToMove.forEach((id) => moveTask(id, destStage));

    if (needsAssign.length > 0) {
      setAssignContext({ taskIds: needsAssign, targetStage: destStage });
    } else {
      setSelectedTaskIds(new Set());
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, stageId: TaskStage) {
    event.preventDefault();
    setDragOverStage(null);
    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) return;
    // Dragging a card that's part of the current multi-selection moves the
    // whole selection together; dragging an unselected card (even while
    // others are selected) just moves that one card.
    const idsToMove = selectedTaskIds.has(taskId) && selectedTaskIds.size > 1 ? Array.from(selectedTaskIds) : [taskId];
    moveManyWithGate(idsToMove, stageId);
  }

  function handleAssignConfirm(assignee: string) {
    if (!assignContext) return;
    assignContext.taskIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      moveTask(id, assignContext.targetStage ?? task?.stage ?? "backlog", { assignee });
    });
    setAssignContext(null);
    setSelectedTaskIds(new Set());
    showToast({
      status: "positive",
      title: assignContext.taskIds.length > 1 ? `Assigned ${assignContext.taskIds.length} tasks to ${assignee}` : `Assigned to ${assignee}`,
    });
  }

  function handleReviewConfirm(reviewer: string, dueDate: string) {
    if (!reviewContext) return;
    reviewContext.taskIds.forEach((id) => moveTask(id, "inReview", { assignee: reviewer, reviewDueDate: dueDate }));
    setReviewContext(null);
    setSelectedTaskIds(new Set());
    showToast({
      status: "positive",
      title: reviewContext.taskIds.length > 1 ? `Sent ${reviewContext.taskIds.length} tasks to ${reviewer} for review` : `Sent to ${reviewer} for review`,
    });
  }

  function handleUnassignConfirm() {
    if (!unassignTaskIds) return;
    unassignTaskIds.forEach((id) => moveTask(id, "backlog", { assignee: UNASSIGNED, reviewDueDate: undefined }));
    const count = unassignTaskIds.length;
    setUnassignTaskIds(null);
    setSelectedTaskIds(new Set());
    showToast({ status: "info", title: count > 1 ? `${count} tasks moved to Backlog` : "Moved to Backlog" });
  }

  function handleUpdateTask(id: string, patch: Partial<Task>) {
    updateTask(id, patch);
    showToast({ status: "positive", title: "Task updated" });
  }

  return (
    <div className="tasks-tab">
      <div className="tasks-tab__toolbar">
        <div className="tasks-tab__toolbar-selects">
          <Select size="md" options={MONTH_OPTIONS} value={month} onChange={setMonth} className="tasks-tab__month" />
          <Select size="md" options={ERP_ACCOUNT_OPTIONS} value={erpAccount} onChange={setErpAccount} className="tasks-tab__erp-account" />
        </div>

        <div className="tasks-tab__toolbar-actions">
          <SearchFilter
            size="md"
            placeholder="Search"
            value={query}
            onChange={setQuery}
            className="tasks-tab__search"
            filters={
              <CheckboxGroup label="Assignee">
                <Checkbox
                  label="Unassigned"
                  checked={assigneeFilter.includes(UNASSIGNED)}
                  onChange={() => toggleAssigneeFilter(UNASSIGNED)}
                />
                {ASSIGNEES.map((name) => (
                  <Checkbox key={name} label={name} checked={assigneeFilter.includes(name)} onChange={() => toggleAssigneeFilter(name)} />
                ))}
              </CheckboxGroup>
            }
          />
          <SegmentedControl size="md" value={view} onValueChange={(next) => setView(next as BoardView)} className="tasks-tab__view-toggle">
            <SegmentedControlOption value="board" leadingIcon={<LayoutGrid size={16} />}>
              <span className="ds-sr-only">Board</span>
            </SegmentedControlOption>
            <SegmentedControlOption value="list" leadingIcon={<Rows3 size={16} />}>
              <span className="ds-sr-only">List</span>
            </SegmentedControlOption>
          </SegmentedControl>
          <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={() => setAdding(true)}>
            Add Task
          </Button>
        </div>
      </div>

      <TaskFlow tasks={tasks} />

      {view === "board" && selectedTaskIds.size > 0 && (
        <div className="tasks-board__selection">
          <span>
            {selectedTaskIds.size} selected — drag any selected card to move them together
          </span>
          <button type="button" className="tasks-board__selection-clear" onClick={() => setSelectedTaskIds(new Set())}>
            Clear
          </button>
        </div>
      )}

      {view === "board" ? (
        <div className="tasks-board">
          {STAGES.map((stage) => {
            const stageTasks = filtered.filter((task) => task.stage === stage.id);
            const blocked = draggingStage === stage.id;
            return (
              <div
                className="tasks-board__column"
                key={stage.id}
                onDragOver={(event) => handleDragOver(event, stage.id)}
                onDragLeave={() => setDragOverStage((current) => (current === stage.id ? null : current))}
                onDrop={(event) => handleDrop(event, stage.id)}
              >
                <p className="tasks-board__column-title">{stage.label}</p>
                <div
                  className={
                    "tasks-board__column-body" +
                    (dragOverStage === stage.id ? (blocked ? " tasks-board__column-body--drag-blocked" : " tasks-board__column-body--drag-over") : "")
                  }
                >
                  {stageTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      selected={selectedTaskIds.has(task.id)}
                      onClick={() => toggleSelected(task.id)}
                      onAssignClick={() => setAssignContext({ taskIds: [task.id], targetStage: "assigned" })}
                      onAvatarClick={() => setAssignContext({ taskIds: [task.id], targetStage: null, defaultAssignee: task.assignee })}
                      onIdClick={() => setDetailTaskId(task.id)}
                      onDragStart={() => setDraggingStage(task.stage)}
                      onDragEnd={() => setDraggingStage(null)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tasks-list">
          <div className="tasks-list__table">
            <Column header={<Cell type="columnHead">Task</Cell>}>
              {filtered.map((task) => (
                <Cell key={task.id} type="slot">
                  <div className="tasks-list__task">
                    <span className="tasks-list__task-title">{task.title}</span>
                    <span className="tasks-list__task-meta">
                      <button
                        type="button"
                        className="tasks-list__task-id"
                        onClick={() => setDetailTaskId(task.id)}
                      >
                        {task.id}
                      </button>
                      {" · "}
                      {task.description}
                    </span>
                  </div>
                </Cell>
              ))}
            </Column>
            <Column header={<Cell type="columnHead">Assigned to</Cell>} width={180}>
              {filtered.map((task) =>
                task.assignee !== UNASSIGNED ? (
                  <Cell key={task.id} type="avatar" name={task.assignee} color={avatarColorFor(task.assignee)}>
                    {task.assignee}
                  </Cell>
                ) : (
                  <Cell key={task.id} type="null" />
                ),
              )}
            </Column>
            <Column header={<Cell type="columnHead">Due</Cell>} width={120}>
              {filtered.map((task) => (
                <Cell key={task.id} type="text">
                  {task.date}
                </Cell>
              ))}
            </Column>
            <Column header={<Cell type="columnHead">Review due</Cell>} width={120}>
              {filtered.map((task) =>
                task.reviewDueDate ? (
                  <Cell key={task.id} type="text">
                    {task.reviewDueDate}
                  </Cell>
                ) : (
                  <Cell key={task.id} type="null" />
                ),
              )}
            </Column>
            <Column header={<Cell type="columnHead">Status</Cell>} width={160}>
              {filtered.map((task) => (
                <Cell key={task.id} type="slot">
                  <TaskStatusDropdown stage={task.stage} onChange={(stage) => moveManyWithGate([task.id], stage)} />
                </Cell>
              ))}
            </Column>
            <Column header={<Cell type="columnHead">Actions</Cell>} width={80}>
              {filtered.map((task) => (
                <Cell
                  key={task.id}
                  type="icon"
                  actions={[{ icon: <MoreVertical size={16} aria-hidden="true" />, label: "View details", onClick: () => setDetailTaskId(task.id) }]}
                />
              ))}
            </Column>
          </div>
        </div>
      )}

      <AddTaskModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(task) => {
          addTask(task);
          showToast({ status: "positive", title: `Added ${task.title}` });
        }}
      />

      <AssignModal
        open={assignContext !== null}
        count={assignContext?.taskIds.length ?? 1}
        defaultAssignee={assignContext?.defaultAssignee}
        onClose={() => setAssignContext(null)}
        onAssign={handleAssignConfirm}
      />

      <ReviewModal
        open={reviewContext !== null}
        count={reviewContext?.taskIds.length ?? 1}
        defaultReviewer={reviewContext?.defaultReviewer}
        onClose={() => setReviewContext(null)}
        onSubmit={handleReviewConfirm}
      />

      <UnassignConfirmModal
        open={unassignTaskIds !== null}
        count={unassignTaskIds?.length ?? 1}
        onClose={() => setUnassignTaskIds(null)}
        onConfirm={handleUnassignConfirm}
      />

      <TaskDetailDrawer task={tasks.find((t) => t.id === detailTaskId) ?? null} onClose={() => setDetailTaskId(null)} onUpdate={handleUpdateTask} />
    </div>
  );
}
