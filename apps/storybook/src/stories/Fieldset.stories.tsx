import type { Meta, StoryObj } from "@storybook/react";
import { Fieldset, FieldsetRow, Select, TextInput } from "@numosai/ui";
import type { FieldsetSize } from "@numosai/ui";

const meta: Meta<typeof Fieldset> = {
  title: "Components/Fieldset",
  component: Fieldset,
  // No "autodocs" tag — Fieldset.mdx is this component's docs page.
};

export default meta;
type Story = StoryObj<typeof Fieldset>;

const STATE_OPTIONS = [
  { value: "ca", label: "California" },
  { value: "ny", label: "New York" },
  { value: "tx", label: "Texas" },
];

function AddressExample({ size }: { size: FieldsetSize }) {
  return (
    <Fieldset label="Address" size={size}>
      <TextInput size={size} placeholder="Street Address 1" aria-label="Street address 1" />
      <TextInput size={size} placeholder="Street Address 2" aria-label="Street address 2" />
      <TextInput size={size} placeholder="City" aria-label="City" />
      <FieldsetRow>
        {/* Select needs no `aria-label` here — its placeholder is real
            visible button text (not a vanishing `placeholder` attribute
            like TextInput's), so it already has a valid accessible name. */}
        <Select size={size} options={STATE_OPTIONS} placeholder="State or Province" />
        <TextInput size={size} placeholder="Zip or Postal Code" aria-label="Zip or postal code" />
      </FieldsetRow>
    </Fieldset>
  );
}

export const Default: Story = {
  name: "Address (medium)",
  render: () => (
    <div style={{ width: "20rem", maxWidth: "100%" }}>
      <AddressExample size="md" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ width: "20rem", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <AddressExample size="sm" />
      <AddressExample size="md" />
      <AddressExample size="lg" />
    </div>
  ),
};

export const ErrorState: Story = {
  name: "Error (one field)",
  render: () => (
    <div style={{ width: "20rem", maxWidth: "100%" }}>
      <Fieldset label="Address" size="md">
        <TextInput size="md" placeholder="Street Address 1" aria-label="Street address 1" defaultValue="1 Market St" />
        <TextInput size="md" placeholder="Street Address 2" aria-label="Street address 2" />
        <TextInput size="md" placeholder="City" aria-label="City" defaultValue="San Francisco" />
        <FieldsetRow>
          <Select size="md" options={STATE_OPTIONS} placeholder="State or Province" defaultValue="ca" />
          <TextInput
            size="md"
            placeholder="Zip or Postal Code"
            aria-label="Zip or postal code"
            defaultValue="941"
            status="error"
            helpText="Enter a valid ZIP code"
          />
        </FieldsetRow>
      </Fieldset>
    </div>
  ),
};
