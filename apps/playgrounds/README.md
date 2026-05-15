# @numosai/playgrounds

Interactive Vite app for tweaking generative tools live. Each playground is a single React component under `src/playgrounds/`, using [Leva](https://github.com/pmndrs/leva) for the knob panel.

## Adding a new playground

1. Create `src/playgrounds/MyToolPlayground.tsx`.
2. Use `useControls("My Tool", { ... })` to expose parameters.
3. Render the result. Include "Download" / "Copy" actions where it makes sense.
4. Add an entry in `src/App.tsx`'s `PLAYGROUNDS` array.

## Run

```bash
pnpm playgrounds   # from repo root
# or
pnpm --filter @numosai/playgrounds dev
```
