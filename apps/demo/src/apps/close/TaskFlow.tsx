import { SankeyChart } from "@numosai/ui";
import { STAGES } from "../../data/tasks";
import type { Task, TaskStage } from "../../data/tasks";

export interface TaskFlowProps {
  tasks: Task[];
}

// Natural-language phrasing per stage — plain string interpolation off the
// column label ("In Progress" → "in in progress") reads wrong for the two
// stages whose own label already starts with "In", so these are spelled
// out explicitly rather than derived.
const DESTINATION_PHRASE: Record<TaskStage, string> = {
  backlog: "backlog",
  assigned: "assigned",
  inProgress: "in progress",
  inReview: "in review",
  reconciled: "reconciled",
};

const REMAINDER_PHRASE: Record<TaskStage, string> = {
  backlog: "in backlog",
  assigned: "in assigned",
  inProgress: "in progress",
  inReview: "in review",
  reconciled: "reconciled",
};

export function TaskFlow({ tasks }: TaskFlowProps) {
  const stageIndex = (stage: TaskStage) => STAGES.findIndex((s) => s.id === stage);
  // counts[i] = how many tasks are currently AT stage i or further along —
  // a real, live read of the board's own state (not a hardcoded conversion
  // rate), so the chart updates the moment a card moves.
  const counts = STAGES.map((_, i) => tasks.filter((t) => stageIndex(t.stage) >= i).length);

  const nodes = STAGES.flatMap((stage, i) => {
    const node = { id: stage.id, stage: i };
    if (i === 0) return [node];
    // Splits this stage's incoming flow into what continues on (the real,
    // visible node above) and what hasn't moved past here yet — a hidden
    // node at the same stage, so that remainder branches off right under
    // this stage's own line rather than needing a stage of its own.
    return [node, { id: `${STAGES[i - 1]!.id}-remaining`, stage: i, hidden: true }];
  });
  // A fifth, purely cosmetic flow area: with `stageAlign="start"`, each bar
  // sits at the *start* of its own kanban column rather than its center —
  // so without this, Reconciled's ribbon would stop dead right at its own
  // bar instead of filling out the rest of that column's width the way
  // every earlier stage's ribbon does. This hidden trailing node just gives
  // Reconciled's full current count somewhere to flow to, at the chart's
  // own right edge.
  const lastStage = STAGES[STAGES.length - 1]!;
  nodes.push({ id: `${lastStage.id}-fill`, stage: STAGES.length, hidden: true });

  const links = STAGES.slice(0, -1).flatMap((stage, i) => {
    const nextStage = STAGES[i + 1]!;
    const continuing = counts[i + 1]!;
    const remaining = counts[i]! - continuing;
    const result: { source: string; target: string; value: number; label: string; omitTooltipValue: boolean }[] = [
      {
        source: stage.id,
        target: nextStage.id,
        value: Math.max(continuing, 0.0001),
        label: `${continuing} moved to ${DESTINATION_PHRASE[nextStage.id]}`,
        omitTooltipValue: true,
      },
    ];
    if (remaining > 0) {
      result.push({
        source: stage.id,
        target: `${stage.id}-remaining`,
        value: remaining,
        label: `${remaining} ${REMAINDER_PHRASE[stage.id]}`,
        omitTooltipValue: true,
      });
    }
    return result;
  });
  links.push({
    source: lastStage.id,
    target: `${lastStage.id}-fill`,
    value: Math.max(counts[STAGES.length - 1]!, 0.0001),
    label: `${counts[STAGES.length - 1]} ${REMAINDER_PHRASE[lastStage.id]}`,
    omitTooltipValue: true,
  });

  return (
    <SankeyChart
      nodes={nodes}
      links={links}
      color="var(--chart-2)"
      nodeWidth={8}
      stageAlign="start"
      columnCount={STAGES.length}
      showStageLabels={false}
      showLegend={false}
      height={80}
      className="task-flow"
    />
  );
}
