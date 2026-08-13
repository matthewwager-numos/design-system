import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import { Button, Tooltip } from "@numosai/ui";
import type { TooltipPlacement, TooltipTriggerMode } from "@numosai/ui";

interface TooltipPlaygroundArgs {
  title?: string;
  content: string;
  placement: TooltipPlacement;
  trigger: TooltipTriggerMode;
  /** Forces the tooltip open for review, bypassing hover/click — real Tooltip usage never passes `open: true` permanently, this is Storybook-only. */
  open: boolean;
}

// Tooltip content is position: absolute, so a closed/hover-only tooltip adds
// no height to its in-flow parent — without an explicit min-height, Storybook's
// Canvas sizes itself to the trigger alone and clips the open tooltip.
const PREVIEW_STYLE = { minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" };

function TooltipPlayground({ title, content, placement, trigger, open }: TooltipPlaygroundArgs) {
  return (
    <div style={PREVIEW_STYLE}>
      <Tooltip title={title || undefined} content={content} placement={placement} trigger={trigger} open={open || undefined}>
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
    </div>
  );
}

const meta: Meta<typeof TooltipPlayground> = {
  title: "Components/Tooltip",
  component: TooltipPlayground,
  // No "autodocs" tag — Tooltip.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    trigger: { control: "select", options: ["hover", "click"] },
    open: { control: "boolean" },
  },
  args: {
    title: "",
    content: "Saved 2 minutes ago",
    placement: "top",
    trigger: "hover",
    open: false,
  },
};

export default meta;
type Story = StoryObj<typeof TooltipPlayground>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: { title: "Autosave", content: "Changes are saved automatically as you type.", open: true },
};

export const Placements: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-8)", minHeight: 320 }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <TooltipPlayground key={placement} {...args} placement={placement} content={`placement="${placement}"`} open />
      ))}
    </div>
  ),
};

export const ClickTrigger: Story = {
  name: 'trigger="click"',
  args: { trigger: "click", content: "Click again (or press Escape) to close." },
};

export const IconTrigger: Story = {
  name: "Icon-only trigger",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <Tooltip title={args.title || undefined} content={args.content} placement={args.placement} trigger={args.trigger} open={args.open || undefined}>
        <button
          type="button"
          aria-label="More info"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--content-subtle)", display: "flex" }}
        >
          <Info size={16} />
        </button>
      </Tooltip>
    </div>
  ),
  args: { content: "This metric excludes weekends." },
};
