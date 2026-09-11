import type { TestRunnerConfig } from "@storybook/test-runner";
import { checkA11y, injectAxe } from "axe-playwright";

// Every story already renders through `withThemeSplit` (see preview.tsx) —
// #storybook-root covers both the light and dark halves in one canvas, so a
// single checkA11y call here catches contrast/labeling issues in either
// theme, not just whichever one happens to be visible by default.
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: false },
      axeOptions: {
        // Storybook's own docs/manager chrome sits outside #storybook-root
        // already, so this is scoped to actual component markup — no
        // separate exclusion list needed for now. Extend this exact spot
        // (not the shared .stylelintrc.json ignore pattern, a different
        // concern) with a documented reason if a specific story turns out
        // to have a real, unfixable false positive.
      },
    });
  },
};

export default config;
