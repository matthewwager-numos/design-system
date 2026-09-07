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

// Deliberately varying heights (unlike SLIDES' uniform 216px) — demonstrates
// the viewer's own height following whichever slide is actually active, and
// gives overlaid controls something photo-like (full-bleed, no padding) to
// float over.
function PhotoSlide({ label, color, height }: { label: string; color: string; height: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height,
        boxSizing: "border-box",
        padding: "var(--space-4)",
        background: color,
        color: "var(--content-emphasis-inverse)",
        font: "var(--type-heading-m)",
      }}
    >
      {label}
    </div>
  );
}

const VARYING_HEIGHT_SLIDES = COLORS.map((color, i) => <PhotoSlide key={i} label={`Photo ${i + 1}`} color={color} height={160 + i * 40} />);

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  // No "autodocs" tag — Carousel.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    slides: { control: false },
    itemsPerView: { control: { type: "number", min: 1, max: 5, step: 1 } },
    loop: { control: "boolean" },
    showButtons: { control: "boolean" },
    buttonPlacement: { control: "select", options: ["perimeter", "overlay"] },
    showDots: { control: "boolean" },
    dotPlacement: { control: "select", options: ["perimeter", "overlay"] },
  },
  args: {
    slides: SLIDES,
    itemsPerView: 1,
    loop: false,
    showButtons: true,
    buttonPlacement: "perimeter",
    showDots: true,
    dotPlacement: "perimeter",
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

export const MultipleItemsPerView: Story = {
  name: "Multiple slides in view (itemsPerView)",
  args: { itemsPerView: 3 },
  render: (args) => <CarouselDemo {...args} />,
};

export const ButtonsHidden: Story = {
  name: "Buttons hidden (swipe/drag only — mobile-style)",
  args: { showButtons: false },
  render: (args) => <CarouselDemo {...args} />,
};

export const OverlayControls: Story = {
  name: "Overlay buttons + dots (full-bleed content)",
  args: { slides: VARYING_HEIGHT_SLIDES, buttonPlacement: "overlay", dotPlacement: "overlay" },
  render: (args) => <CarouselDemo {...args} />,
};

export const AutoHeight: Story = {
  name: "Height follows the active slide",
  args: { slides: VARYING_HEIGHT_SLIDES },
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
