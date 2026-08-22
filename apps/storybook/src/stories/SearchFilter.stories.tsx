import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, SearchFilter, Slider, TextInput } from "@numosai/ui";

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
