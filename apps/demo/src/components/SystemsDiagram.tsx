import { Share2, Sparkles } from "lucide-react";
import { Avatar, DiagramConnector, DiagramGrid, DiagramNode } from "@numosai/ui";

const INPUT_SYSTEMS = ["Gmail", "Coupa", "Expensify", "NetSuite", "Ramp"] as const;

/**
 * The systems Numos connects to, end to end — every input system feeding in
 * on the left, Numos itself as the hub, and its own outputs on the right.
 * The hub node spans every input row (`rowSpan={INPUT_SYSTEMS.length}`)
 * specifically so a 5-way fan-in needs no branch/merge geometry: each
 * input's line just terminates against whichever point along the hub's
 * own tall left edge lines up with its row, instead of needing several
 * connectors to route five lines into one.
 *
 * Reused as-is across more than one workflow app's Overview (see
 * `CollectApp`/`PayApp`) — the same connection map regardless of which
 * specific workflow you're looking at, not a different diagram per app.
 */
export function SystemsDiagram() {
  return (
    <DiagramGrid columns={5}>
      {INPUT_SYSTEMS.flatMap((name, index) => {
        const row = index + 1;
        return [
          <DiagramNode key={`${name}-node`} row={row} column={1} tile={false} aria-label={name}>
            <Avatar type="entity" name={name} size="sm" />
          </DiagramNode>,
          <DiagramConnector key={`${name}-line`} row={row} column={2} variant="line" rotation={90} arrow />,
        ];
      })}

      <DiagramNode row={1} column={3} rowSpan={INPUT_SYSTEMS.length} aria-label="Numos">
        <Sparkles size={16} />
      </DiagramNode>

      <DiagramConnector row={2} column={4} variant="line" rotation={90} arrow />
      <DiagramNode row={2} column={5} tile={false} aria-label="NetSuite">
        <Avatar type="entity" name="NetSuite" size="sm" />
      </DiagramNode>

      <DiagramConnector row={4} column={4} variant="line" rotation={90} arrow />
      <DiagramNode row={4} column={5} aria-label="Other endpoints">
        <Share2 size={16} />
      </DiagramNode>
    </DiagramGrid>
  );
}
