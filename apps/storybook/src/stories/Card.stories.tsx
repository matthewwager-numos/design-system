import { useState } from "react";
import { Pencil, Trash2, MoreVertical, Maximize2, Minimize2 } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, Button, Card, CardGroup, CardHeader } from "@numosai/ui";
import type { CardExpand } from "@numosai/ui";

const CAPTION_STYLE = { margin: "0 0 0.75rem", font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" };
const BODY_STYLE = { margin: 0, font: "var(--type-paragraph-s-regular)", letterSpacing: "var(--type-paragraph-s-regular-tracking)", color: "var(--content-base)" };

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  // No "autodocs" tag — Card.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Card>;

function ComposedCard({
  selected = false,
  expand,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
}: {
  selected?: boolean;
  expand?: CardExpand;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}) {
  return (
    <Card selected={selected} expand={expand} minWidth={minWidth} maxWidth={maxWidth} minHeight={minHeight} maxHeight={maxHeight}>
      <CardHeader
        lead={<Avatar size="xs" name="Maya Chen" />}
        title="Maya Chen"
        subtitle="Product Designer"
        actions={[
          { icon: <Pencil size={16} aria-hidden />, label: "Edit" },
          { icon: <Trash2 size={16} aria-hidden />, label: "Delete" },
          { icon: <MoreVertical size={16} aria-hidden />, label: "More" },
        ]}
      />
      <p style={{ margin: 0, font: "var(--type-paragraph-s-regular)", letterSpacing: "var(--type-paragraph-s-regular-tracking)", color: "var(--content-base)" }}>
        Explore the latest updates and features designed to enhance your workflow and boost productivity effortlessly.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", width: "100%" }}>
        <Button variant="link" size="sm" style={{ marginRight: "auto" }}>
          Don&apos;t show this again
        </Button>
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
        <Button variant="primary" size="sm">
          Save
        </Button>
      </div>
    </Card>
  );
}

export const Default: Story = {
  render: () => <ComposedCard />,
};

export const Selected: Story = {
  render: () => <ComposedCard selected />,
};

export const ExpandToFill: Story = {
  name: "expand=\"x\" (fills its container)",
  render: () => (
    <div style={{ width: "44rem", maxWidth: "100%" }}>
      <ComposedCard expand="x" />
    </div>
  ),
};

export const ExpandWithinBounds: Story = {
  name: "expand=\"x\" with min/max (clamped)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <p style={{ margin: "0 0 0.5rem", font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>
          A 14rem container — the card still won&apos;t shrink below its 18rem <code>minWidth</code>.
        </p>
        <div style={{ width: "14rem", overflow: "visible" }}>
          <ComposedCard expand="x" minWidth="18rem" maxWidth="32rem" />
        </div>
      </div>
      <div>
        <p style={{ margin: "0 0 0.5rem", font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>
          A 48rem container — the card won&apos;t grow past its 32rem <code>maxWidth</code>.
        </p>
        <div style={{ width: "48rem", maxWidth: "100%" }}>
          <ComposedCard expand="x" minWidth="18rem" maxWidth="32rem" />
        </div>
      </div>
    </div>
  ),
};

function ExpandableByCardClickDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ width: "44rem", maxWidth: "100%" }}>
      <p style={CAPTION_STYLE}>Click anywhere on the card to toggle it between its default width and a wider layout.</p>
      <Card expand={expanded ? "x" : undefined} maxWidth={expanded ? "40rem" : undefined} onClick={() => setExpanded((v) => !v)}>
        <CardHeader lead={<Avatar size="xs" name="Maya Chen" />} title="Maya Chen" subtitle="Product Designer" />
        <p style={BODY_STYLE}>
          {expanded
            ? "Expanded, up to a 40rem cap — click anywhere on the card again to collapse it."
            : "Collapsed at its default width — click anywhere on the card to expand it."}
        </p>
      </Card>
    </div>
  );
}

export const ExpandableByCardClick: Story = {
  name: "Expandable — click the card",
  render: () => <ExpandableByCardClickDemo />,
};

