# @numosai/ui

React component library. Mirrors the Figma design system 1:1.

## Usage

```tsx
import { Button } from "@numosai/ui";
import "@numosai/ui/styles.css";

export default function Demo() {
  return <Button variant="primary" size="md">Save changes</Button>;
}
```

## Adding a new component

1. Create `src/MyComponent/MyComponent.tsx`, `MyComponent.css`, and `index.ts`.
2. Re-export from `src/index.ts`.
3. Add a story at `apps/storybook/src/stories/MyComponent.stories.tsx`.
4. (Optional) Add an MDX doc at `apps/storybook/src/stories/MyComponent.mdx` for implementation guidance.

## Rules

- **Never hard-code colors, spacing, radii, type sizes, or durations.** Use `var(--color-*)`, `var(--space-*)`, etc. — the tokens come from `@numosai/tokens`.
- **Forward refs.** Every component should `forwardRef` so consumers can attach refs.
- **Spread the rest of the HTML props.** `...rest` onto the root element so consumers can add `aria-*`, `data-*`, `onClick`, etc.
- **Document props with JSDoc comments.** Storybook autodocs pulls the docstrings into the props table.
