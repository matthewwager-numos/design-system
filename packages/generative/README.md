# @numosai/generative

Generative SVG art — pure functions that return SVG path data. Framework-agnostic; use them from React, vanilla JS, Node scripts, or copy/paste the output into Figma.

## Example

```ts
import { blob } from "@numosai/generative";

const { d, viewBox } = blob({ points: 6, randomness: 0.35, seed: 42 });
// → <svg viewBox={viewBox}><path d={d} fill="var(--color-primary)" /></svg>
```

## What goes in here

Anything that takes parameters and returns SVG. Patterns, blobs, abstract shapes, flow fields, noise textures, etc. Keep the surface area pure: no DOM access, no React, no side effects. That keeps these tools reusable from a Node script that generates exports as much as from a React playground.