function ExpandableByIconButtonDemo() {
  const [selected, setSelected] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ width: "44rem", maxWidth: "100%" }}>
      <p style={CAPTION_STYLE}>
        The card's own click (selection) and the header's expand icon are independent — the icon button stops its click from
        also reaching the card, so toggling one never triggers the other.
      </p>
      <Card selected={selected} expand={expanded ? "x" : undefined} maxWidth={expanded ? "40rem" : undefined} onClick={() => setSelected((v) => !v)}>
        <CardHeader
          lead={<Avatar size="xs" name="Maya Chen" />}
          title="Maya Chen"
          subtitle="Product Designer"
          actions={[
            {
              icon: expanded ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />,
              label: expanded ? "Collapse" : "Expand",
              onClick: () => setExpanded((v) => !v),
            },
          ]}
        />
        <p style={BODY_STYLE}>
          {selected ? "Selected" : "Not selected"} — click the card body to toggle selection, or the {expanded ? "collapse" : "expand"} icon above to {expanded ? "collapse" : "expand"} the card.
        </p>
      </Card>
    </div>
  );
}

export const ExpandableByIconButton: Story = {
  name: "Expandable — icon button (independent of selection)",
  render: () => <ExpandableByIconButtonDemo />,
};

const PEOPLE = [
  { id: "maya", name: "Maya Chen", role: "Product Designer" },
  { id: "sam", name: "Sam Ortiz", role: "Engineering Manager" },
  { id: "priya", name: "Priya Nair", role: "Data Analyst" },
];

function SingleSelectGroupDemo() {
  return (
    <div>
      <p style={CAPTION_STYLE}>
        <code>type=&quot;single&quot;</code> (the default) — selecting one card deselects any other, the same
        &quot;radio&quot; behavior <code>&lt;RadioGroup&gt;</code> gives <code>&lt;Radio&gt;</code>.
      </p>
      <CardGroup defaultValue="maya">
        {PEOPLE.map((person) => (
          <Card key={person.id} value={person.id}>
            <CardHeader lead={<Avatar size="xs" name={person.name} />} title={person.name} subtitle={person.role} />
            <p style={BODY_STYLE}>Click a card to select it — hover any other to see the border-only hover chrome, distinct from the selected ring.</p>
          </Card>
        ))}
      </CardGroup>
    </div>
  );
}

export const SingleSelect: Story = {
  name: "CardGroup — single select",
  render: () => <SingleSelectGroupDemo />,
};

function MultiSelectGroupDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["maya"]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <div>
      <p style={CAPTION_STYLE}>
        <code>type=&quot;multiple&quot;</code> — no shared value to coordinate, same as <code>&lt;CheckboxGroup&gt;</code>;
        each card's own <code>selected</code>/<code>onClick</code> stays in your own hands.
      </p>
      <CardGroup type="multiple">
        {PEOPLE.map((person) => (
          <Card key={person.id} selected={selectedIds.includes(person.id)} onClick={() => toggle(person.id)}>
            <CardHeader lead={<Avatar size="xs" name={person.name} />} title={person.name} subtitle={person.role} />
            <p style={BODY_STYLE}>Click any number of cards to select them.</p>
          </Card>
        ))}
      </CardGroup>
    </div>
  );
}

export const MultiSelect: Story = {
  name: "CardGroup — multi select",
  render: () => <MultiSelectGroupDemo />,
};

function DraggableDemo() {
  const [order, setOrder] = useState(PEOPLE.map((p) => p.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    setOrder((prev) => {
      const next = prev.filter((id) => id !== draggingId);
      next.splice(next.indexOf(targetId), 0, draggingId);
      return next;
    });
  }

  return (
    <div>
      <p style={CAPTION_STYLE}>Drag a card by its body to reorder the list — native HTML5 drag-and-drop, same as reordering rows in a real app.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "22rem" }}>
        {order.map((id) => {
          const person = PEOPLE.find((p) => p.id === id)!;
          return (
            // The drop target (onDragOver/onDrop) is a plain wrapper, not the
            // Card itself — Card only knows it's a drag source; something
            // else always owns where drops land, the same way a native
            // draggable element would work.
            <div key={id} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(id)}>
              <Card expand="x" draggable onDragStart={() => setDraggingId(id)} onDragEnd={() => setDraggingId(null)}>
                <CardHeader lead={<Avatar size="xs" name={person.name} />} title={person.name} subtitle={person.role} />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Draggable: Story = {
  name: "Drag and drop (reorder)",
  render: () => <DraggableDemo />,
};
