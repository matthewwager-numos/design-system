import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DragList } from "@numosai/ui";
import type { DragListAddOption, DragListItem } from "@numosai/ui";

// No `component: DragList` — its `items`/`addOptions` props are arrays of
// objects with a `label: ReactNode` field, and this codebase has already
// hit a real crash (a confirmed `react-docgen` stack overflow, unrelated
// to DragList's own render logic) from feeding ReactNode-shaped prop types
// through the Controls addon's auto-generated argTypes. No autodocs page
// here relies on that table anyway — this file's own MDX documents props
// by hand instead.
const meta: Meta = {
  title: "Components/DragList",
};

export default meta;
type Story = StoryObj;

const INITIAL_ITEMS: DragListItem[] = [
  { id: "sync", label: "Sync data" },
  { id: "validate", label: "Validate completion" },
  { id: "prepare", label: "Prepare schedules" },
  { id: "review", label: "Review with manager" },
  { id: "close", label: "Close the books" },
];

const INITIAL_ADD_OPTIONS: DragListAddOption[] = [
  { value: "audit", label: "Audit trail" },
  { value: "signoff", label: "Manager sign-off" },
  { value: "notify", label: "Notify stakeholders" },
];

function DragListDemo({ removable = true, addable = false }: { removable?: boolean; addable?: boolean }) {
  const [items, setItems] = useState<DragListItem[]>(INITIAL_ITEMS);
  const [addOptions, setAddOptions] = useState<DragListAddOption[]>(INITIAL_ADD_OPTIONS);

  function handleAddOption(value: string) {
    const option = addOptions.find((candidate) => candidate.value === value);
    if (!option) return;
    setItems((prev) => [...prev, { id: option.value, label: option.label }]);
    setAddOptions((prev) => prev.filter((candidate) => candidate.value !== value));
  }

  // A deleted item goes back into the add dropdown rather than
  // disappearing entirely — it's still a real thing you might want to add
  // back later, not junk.
  function handleRemove(id: string) {
    const removed = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (addable && removed) {
      setAddOptions((prev) => [...prev, { value: removed.id, label: removed.label }]);
    }
  }

  return (
    <div style={{ width: "16rem", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {addable && (
        <p style={{ margin: 0, font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>
          {items.length} in list · {addOptions.length} available to add
        </p>
      )}
      <DragList
        items={items}
        onReorder={setItems}
        onRemove={removable ? handleRemove : undefined}
        addOptions={addable ? addOptions : undefined}
        onAddOption={addable ? handleAddOption : undefined}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DragListDemo />,
};

export const WithAddButton: Story = {
  name: "With an add-item dropdown",
  render: () => <DragListDemo addable />,
};

export const NotRemovable: Story = {
  name: "Without a delete button",
  render: () => <DragListDemo removable={false} />,
};
