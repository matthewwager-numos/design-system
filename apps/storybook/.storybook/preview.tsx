import type { Decorator, Preview } from "@storybook/react";

// Load tokens once, globally — every story gets them.
import "@numosai/ui/styles.css";

// Every story renders twice, side by side: left half forced to light mode,
// right half forced to dark mode (via tokens.css's [data-theme] override),
// independent of the viewer's OS/browser color-scheme setting. Full-page
// templates (Navigation + Header + real page content, potentially
// multi-screen) opt out via `parameters.noThemeSplit` — splitting a whole
// page in half light/dark doesn't make sense the way it does for a single
// component, and a template needs the full canvas, not a padded, centered
// half of it.
const withThemeSplit: Decorator = (Story, context) => {
  if (context.parameters.noThemeSplit) {
    return <Story />;
  }
  return (
  <div style={{ display: "flex", width: "100%", minHeight: "12rem" }}>
    {(["light", "dark"] as const).map((theme, index) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: index === 0 ? "1px solid var(--border-base)" : undefined,
        }}
      >
        <div
          style={{
            font: "var(--type-paragraph-xs-medium)",
            letterSpacing: "var(--type-paragraph-xs-medium-tracking)",
            // Not --content-subtle — its contrast against --background-default
            // falls just short of WCAG AA at this size (confirmed by the new
            // Storybook Test Runner + axe a11y check: 4.12:1 vs the 4.5:1 this
            // small text needs), which isn't a real component issue, just this
            // decorator's own "LIGHT"/"DARK" caption failing the exact check
            // it's meant to help catch. --content-placeholder passes.
            color: "var(--content-base)",
            padding: "var(--space-2) var(--space-4) 0",
            background: "var(--background-default)",
            textTransform: "uppercase",
          }}
        >
          {theme}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-6)",
            background: "var(--background-default)",
            overflow: "auto",
          }}
        >
          <Story />
        </div>
      </div>
    ))}
  </div>
  );
};

const preview: Preview = {
  decorators: [withThemeSplit],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
};

export default preview;
