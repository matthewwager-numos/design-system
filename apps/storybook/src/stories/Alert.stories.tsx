import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert, Button } from "@numosai/ui";
import type { AlertPosition, AlertStatus } from "@numosai/ui";

type DismissMode = "manual" | "auto";

interface AlertPlaygroundArgs {
  status: AlertStatus;
  position: AlertPosition;
  title: string;
  description: string;
  dismissible: boolean;
  dismissMode: DismissMode;
  autoDismissDelay: number;
}

/**
 * Alert doesn't manage its own presence (see the docs), so there's no single
 * prop that maps 1:1 to a "show it" control — this wrapper is what
 * `meta.component` points at, so Controls can drive a live demo: it owns the
 * shown/hidden state and translates `dismissMode` + `autoDismissDelay` into
 * the one real prop Alert takes (`autoDismissDelay`, or undefined for manual).
 */
function AlertPlayground({ status, position, title, description, dismissible, dismissMode, autoDismissDelay }: AlertPlaygroundArgs) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <Button variant="secondary" onClick={() => setShown(true)}>
        Show alert
      </Button>
      {shown ? (
        <Alert
          status={status}
          title={title}
          description={description}
          dismissible={dismissible}
          position={position}
          autoDismissDelay={dismissMode === "auto" ? autoDismissDelay : undefined}
          onDismiss={() => setShown(false)}
        />
      ) : null}
    </div>
  );
}

const meta: Meta<typeof AlertPlayground> = {
  title: "Components/Alert",
  component: AlertPlayground,
  // No "autodocs" tag — Alert.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
  argTypes: {
    status: {
      control: "select",
      options: ["neutral", "positive", "negative", "notice", "info"],
    },
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
    },
    dismissMode: {
      name: "Dismiss",
      description: "Manual requires the close button; auto dismisses itself after the delay below.",
      control: "radio",
      options: ["manual", "auto"],
    },
    autoDismissDelay: {
      name: "Auto-dismiss delay (ms)",
      control: { type: "number", min: 500, step: 500 },
      if: { arg: "dismissMode", eq: "auto" },
    },
    title: { control: "text" },
    description: { control: "text" },
    dismissible: { control: "boolean" },
  },
  args: {
    status: "positive",
    position: "bottom-center",
    dismissMode: "manual",
    autoDismissDelay: 3000,
    title: "Changes saved",
    description: "Click × to dismiss.",
    dismissible: true,
  },
};

export default meta;
type Story = StoryObj<typeof AlertPlayground>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    const statuses: AlertStatus[] = ["neutral", "positive", "negative", "notice", "info"];
    return (
      <div>
        <Button variant="secondary" size="sm" onClick={() => setCount((n) => n + 1)}>
          Show all statuses
        </Button>
        {count > 0 &&
          statuses.map((status) => (
            <Alert
              key={`${status}-${count}`}
              status={status}
              title={status}
              description="Same viewport, stacked."
              position="bottom-right"
              autoDismissDelay={5000}
            />
          ))}
      </div>
    );
  },
};

export const AllPositions: Story = {
  render: () => {
    const positions: AlertPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)", width: "28rem" }}>
        {positions.map((position) => (
          <PositionDemoButton key={position} position={position} />
        ))}
      </div>
    );
  },
};

function PositionDemoButton({ position }: { position: AlertPosition }) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setShown(true)}>
        {position}
      </Button>
      {shown ? (
        <Alert
          status="info"
          title={position}
          description="Slides in from the nearest edge."
          position={position}
          autoDismissDelay={2500}
          onDismiss={() => setShown(false)}
        />
      ) : null}
    </>
  );
}
