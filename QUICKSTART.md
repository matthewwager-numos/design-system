# Quickstart

Get the scaffold running on your Mac, then push it to GitHub.

## 1. Install the dev tools (one-time)

If you don't already have these:

```bash
# Homebrew first if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then:
brew install node pnpm git gh
```

Verify:

```bash
node -v     # should print v20.x or higher
pnpm -v     # should print 9.x or higher
git --version
gh --version
```

If you'll be using Claude Code:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

…then in VS Code install the **Claude Code** extension (publisher: Anthropic) from the Extensions marketplace.

## 2. Install workspace dependencies

```bash
cd ~/Documents/design-system
pnpm install
```

This pulls down React, Storybook, Vite, motion, Leva, Tailwind v4, everything. Expect a couple of minutes the first time.

## 3. Run Storybook

```bash
pnpm storybook
```

Opens `http://localhost:6006`. You should see:

- **Introduction** — overview page
- **Foundations / Tokens** — token swatches
- **Components / Button** — variants, sizes, props table, MDX doc
- **Illustration tools / Generative / Blob** — knob-driven blob
- **Illustration tools / Motion / FadeIn** — replay-able fade-in

## 4. Run the playgrounds app

In a separate terminal:

```bash
pnpm playgrounds
```

Opens `http://localhost:5173` with a Leva knob panel for the Blob tool. "Download SVG" exports the current shape.

## 5. Push to GitHub

```bash
cd ~/Documents/design-system

git init
git add .
git commit -m "Initial scaffold: monorepo, ui, tokens, generative, transforms, motion, storybook, playgrounds"

# Authenticate (one-time, opens browser for SSO):
gh auth login

# Create the repo and push:
gh repo create numosai/design-system --private --source=. --remote=origin --push
```

Replace `numosai` with your actual GitHub org slug if different. Use `--public` instead of `--private` if you want it public.

## 6. Open in VS Code

```bash
code .
```

Click the Claude Code spark icon in the sidebar. It now has full context on the repo and can read/edit files, run commands, and commit on your behalf.

## Day-to-day commands

```bash
pnpm storybook        # Component docs (port 6006)
pnpm playgrounds      # Interactive tool playground (port 5173)
pnpm build            # Build every package
pnpm lint             # Typecheck everything
turbo run build --filter=@numosai/ui   # Build just one package
```

## Adding things

- **New component** → `packages/ui/src/MyComponent/` + a story in `apps/storybook/src/stories/`
- **New generative tool** → a function in `packages/generative/src/` + a story
- **New transform** → a function in `packages/transforms/src/`
- **New motion component** → in `packages/motion/src/`
- **New playground** → `apps/playgrounds/src/playgrounds/MyToolPlayground.tsx` + register it in `App.tsx`

## Troubleshooting

**`pnpm install` fails on corporate proxy** → set `HTTPS_PROXY` env var, or ask IT for the registry URL and add it to `.npmrc` as `registry=...`.

**Storybook can't find a package** → run `pnpm install` from the repo root, not from inside a sub-package. The `workspace:*` references are resolved at the root.

**Tailwind classes don't apply in a component** → make sure the consuming app imports `@numosai/ui/styles.css` once at its entry. The current Button component is styled with vanilla CSS-with-tokens so it works regardless, but if you start using Tailwind utilities inside `packages/ui/src/...`, the importing app needs that stylesheet to be loaded.
