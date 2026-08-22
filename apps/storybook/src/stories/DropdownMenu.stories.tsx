import type { Meta, StoryObj } from "@storybook/react";
import { User, Settings, LogOut, Pencil, Copy, Trash2, Filter } from "lucide-react";
import { Button, Checkbox, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPanel, Slider, TextInput } from "@numosai/ui";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  // No "autodocs" tag — DropdownMenu.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

// DropdownMenuContent is position: absolute, so it doesn't add height to its
// in-flow parent — without an explicit min-height, Storybook's Canvas sizes
// itself to the (closed-height) trigger alone and clips the open menu.
const PREVIEW_STYLE = { minHeight: 220 };

export const Default: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem leadingIcon={<User size={16} />}>Profile</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<Settings size={16} />}>Settings</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<LogOut size={16} />}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const OpenByDefault: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button variant="secondary">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem leadingIcon={<User size={16} />}>Profile</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<Settings size={16} />}>Settings</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<LogOut size={16} />}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const WithActiveAndDisabled: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button variant="secondary">Row actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem leadingIcon={<Pencil size={16} />} active>Edit</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<Copy size={16} />}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem leadingIcon={<Trash2 size={16} />} disabled>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const FilterPanel: Story = {
  name: "DropdownMenuPanel (any input components)",
  render: () => (
    <div style={{ minHeight: 380 }}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button variant="secondary" leadingIcon={<Filter size={16} />}>
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPanel style={{ width: "20rem" }}>
          <TextInput label="Name contains" placeholder="e.g. invoice" size="md" />
          <Checkbox label="Only overdue" size="md" />
          <Slider label="Minimum amount" defaultValue={40} size="md" />
        </DropdownMenuPanel>
      </DropdownMenu>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-6)", ...PREVIEW_STYLE }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <DropdownMenu key={size} defaultOpen>
          <DropdownMenuTrigger>
            <Button variant="secondary" size={size}>{size}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent size={size}>
            <DropdownMenuItem>First option</DropdownMenuItem>
            <DropdownMenuItem>Second option</DropdownMenuItem>
            <DropdownMenuItem>Third option</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};
