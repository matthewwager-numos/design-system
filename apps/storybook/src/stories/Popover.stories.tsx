import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import { Button, ButtonGroup, Popover } from "@numosai/ui";
import type { PopoverPlacement, PopoverTriggerMode } from "@numosai/ui";

interface PopoverPlaygroundArgs {
  title?: string;
  content: string;
  showClose: boolean;
  withActions: boolean;
  placement: PopoverPlacement;
  trigger: PopoverTriggerMode;
  /** Starts the popover open, but it's still the real, uncontrolled component underneath — clicking (or hovering off, in "hover" mode) still closes it, unlike a permanently `open`-forced instance. */
  defaultOpen: boolean;
}

// Popover content is portaled/position: fixed, so a closed popover adds no
// height to its in-flow parent — without an explicit min-height, Storybook's
// Canvas sizes itself to the trigger alone and clips the open popover.
const PREVIEW_STYLE = { minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" };

function PopoverPlayground({ title, content, showClose, withActions, placement, trigger, defaultOpen }: PopoverPlaygroundArgs) {
  return (
    <div style={PREVIEW_STYLE}>
      <Popover
        title={title || undefined}
        content={content}
        showClose={showClose}
        actions={
          withActions ? (
            <ButtonGroup>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Confirm
              </Button>
            </ButtonGroup>
          ) : undefined
        }
        placement={placement}
        trigger={trigger}
        defaultOpen={defaultOpen}
      >
        <Button variant="secondary">{trigger === "hover" ? "Hover me" : "Click me"}</Button>
      </Popover>
    </div>
  );
}

const meta: Meta<typeof PopoverPlayground> = {
  title: "Components/Popover",
  component: PopoverPlayground,
  // No "autodocs" tag — Popover.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    showClose: { control: "boolean" },
    withActions: { control: "boolean" },
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    trigger: { control: "select", options: ["click", "hover"] },
    defaultOpen: { control: "boolean" },
  },
  args: {
    title: "Title",
    content: "Body text",
    showClose: true,
    withActions: false,
    placement: "top",
    trigger: "click",
    defaultOpen: false,
  },
};

export default meta;
type Story = StoryObj<typeof PopoverPlayground>;

// Genuinely click-to-open — no `defaultOpen` override — matching real usage.
export const Default: Story = {};

export const NoTitle: Story = {
  name: "No title",
  args: { title: "", defaultOpen: true },
};

export const Minimal: Story = {
  name: "No title, no close button",
  args: { title: "", showClose: false, defaultOpen: true },
};

export const WithActions: Story = {
  name: "With footer actions",
  args: { withActions: true, defaultOpen: true },
};

export const NoCloseButton: Story = {
  name: "Close button hidden",
  args: { showClose: false, withActions: true, defaultOpen: true },
};

export const Placements: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-8)", minHeight: 480 }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <PopoverPlayground key={placement} {...args} placement={placement} content={`placement="${placement}"`} defaultOpen />
      ))}
    </div>
  ),
  args: { defaultOpen: true },
};

// Genuinely hover-to-open — no close button (see the component's own rule:
// trigger="hover" always suppresses it), no `defaultOpen` override either.
export const HoverTrigger: Story = {
  name: 'trigger="hover"',
  args: { trigger: "hover", content: "Moving the pointer away closes this one." },
};

export const IconTrigger: Story = {
  name: "Icon-only trigger",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <Popover title={args.title || undefined} content={args.content} placement={args.placement} trigger={args.trigger} defaultOpen={args.defaultOpen}>
        <button
          type="button"
          aria-label="More info"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--content-subtle)", display: "flex" }}
        >
          <Info size={16} />
        </button>
      </Popover>
    </div>
  ),
  args: { content: "This metric excludes weekends." },
};
