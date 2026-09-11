import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles, SearchX, Inbox } from "lucide-react";
import { Button, ButtonGroup, EmptyState } from "@numosai/ui";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  // No "autodocs" tag — EmptyState.mdx is this component's docs page.
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    icon: <Sparkles size={24} />,
    title: "Title",
    description: "Description description description description description",
  },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <EmptyState {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    actions: (
      <ButtonGroup orientation="vertical">
        <Button size="sm" variant="secondary">
          Button
        </Button>
        <Button size="sm" variant="primary">
          Button
        </Button>
      </ButtonGroup>
    ),
  },
};

export const WithoutActions: Story = {
  args: { actions: undefined },
};

export const WithoutIcon: Story = {
  args: { icon: undefined },
};

export const TitleOnly: Story = {
  args: { description: undefined, actions: undefined },
};

export const NoResults: Story = {
  args: {
    icon: <SearchX size={24} />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
    actions: undefined,
  },
};

export const NoItemsYet: Story = {
  args: {
    icon: <Inbox size={24} />,
    title: "No items yet",
    description: "Items you add will show up here.",
    actions: (
      <ButtonGroup orientation="vertical">
        <Button size="sm" variant="primary">
          Add item
        </Button>
      </ButtonGroup>
    ),
  },
};
