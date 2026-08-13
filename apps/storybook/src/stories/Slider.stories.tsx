import { useState } from "react";
import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@numosai/ui";
import { Slider } from "@numosai/ui";
import type { SliderSize } from "@numosai/ui";

// Storybook's Controls can't drive `value`/`defaultValue` directly — it's
// `number | [number, number]` depending on whether this is a range slider,
// which isn't something a generic control can represent. This wrapper
// exposes plain, controllable args instead and builds the right shape
// underneath — the same "Playground" pattern used for Avatar's `image`
// boolean and Header's `subNav`/`actions` booleans.
interface SliderPlaygroundArgs {
  label: string;
  size: SliderSize;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  showValue: boolean;
  range: boolean;
  defaultValue: number;
  defaultMin: number;
  defaultMax: number;
}

function SliderPlayground({ range, defaultValue, defaultMin, defaultMax, ...rest }: SliderPlaygroundArgs) {
  return <Slider {...rest} defaultValue={range ? [defaultMin, defaultMax] : defaultValue} />;
}

const meta: Meta<typeof SliderPlayground> = {
  title: "Components/Slider",
  component: SliderPlayground,
  // No "autodocs" tag — Slider.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
    range: { control: "boolean" },
    defaultValue: { control: { type: "range", min: 0, max: 100, step: 1 }, if: { arg: "range", truthy: false } },
    defaultMin: { control: { type: "range", min: 0, max: 100, step: 1 }, if: { arg: "range" } },
    defaultMax: { control: { type: "range", min: 0, max: 100, step: 1 }, if: { arg: "range" } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    showValue: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    label: "Volume",
    size: "md",
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    showValue: true,
    range: false,
    defaultValue: 40,
    defaultMin: 25,
    defaultMax: 75,
  },
};

export default meta;
type Story = StoryObj<typeof SliderPlayground>;

const PREVIEW_STYLE = { width: "20rem" };

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SliderPlayground {...args} />
    </div>
  ),
};

export const Range: Story = {
  args: { range: true, label: "Price range" },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SliderPlayground {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Slider label="Size sm" size="sm" defaultValue={40} />
      <Slider label="Size md" size="md" defaultValue={40} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Slider label="Volume" defaultValue={40} disabled />
      <Slider label="Price range" defaultValue={[25, 75]} disabled />
    </div>
  ),
};

export const CustomFormat: Story = {
  name: "formatValue",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Slider label="Budget" min={0} max={500} step={10} defaultValue={[100, 350]} formatValue={(v) => `$${v}`} />
    </div>
  ),
};

function InFormExample() {
  const [result, setResult] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setResult(JSON.stringify(Object.fromEntries(data), null, 2));
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Slider name="volume" label="Volume" defaultValue={40} />
      <Slider name="price" label="Price range" defaultValue={[25, 75]} />
      <Button type="submit">Submit</Button>
      {result && (
        <pre style={{ padding: "1rem", background: "var(--background-element)", borderRadius: "var(--radius-md)", fontSize: "0.75rem" }}>{result}</pre>
      )}
    </form>
  );
}

export const InForm: Story = {
  name: "Inside a <form>",
  render: () => <InFormExample />,
};
