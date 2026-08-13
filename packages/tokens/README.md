# @numosai/tokens

Design tokens — the single source of truth for color, spacing, typography, radius, motion, and elevation.

## Usage

### In CSS (preferred)

```css
@import "@numosai/tokens/tokens.css";

.my-button {
  background: var(--button-primary-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
}
```

### In TypeScript

```ts
import { tokens } from "@numosai/tokens";

<div style={{ background: tokens.color.button.primaryDefault }} />
```

## Future: sync from Figma

This package will eventually be auto-generated from Figma via [Tokens Studio](https://tokens.studio) + [Style Dictionary](https://amzn.github.io/style-dictionary/). The generator outputs `tokens.css` and `index.ts` — same file shape as today, no consumer changes required.
