import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "@numosai/ui";
import type { AvatarColor, AvatarSize, AvatarType } from "@numosai/ui";
import personPhoto from "../assets/avatar-example-person.png";
import entityLogo from "../assets/avatar-example-entity.svg";

interface AvatarPlaygroundArgs {
  name?: string;
  initials?: string;
  size: AvatarSize;
  type: AvatarType;
  color: AvatarColor;
  tooltip: boolean;
  /**
   * Not a real Avatar prop — Avatar itself has no boolean for this, `src`
   * being set (vs. undefined) is what decides image-vs-initial. This
   * control just fills `src` with the right example asset for `type` so
   * Controls can toggle the image on/off without needing a real URL.
   */
  image: boolean;
}

function AvatarPlayground({ image, type, ...rest }: AvatarPlaygroundArgs) {
  const src = image ? (type === "entity" ? entityLogo : personPhoto) : undefined;
  return <Avatar {...rest} type={type} src={src} />;
}

const meta: Meta<typeof AvatarPlayground> = {
  title: "Components/Avatar",
  component: AvatarPlayground,
  // No "autodocs" tag — Avatar.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    type: {
      control: "select",
      options: ["person", "entity"],
    },
    color: {
      control: "select",
      options: ["info", "positive", "notice", "negative", "neutral", "alt-negative"],
    },
    name: { control: "text" },
    initials: { control: "text" },
    tooltip: {
      description: "Shows `name` (or `initials`) in a tooltip on hover. On by default.",
      control: "boolean",
    },
    image: {
      name: "Image",
      description: "Storybook-only — fills `src` with an example asset (PNG for person, SVG logo for entity).",
      control: "boolean",
    },
  },
  args: {
    name: "Maya Chen",
    size: "md",
    type: "person",
    color: "info",
    tooltip: true,
    image: false,
  },
};

export default meta;
type Story = StoryObj<typeof AvatarPlayground>;

export const Default: Story = {};

export const Entity: Story = {
  args: { type: "entity", name: "Acme Corp" },
};

export const WithImage: Story = {
  args: { image: true },
};

export const EntityWithLogo: Story = {
  args: { type: "entity", name: "Acme Corp", image: true },
};

export const BrokenImage: Story = {
  name: "Broken image (falls back to initial)",
  render: (args) => (
    <Avatar name={args.name} size={args.size} type={args.type} color={args.color} tooltip={args.tooltip} src="/this-image-does-not-exist.jpg" />
  ),
};

export const ExplicitInitials: Story = {
  args: { name: undefined, initials: "Z" },
};

export const TooltipDisabled: Story = {
  name: "tooltip={false}",
  args: { tooltip: false },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <AvatarPlayground key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      {(["info", "positive", "notice", "negative", "neutral", "alt-negative"] as const).map((color) => (
        <AvatarPlayground key={color} {...args} color={color} />
      ))}
    </div>
  ),
};
