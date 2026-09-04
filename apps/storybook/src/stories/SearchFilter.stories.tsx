import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, SearchFilter, Slider, TextInput } from "@numosai/ui";
import type { SearchFilterProperty } from "@numosai/ui";

// DropdownMenuPanel is position: absolute, so it doesn't add height to its
// in-flow parent — without an explicit min-height, Storybook's Canvas sizes
// itself to the (closed-height) field alone and clips the panel once opened.
const PREVIEW_STYLE = { minHeight: 420, width: "20rem" };

const meta: Meta<typeof SearchFilter> = {
  title: "Components/SearchFilter",
  component: SearchFilter,
  // No "autodocs" tag — SearchFilter.mdx is this component's docs page.
  argTypes: {
    filters: { control: false },
    properties: { control: false },
    status: {
      control: "select",
      options: ["default", "error", "success"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Invoices",
    placeholder: "Search or filter",
    status: "default",
    size: "lg",
  },
};

export default meta;
type Story = StoryObj<typeof SearchFilter>;

const SAMPLE_PROPERTIES: SearchFilterProperty[] = [
  {
    key: "status",
    label: "status",
    values: [
      { value: "overdue", label: "Overdue" },
      { value: "paid", label: "Paid" },
      { value: "draft", label: "Draft" },
    ],
  },
  {
    key: "customer",
    label: "customer",
    values: [
      { value: "acme", label: "Acme Co." },
      { value: "globex", label: "Globex Corp." },
    ],
  },
  {
    key: "amount",
    label: "amount",
    values: [
      { value: ">40", label: "> $40" },
      { value: "<40", label: "< $40" },
    ],
  },
];

function SampleFilters() {
  return (
    <>
      <Checkbox label="Only overdue" size="md" />
      <Checkbox label="Only paid" size="md" />
      <Slider label="Minimum amount" defaultValue={40} size="md" />
      <TextInput label="Customer" placeholder="e.g. Acme Co." size="md" />
    </>
  );
}

export const PlainSearch: Story = {
  name: "No filters (plain search)",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} />
    </div>
  ),
};

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} filters={<SampleFilters />} />
    </div>
  ),
};

// Type a bare word to see matching properties (e.g. "sta" → "status:");
// finish one with a colon (e.g. "status:") to see just that property's own
// values, narrowed further by whatever's typed after it.
export const Suggestions: Story = {
  name: "Typing suggestions",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} properties={SAMPLE_PROPERTIES} />
    </div>
  ),
};

// The suggestions dropdown and the filter panel are two separate popups
// that share the same field — opening one always closes the other.
export const SuggestionsAndFilters: Story = {
  name: "Suggestions + filter panel together",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} properties={SAMPLE_PROPERTIES} filters={<SampleFilters />} />
    </div>
  ),
};

export const FiltersOpenByDefault: Story = {
  name: "Filters open by default",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} filters={<SampleFilters />} defaultFiltersOpen />
    </div>
  ),
};

export const Filled: Story = {
  name: "With filter notation applied",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} defaultValue="status:overdue amount:>40" filters={<SampleFilters />} />
    </div>
  ),
};

export const Error: Story = {
  args: { status: "error", helpText: "That filter combination returned no results." },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} filters={<SampleFilters />} />
    </div>
  ),
};

export const Success: Story = {
  args: { status: "success", helpText: "3 invoices match." },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} defaultValue="status:overdue" filters={<SampleFilters />} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchFilter {...args} defaultValue="status:overdue" filters={<SampleFilters />} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", ...PREVIEW_STYLE }}>
      <SearchFilter {...args} size="sm" label="Small" filters={<SampleFilters />} />
      <SearchFilter {...args} size="md" label="Medium" filters={<SampleFilters />} />
      <SearchFilter {...args} size="lg" label="Large" filters={<SampleFilters />} />
    </div>
  ),
};

// A worked, Gmail-style example: checking a box or dragging the slider
// composes real "standard filter notation" and pushes it straight into the
// field's own value — the same field you could also just type into by hand.
function WorkedExampleDemo() {
  const [query, setQuery] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [paid, setPaid] = useState(false);
  const [minAmount, setMinAmount] = useState(0);

  function applyFilters(nextOverdue: boolean, nextPaid: boolean, nextMinAmount: number) {
    const parts: string[] = [];
    if (nextOverdue) parts.push("status:overdue");
    if (nextPaid) parts.push("status:paid");
    if (nextMinAmount > 0) parts.push(`amount:>${nextMinAmount}`);
    setQuery(parts.join(" "));
  }

  return (
    <div style={PREVIEW_STYLE}>
      <SearchFilter
        label="Invoices"
        value={query}
        onChange={setQuery}
        filters={
          <>
            <Checkbox
              label="Only overdue"
              size="md"
              checked={overdue}
              onChange={(event) => {
                setOverdue(event.target.checked);
                applyFilters(event.target.checked, paid, minAmount);
              }}
            />
            <Checkbox
              label="Only paid"
              size="md"
              checked={paid}
              onChange={(event) => {
                setPaid(event.target.checked);
                applyFilters(overdue, event.target.checked, minAmount);
              }}
            />
            <Slider
              label="Minimum amount"
              size="md"
              value={minAmount}
              onValueChange={(next) => {
                const value = next as number;
                setMinAmount(value);
                applyFilters(overdue, paid, value);
              }}
            />
          </>
        }
      />
    </div>
  );
}

export const WorkedExample: Story = {
  name: "Building filter notation live",
  render: () => <WorkedExampleDemo />,
};
