import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "@numosai/ui";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function PlaceholderSlide({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 216,
        background: color,
        color: "var(--content-emphasis-inverse)",
        font: "var(--type-heading-m)",
      }}
    >
      {label}
    </div>
  );
}

const SLIDES = COLORS.map((color, i) => <PlaceholderSlide key={i} label={`Slide ${i + 1}`} color={color} />);

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  // No "autodocs" tag — Carousel.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    slides: { control: false },
    loop: { control: "boolean" },
    showDots: { control: "boolean" },
  },
  args: {
    slides: SLIDES,
    loop: false,
    showDots: true,
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

function CarouselDemo(args: React.ComponentProps<typeof Carousel>) {
  return (
    <div style={{ width: 480 }}>
      <Carousel {...args} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <CarouselDemo {...args} />,
};

export const Loop: Story = {
  name: "loop (arrows never disable)",
  args: { loop: true },
  render: (args) => <CarouselDemo {...args} />,
};

export const NoDots: Story = {
  name: "Dots hidden",
  args: { showDots: false },
  render: (args) => <CarouselDemo {...args} />,
};

export const TwoSlides: Story = {
  name: "Two slides",
  args: { slides: SLIDES.slice(0, 2) },
  render: (args) => <CarouselDemo {...args} />,
};

export const SingleSlide: Story = {
  name: "One slide (dots hidden automatically, both arrows disabled)",
  args: { slides: SLIDES.slice(0, 1) },
  render: (args) => <CarouselDemo {...args} />,
};

function ControlledDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ width: 480, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Carousel slides={SLIDES} index={index} onIndexChange={setIndex} />
      <p style={{ font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>Current slide: {index + 1}</p>
    </div>
  );
}

export const Controlled: Story = {
  name: "Controlled index",
  render: () => <ControlledDemo />,
};
