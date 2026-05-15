# design-system

A monorepo containing a React component library mirroring our Figma design system, plus a suite of vector-art and animation tools.

## Layout

```
apps/
  storybook/     Documentation site for everything (components + tools)
  playgrounds/   Interactive knob-tweaking apps for generative tools

packages/
  tokens/        Design tokens (CSS variables + TS exports) — synced from Figma
  ui/            React component library (Tailwind v4 + tokens)
  generative/    Generative SVG art utilities
  transforms/    SVG transformations (recolor, distort, etc.)
  motion/        Animation utilities & React components
```

## Quick start

```bash
# One-time: install Node 20 and pnpm
brew install node pnpm

# Install all workspace dependencies
pnpm install

# Start Storybook (component + tool docs)
pnpm storybook

# Start the playgrounds app
pnpm playgrounds

# Build every package
pnpm build
```

See `QUICKSTART.md` for the full setup walkthrough.

## How the pieces fit

- **`tokens`** is the source of truth for color, spacing, type, radii. Everything else reads from it via CSS variables.
- **`ui`** components use Tailwind utilities plus token CSS variables. No hard-coded colors.
- **`generative`**, **`transforms`**, **`motion`** are framework-agnostic where possible. `motion` ships React components; the other two return plain SVG strings / paths.
- **`storybook`** consumes every package and renders the docs site.
- **`playgrounds`** is a Vite app for live-tweaking the generative tools (Leva sliders).

## Conventions

- Every package's public API lives in `src/index.ts`. Nothing else is exported.
- Components live one-per-folder: `src/Button/Button.tsx`, `src/Button/index.ts`.
- Stories live in `apps/storybook/src/stories/`, named `<Component>.stories.tsx` + optional `<Component>.mdx` for prose docs.
