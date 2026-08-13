import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "@numosai/ui";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  // No "autodocs" tag — Pagination.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    totalPages: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    totalPages: 25,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: (args) => <Pagination {...args} />,
};

export const FirstPage: Story = {
  name: "First page (Prev disabled)",
  render: () => <Pagination defaultPage={1} totalPages={25} />,
};

export const LastPage: Story = {
  name: "Last page (Next disabled)",
  render: () => <Pagination defaultPage={25} totalPages={25} />,
};

export const SinglePage: Story = {
  name: "Single page (both disabled)",
  render: () => <Pagination defaultPage={1} totalPages={1} />,
};

export const Disabled: Story = {
  render: () => <Pagination defaultPage={4} totalPages={25} disabled />,
};

function ControlledExample() {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <Pagination page={page} totalPages={25} onPageChange={setPage} />
      <p style={{ margin: 0, font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>Page {page} of 25 (owned by the parent)</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
