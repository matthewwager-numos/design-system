import type { Meta, StoryObj } from "@storybook/react";
import { GrainCorner } from "@numosai/ui";

const PREVIEW_STYLE = { position: "relative" as const, width: "20rem", height: "8rem", background: "var(--background-default)", borderRadius: "0.5rem", overflow: "hidden" };
const ANCHOR_STYLE = { position: "absolute" as const, right: -8, bottom: -8 };

const meta: Meta<typeof GrainCorner> = {
  title: "Components/GrainCorner",
  component: GrainCorner,
  argTypes: {
    color: { control: "color" },
  },
  args: {
    color: "var(--background-positive-base)",
  },
};

export default meta;
type Story = StoryObj<typeof GrainCorner>;

export const Default: Story = {
  render: (args) => (
    <div data-theme="dark" style={PREVIEW_STYLE}>
      <div style={ANCHOR_STYLE}>
        <GrainCorner {...args} />
      </div>
    </div>
  ),
};

export const AllAccentColors: Story = {
  name: "The 4 accent-color tokens",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
      {(
        [
          ["var(--background-brand-base)", "Brand"],
          ["var(--background-positive-base)", "Green"],
          ["var(--background-alt-negative-base)", "Magenta"],
          ["var(--background-notice-base)", "Yellow"],
        ] as const
      ).map(([color, name]) => (
        <div key={name} data-theme="dark" style={PREVIEW_STYLE}>
          <div style={ANCHOR_STYLE}>
            <GrainCorner color={color} />
          </div>
          <span style={{ position: "relative", color: "#fff", font: "var(--type-paragraph-s-regular)", padding: "var(--space-4)" }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
