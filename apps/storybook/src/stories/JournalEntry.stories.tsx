import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { JournalEntry } from "@numosai/ui";
import type { JournalEntryValue } from "@numosai/ui";

// No `component: JournalEntry` — its `accountOptions`/`departmentOptions`/
// `locationOptions` props are arrays of objects with a `label: ReactNode`
// field, the same shape that's already caused a confirmed `react-docgen`
// stack overflow through the Controls addon elsewhere in this codebase
// (see DragList.stories.tsx). JournalEntry.mdx documents props by hand
// instead.
const meta: Meta = {
  title: "Components/JournalEntry",
};

export default meta;
type Story = StoryObj;

const ACCOUNT_OPTIONS = [
  { value: "1001", label: "000001 Cash operating account" },
  { value: "1002", label: "000002 Intransit Vendor account" },
  { value: "4001", label: "000010 Accrued expenses" },
  { value: "5001", label: "000020 Office supplies expense" },
];

const DEPARTMENT_OPTIONS = [
  { value: "smb", label: "10 – SMB" },
  { value: "enterprise", label: "20 – Enterprise" },
  { value: "corp", label: "30 – Corporate" },
];

const LOCATION_OPTIONS = [
  { value: "other", label: "03 Other" },
  { value: "sf", label: "01 San Francisco" },
  { value: "nyc", label: "02 New York" },
];

const BALANCED_VALUE: JournalEntryValue = {
  date: "2027-01-14",
  reference: "5678",
  lines: [
    {
      id: "line-1",
      account: "1002",
      department: "smb",
      location: "other",
      memo: "January vendor accrual reversal",
      debit: 1250,
    },
    {
      id: "line-2",
      account: "1001",
      department: "smb",
      location: "other",
      memo: "Cash settlement",
      credit: 1250,
    },
  ],
};

const UNBALANCED_VALUE: JournalEntryValue = {
  ...BALANCED_VALUE,
  lines: [BALANCED_VALUE.lines[0]!, { ...BALANCED_VALUE.lines[1]!, credit: 900 }],
};

const EMPTY_VALUE: JournalEntryValue = {
  date: "2027-01-14",
  reference: "",
  lines: [],
};

function JournalEntryDemo({ initialValue, initialEditing = false }: { initialValue: JournalEntryValue; initialEditing?: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(initialEditing);

  return (
    <div style={{ width: "56rem", maxWidth: "100%" }}>
      <JournalEntry
        aria-label="Journal entry"
        value={value}
        editing={editing}
        onEditingChange={setEditing}
        onSave={(next) => {
          setValue(next);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
        accountOptions={ACCOUNT_OPTIONS}
        departmentOptions={DEPARTMENT_OPTIONS}
        locationOptions={LOCATION_OPTIONS}
      />
    </div>
  );
}

export const Default: Story = {
  name: "Read mode (balanced)",
  render: () => <JournalEntryDemo initialValue={BALANCED_VALUE} />,
};

export const Editing: Story = {
  render: () => <JournalEntryDemo initialValue={BALANCED_VALUE} initialEditing />,
};

export const Unbalanced: Story = {
  name: "Read mode (unbalanced)",
  render: () => <JournalEntryDemo initialValue={UNBALANCED_VALUE} />,
};

export const Empty: Story = {
  name: "New entry (no lines yet)",
  render: () => <JournalEntryDemo initialValue={EMPTY_VALUE} initialEditing />,
};
