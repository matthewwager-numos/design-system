import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "lucide-react";
import { DatePicker, DropdownMenu, DropdownMenuPanel, DropdownMenuTrigger, TextInput } from "@numosai/ui";
import type { DateRange } from "@numosai/ui";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const TODAY = new Date(2026, 0, 11);

export const Default: Story = {
  render: () => <DatePicker defaultMonth={TODAY} defaultValue={TODAY} />,
};

export const RangeSelection: Story = {
  name: "mode=\"range\"",
  render: () => <DatePicker mode="range" defaultMonth={TODAY} defaultRangeValue={{ start: new Date(2026, 0, 11), end: new Date(2026, 0, 16) }} />,
};

export const WithDisabledDates: Story = {
  name: "isDateDisabled (weekends)",
  render: () => <DatePicker defaultMonth={TODAY} isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6} />,
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function DateInputDemo() {
  const [value, setValue] = useState<Date | null>(TODAY);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TextInput
          readOnly
          size="md"
          label="Due date"
          value={value ? dateFormatter.format(value) : ""}
          placeholder="Select a date"
          trailingIcon={<Calendar size={16} />}
          style={{ width: "12rem", cursor: "pointer" }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuPanel matchTriggerWidth={false} style={{ width: "12.5rem" }}>
        <DatePicker defaultMonth={value ?? undefined} value={value} onChange={setValue} />
      </DropdownMenuPanel>
    </DropdownMenu>
  );
}

export const InADropdown: Story = {
  name: "As a date input's own dropdown",
  render: () => (
    <div style={{ minHeight: 340 }}>
      <DateInputDemo />
    </div>
  ),
};
