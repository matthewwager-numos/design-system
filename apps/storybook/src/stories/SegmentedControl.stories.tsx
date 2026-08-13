import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { List, LayoutGrid } from "lucide-react";
import { SegmentedControl, SegmentedControlOption } from "@numosai/ui";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  // No "autodocs" tag — SegmentedControl.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: () => {
    function Controlled() {
      const [value, setValue] = useState("week");
      return (
        <SegmentedControl value={value} onValueChange={setValue}>
          <SegmentedControlOption value="day">Day</SegmentedControlOption>
          <SegmentedControlOption value="week">Week</SegmentedControlOption>
          <SegmentedControlOption value="month">Month</SegmentedControlOption>
        </SegmentedControl>
      );
    }
    return <Controlled />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <SegmentedControl key={size} size={size} defaultValue="week">
          <SegmentedControlOption value="day">Day</SegmentedControlOption>
          <SegmentedControlOption value="week">Week</SegmentedControlOption>
          <SegmentedControlOption value="month">Month</SegmentedControlOption>
        </SegmentedControl>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  name: "With icons",
  render: () => (
    <SegmentedControl defaultValue="list">
      <SegmentedControlOption value="list" leadingIcon={<List size={16} />}>
        List
      </SegmentedControlOption>
      <SegmentedControlOption value="grid" leadingIcon={<LayoutGrid size={16} />}>
        Grid
      </SegmentedControlOption>
    </SegmentedControl>
  ),
};

export const DisabledOption: Story = {
  name: "Disabled option",
  render: () => (
    <SegmentedControl defaultValue="day">
      <SegmentedControlOption value="day">Day</SegmentedControlOption>
      <SegmentedControlOption value="week">Week</SegmentedControlOption>
      <SegmentedControlOption value="month" disabled>
        Month
      </SegmentedControlOption>
    </SegmentedControl>
  ),
};
