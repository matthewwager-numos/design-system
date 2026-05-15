# @numosai/motion

Animation utilities & React components, built on [motion](https://motion.dev) (formerly Framer Motion).

## Example

```tsx
import { FadeIn } from "@numosai/motion";

<FadeIn delay={0.1}>
  <h1>Hello, world</h1>
</FadeIn>
```

## Rules

- **Always respect `prefers-reduced-motion`.** Use the exported `useReducedMotion()` hook or motion's built-in support. Users who've opted out get instant transitions (no movement, opacity-only).
- **Tokens for timing.** Default durations and easings should match the values in `@numosai/tokens` (`--duration-*`, `--ease-out`).
