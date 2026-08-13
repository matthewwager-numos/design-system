import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pencil, Trash2 } from "lucide-react";
import { Cell } from "@numosai/ui";

const meta: Meta<typeof Cell> = {
  title: "Components/Cell",
  component: Cell,
  // No "autodocs" tag — Cell.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Cell>;

const CELL_WRAPPER = { width: "12.5rem", border: "1px solid var(--border-subtle)", borderTop: "1px solid var(--border-subtle)" };

export const Text: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="text">Acme Corp</Cell>
    </div>
  ),
};

export const Numeric: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="numeric">1,204</Cell>
    </div>
  ),
};

export const Emphasis: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="emphasis">Acme Corp</Cell>
    </div>
  ),
};

export const Double: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="double" secondary="Owner">
        Maya Chen
      </Cell>
    </div>
  ),
};

export const Null: Story = {
  name: "Null (empty value)",
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="null" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="loading" />
    </div>
  ),
};

export const Slot: Story = {
  name: "Slot (arbitrary content)",
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="slot">
        <span style={{ display: "flex", gap: "0.25rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--background-positive-base)" }} />
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--background-notice-base)" }} />
        </span>
      </Cell>
    </div>
  ),
};

export const Progress: Story = {
  render: () => (
    <div style={{ ...CELL_WRAPPER, width: "14rem" }}>
      <Cell type="progress" value={49} />
    </div>
  ),
};

export const Label: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="label">Draft</Cell>
    </div>
  ),
};

export const ButtonCell: Story = {
  name: "Button",
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="button" onClick={() => {}}>
        View
      </Cell>
    </div>
  ),
};

export const AvatarCell: Story = {
  name: "Avatar",
  render: () => (
    <div style={{ ...CELL_WRAPPER, width: "14rem" }}>
      <Cell type="avatar" name="Maya Chen" sublabel="Design">
        Maya Chen
      </Cell>
    </div>
  ),
};

function CheckboxCellDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ ...CELL_WRAPPER, width: "5rem" }}>
      <Cell type="checkbox" checked={checked} onCheckedChange={setChecked} aria-label="Select row" />
    </div>
  );
}

export const CheckboxCell: Story = {
  name: "Checkbox",
  render: () => <CheckboxCellDemo />,
};

export const IconCell: Story = {
  name: "Icon",
  render: () => (
    <div style={{ ...CELL_WRAPPER, width: "8rem" }}>
      <Cell
        type="icon"
        count={2}
        actions={[
          { icon: <Pencil size={16} />, label: "Edit" },
          { icon: <Trash2 size={16} />, label: "Delete" },
        ]}
      />
    </div>
  ),
};

export const ColumnHead: Story = {
  name: "Column Head",
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="columnHead">Company</Cell>
    </div>
  ),
};

export const Sorted: Story = {
  render: () => (
    <div style={CELL_WRAPPER}>
      <Cell type="sorted" direction="desc">
        Company
      </Cell>
    </div>
  ),
};

function CheckboxColumnHeadDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ ...CELL_WRAPPER, width: "5rem" }}>
      <Cell type="checkboxColumnHead" checked={checked} onCheckedChange={setChecked} aria-label="Select all rows" />
    </div>
  );
}

export const CheckboxColumnHead: Story = {
  name: "Checkbox Column Head",
  render: () => <CheckboxColumnHeadDemo />,
};

export const Gallery: Story = {
  name: "All types",
  render: () => (
    <div style={{ width: "16rem", display: "flex", flexDirection: "column", border: "1px solid var(--border-subtle)" }}>
      <Cell type="columnHead">Column</Cell>
      <Cell type="text">Acme Corp</Cell>
      <Cell type="numeric">1,204</Cell>
      <Cell type="emphasis">Acme Corp</Cell>
      <Cell type="double" secondary="Owner">
        Maya Chen
      </Cell>
      <Cell type="null" />
      <Cell type="loading" />
      <Cell type="progress" value={49} />
      <Cell type="label">Draft</Cell>
      <Cell type="button" onClick={() => {}}>
        View
      </Cell>
      <Cell type="avatar" name="Maya Chen" sublabel="Design">
        Maya Chen
      </Cell>
      <Cell type="checkbox" aria-label="Select row" />
      <Cell
        type="icon"
        actions={[
          { icon: <Pencil size={16} />, label: "Edit" },
          { icon: <Trash2 size={16} />, label: "Delete" },
        ]}
      />
    </div>
  ),
};
