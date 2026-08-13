import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FadeIn } from "@numosai/motion";
import { Button } from "@numosai/ui";

interface FadeInDemoProps {
  delay: number;
  duration: number;
  distance: number;
}

function FadeInDemo(props: FadeInDemoProps) {
  const [k, setK] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "center" }}>
      <Button onClick={() => setK((n) => n + 1)} variant="secondary">Replay</Button>
      <FadeIn key={k} {...props}>
        <div
          style={{
            padding: "var(--space-5) var(--space-6)",
            background: "var(--background-brand-base)",
            color: "var(--content-brand-inverse)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-l)",
          }}
        >
          Hello, world
        </div>
      </FadeIn>
    </div>
  );
}

const meta: Meta<typeof FadeInDemo> = {
  title: "Illustration tools/Motion/FadeIn",
  component: FadeInDemo,
  tags: ["autodocs"],
  argTypes: {
    delay: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    duration: { control: { type: "range", min: 0.1, max: 2, step: 0.05 } },
    distance: { control: { type: "range", min: 0, max: 64, step: 1 } },
  },
  args: { delay: 0, duration: 0.4, distance: 8 },
};

export default meta;
type Story = StoryObj<typeof FadeInDemo>;

export const Default: Story = {};
