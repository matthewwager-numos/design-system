import type { Preview } from "@storybook/react";

// Load tokens once, globally — every story gets them.
import "@numosai/ui/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "var(--color-bg)" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "oklch(15% 0.01 270)" },
      ],
    },
    layout: "centered",
  },
};

export default preview;
