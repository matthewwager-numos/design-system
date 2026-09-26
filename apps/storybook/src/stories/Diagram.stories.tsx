import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GitBranch, Hammer, Inbox, Rocket, ShieldCheck } from "lucide-react";
import { Avatar, DiagramConnector, DiagramGrid, DiagramNode } from "@numosai/ui";

const meta: Meta<typeof DiagramGrid> = {
  title: "Components/Diagram",
  component: DiagramGrid,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DiagramGrid>;

// A small pipeline: a repo feeds a build (landing a "complete" badge on
// that leg), which turns a corner into a test step, then a dashed,
// arrow-tipped leg into deploy — one path, not a fan-out, so every
// connector's own orientation stays easy to follow start to end.
export const Default: Story = {
  name: "An assembled flow",
  render: () => (
    <DiagramGrid columns={6}>
      <DiagramNode row={1} column={1} aria-label="Repo">
        <GitBranch size={16} />
      </DiagramNode>
      <DiagramConnector row={1} column={2} variant="line" rotation={90} badge={{ status: "complete" }} />
      <DiagramNode row={1} column={3} aria-label="Build">
        <Hammer size={16} />
      </DiagramNode>
      <DiagramConnector row={1} column={4} variant="corner" rotation={270} />
      <DiagramNode row={2} column={4} aria-label="Tests">
        <ShieldCheck size={16} />
      </DiagramNode>
      <DiagramConnector row={2} column={5} variant="line" rotation={90} dashed arrow />
      <DiagramNode row={2} column={6} aria-label="Deploy">
        <Rocket size={16} />
      </DiagramNode>
    </DiagramGrid>
  ),
};

export const WithAnEntityNode: Story = {
  name: "A node holding an <Avatar>",
  render: () => (
    <DiagramGrid columns={3}>
      <DiagramNode row={1} column={1} tile={false} aria-label="Acme Corp">
        <Avatar name="Acme Corp" type="entity" size="sm" />
      </DiagramNode>
      <DiagramConnector row={1} column={2} variant="line" rotation={90} arrow />
      <DiagramNode row={1} column={3} aria-label="Inbox">
        <Inbox size={16} />
      </DiagramNode>
    </DiagramGrid>
  ),
};

const VARIANT_GALLERY: { label: string; render: () => ReactNode }[] = [
  { label: "line (vertical)", render: () => <DiagramConnector row={1} column={1} variant="line" /> },
  { label: "line (horizontal)", render: () => <DiagramConnector row={1} column={1} variant="line" rotation={90} /> },
  { label: "line, dashed", render: () => <DiagramConnector row={1} column={1} variant="line" dashed /> },
  { label: "line, arrow", render: () => <DiagramConnector row={1} column={1} variant="line" arrow /> },
  { label: "corner", render: () => <DiagramConnector row={1} column={1} variant="corner" /> },
  { label: "corner, rotate 90", render: () => <DiagramConnector row={1} column={1} variant="corner" rotation={90} /> },
  { label: "corner, rotate 180", render: () => <DiagramConnector row={1} column={1} variant="corner" rotation={180} /> },
  { label: "corner, rotate 270", render: () => <DiagramConnector row={1} column={1} variant="corner" rotation={270} /> },
  { label: "branch", render: () => <DiagramConnector row={1} column={1} variant="branch" /> },
  { label: "branch, rotate 180", render: () => <DiagramConnector row={1} column={1} variant="branch" rotation={180} /> },
  { label: "dot", render: () => <DiagramConnector row={1} column={1} variant="dot" /> },
  { label: "badge: complete", render: () => <DiagramConnector row={1} column={1} variant="line" badge={{ status: "complete" }} /> },
  { label: "badge: error", render: () => <DiagramConnector row={1} column={1} variant="line" badge={{ status: "error" }} /> },
];

export const ConnectorVariants: Story = {
  name: "Connector variants",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(6rem, 1fr))", gap: "var(--space-4)" }}>
      {VARIANT_GALLERY.map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
          <DiagramGrid columns={1}>{item.render()}</DiagramGrid>
          <span style={{ font: "var(--type-paragraph-xs-regular)", color: "var(--content-subtle)", textAlign: "center" }}>{item.label}</span>
        </div>
      ))}
    </div>
  ),
};
