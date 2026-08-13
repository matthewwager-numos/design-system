import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Cell, Column } from "@numosai/ui";

const meta: Meta<typeof Column> = {
  title: "Components/Column",
  component: Column,
  // No "autodocs" tag — Column.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Column>;

const COMPANIES = ["Acme Corp", "Globex", "Initech", "Umbrella Inc", "Soylent Corp"];

export const Default: Story = {
  render: () => (
    <div style={{ width: "16rem", border: "1px solid var(--border-subtle)" }}>
      <Column header={<Cell type="columnHead">Company</Cell>}>
        {COMPANIES.map((name) => (
          <Cell key={name} type="text">
            {name}
          </Cell>
        ))}
      </Column>
    </div>
  ),
};

export const Sorted: Story = {
  render: () => (
    <div style={{ width: "16rem", border: "1px solid var(--border-subtle)" }}>
      <Column
        header={
          <Cell type="sorted" direction="asc">
            Company
          </Cell>
        }
      >
        {[...COMPANIES].sort().map((name) => (
          <Cell key={name} type="text">
            {name}
          </Cell>
        ))}
      </Column>
    </div>
  ),
};

const RENEWALS = [49, 82, 12, 100, 67];

// Row selection lives here, in the parent — the same way a real table's
// selection state doesn't belong to any one cell. Cell's own checkbox is
// controlled only when you pass `checked`; this is what that looks like.
function SelectableTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === COMPANIES.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(COMPANIES));
  }

  function toggleOne(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", border: "1px solid var(--border-subtle)" }}>
      <Column
        header={<Cell type="checkboxColumnHead" checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all rows" />}
        width={56}
      >
        {COMPANIES.map((name) => (
          <Cell key={name} type="checkbox" checked={selected.has(name)} onCheckedChange={() => toggleOne(name)} aria-label={`Select ${name}`} />
        ))}
      </Column>
      <Column header={<Cell type="sorted">Company</Cell>}>
        {COMPANIES.map((name) => (
          <Cell key={name} type="emphasis">
            {name}
          </Cell>
        ))}
      </Column>
      <Column header={<Cell type="columnHead">Renewal</Cell>} width={140}>
        {RENEWALS.map((value, index) => (
          <Cell key={COMPANIES[index]} type="progress" value={value} />
        ))}
      </Column>
    </div>
  );
}

export const MultipleColumns: Story = {
  name: "Side by side",
  render: () => <SelectableTable />,
};
