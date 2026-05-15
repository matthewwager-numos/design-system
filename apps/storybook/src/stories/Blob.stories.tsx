import type { Meta, StoryObj } from "@storybook/react";
import { blob } from "@numosai/generative";

interface BlobDemoProps {
  points: number;
  randomness: number;
  seed: number;
  fill: string;
  radius: number;
}

function BlobDemo({ points, randomness, seed, fill, radius }: BlobDemoProps) {
  const { d, viewBox } = blob({ points, randomness, seed, radius });
  return (
    <svg viewBox={viewBox} width={2 * radius} height={2 * radius}>
      <path d={d} fill={fill} />
    </svg>
  );
}

const meta: Meta<typeof BlobDemo> = {
  title: "Illustration tools/Generative/Blob",
  component: BlobDemo,
  tags: ["autodocs"],
  argTypes: {
    points: { control: { type: "range", min: 3, max: 16, step: 1 } },
    randomness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    seed: { control: { type: "number" } },
    radius: { control: { type: "range", min: 40, max: 200, step: 10 } },
    fill: { control: "color" },
  },
  args: {
    points: 6,
    randomness: 0.35,
    seed: 42,
    radius: 120,
    fill: "var(--color-primary)",
  },
};

export default meta;
type Story = StoryObj<typeof BlobDemo>;

export const Default: Story = {};

export const HighRandomness: Story = {
  args: { randomness: 0.85, seed: 7 },
};

export const ManyPoints: Story = {
  args: { points: 14, randomness: 0.2 },
};
