import { useState } from "react";
import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Apple, Banana, Carrot, Cherry, Grape } from "lucide-react";
import { Button, SearchInput } from "@numosai/ui";
import type { SearchInputOption } from "@numosai/ui";

const FRUIT_OPTIONS: SearchInputOption[] = [
  { value: "apple", label: "Apple", leadingIcon: <Apple size={16} /> },
  { value: "banana", label: "Banana", leadingIcon: <Banana size={16} /> },
  { value: "cherry", label: "Cherry", leadingIcon: <Cherry size={16} /> },
  { value: "grape", label: "Grape", leadingIcon: <Grape size={16} /> },
  { value: "grapefruit", label: "Grapefruit" },
  { value: "carrot", label: "Carrot (not a fruit)", leadingIcon: <Carrot size={16} />, disabled: true },
];

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  // No "autodocs" tag — SearchInput.mdx is this component's docs page.
  argTypes: {
    status: { control: "select", options: ["default", "error", "success"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Fruit",
    placeholder: "Search fruit",
    status: "default",
    size: "lg",
    disabled: false,
    options: FRUIT_OPTIONS,
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

// minHeight leaves room for the dropdown (up to 14rem tall) to render
// without the surrounding Storybook canvas clipping or scrolling it away.
const PREVIEW_STYLE = { width: "20rem", minHeight: "22rem" };

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <SearchInput {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <SearchInput size="sm" label="Size sm" placeholder="Search fruit" options={FRUIT_OPTIONS} />
      <SearchInput size="md" label="Size md" placeholder="Search fruit" options={FRUIT_OPTIONS} />
      <SearchInput size="lg" label="Size lg" placeholder="Search fruit" options={FRUIT_OPTIONS} />
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <SearchInput label="Fruit" defaultValue="Zucchini" status="error" helpText="No fruit named that" options={FRUIT_OPTIONS} />
      <SearchInput label="Fruit" defaultValue="Apple" status="success" helpText="Looks good" options={FRUIT_OPTIONS} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <SearchInput label="Fruit" defaultValue="Apple" disabled options={FRUIT_OPTIONS} />
    </div>
  ),
};

export const NoDropdown: Story = {
  name: "Without options (plain search box)",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <SearchInput label="Search" placeholder="Search anything" />
    </div>
  ),
};

function SelectionExample() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SearchInput label="Fruit" placeholder="Search fruit" options={FRUIT_OPTIONS} onSelect={(option) => setSelected(option.value)} />
      <p style={{ margin: 0, font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>
        {selected ? `Selected: ${selected}` : "Nothing selected yet"}
      </p>
    </div>
  );
}

export const OnSelect: Story = {
  name: "onSelect",
  render: () => <SelectionExample />,
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
      <SearchInput name="fruit" label="Fruit" placeholder="Search fruit" options={FRUIT_OPTIONS} />
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
