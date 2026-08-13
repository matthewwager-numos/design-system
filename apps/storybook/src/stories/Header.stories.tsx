import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { History } from "lucide-react";
import { AppIcon, Button, Header, Tab, TabList, Tabs } from "@numosai/ui";
import type { HeaderVariant } from "@numosai/ui";

// Storybook-only example content — a real <Tabs> tree (TabList/Tab need a
// <Tabs> ancestor for their context) and a small icon-button action, exactly
// what Header's `subNav`/`actions` slots are meant to hold in real usage.
function ExampleSubNav() {
  return (
    <Tabs defaultValue="overview">
      <TabList>
        <Tab value="overview">Overview</Tab>
        <Tab value="entries">Entries</Tab>
        <Tab value="attachments">Attachments</Tab>
        <Tab value="history">History</Tab>
      </TabList>
    </Tabs>
  );
}

function ExampleAction() {
  return (
    <button
      type="button"
      aria-label="View history"
      style={{ display: "flex", border: "none", background: "none", borderRadius: "var(--radius-full)", padding: "var(--space-2)", color: "var(--content-subtle)", cursor: "pointer" }}
    >
      <History size={16} />
    </button>
  );
}

interface HeaderPlaygroundArgs {
  variant: HeaderVariant;
  title: string;
  /** Storybook-only — toggles the `<Tabs>` example that fills `subNav` in real usage. `subNav` itself is a ReactNode prop; omit it entirely for no sub-nav row at all. */
  subNav: boolean;
  /** Storybook-only — toggles the small trailing action example that fills `actions`. */
  actions: boolean;
}

function HeaderPlayground({ variant, title, subNav, actions }: HeaderPlaygroundArgs) {
  return (
    <Header
      variant={variant}
      icon={variant === "app" ? <AppIcon app="tasks" /> : undefined}
      title={title}
      onClose={() => {}}
      subNav={subNav ? <ExampleSubNav /> : undefined}
      actions={actions ? <ExampleAction /> : undefined}
    />
  );
}

const meta: Meta<typeof HeaderPlayground> = {
  title: "Components/Header",
  component: HeaderPlayground,
  // No "autodocs" tag — Header.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["app", "modal"] },
    title: { control: "text" },
    subNav: { control: "boolean" },
    actions: { control: "boolean" },
  },
  args: {
    variant: "app",
    title: "Accruals",
    subNav: true,
    actions: true,
  },
};

export default meta;
type Story = StoryObj<typeof HeaderPlayground>;

export const Default: Story = {};

export const Drawer: Story = {
  args: { variant: "modal", title: "Edit accrual" },
};

export const TitleOnly: Story = {
  name: "Title only (no sub-nav)",
  args: { title: "Reports", subNav: false, actions: false },
};

export const InteractiveClose: Story = {
  name: "Closing the drawer",
  render: (args) => {
    function DrawerDemo() {
      const [open, setOpen] = useState(true);
      if (!open) {
        return <Button variant="secondary" onClick={() => setOpen(true)}>Reopen drawer</Button>;
      }
      return (
        <Header
          variant="modal"
          title={args.title}
          onClose={() => setOpen(false)}
          subNav={args.subNav ? <ExampleSubNav /> : undefined}
          actions={args.actions ? <ExampleAction /> : undefined}
        />
      );
    }
    return <DrawerDemo />;
  },
  args: { variant: "modal", title: "Edit accrual" },
};
