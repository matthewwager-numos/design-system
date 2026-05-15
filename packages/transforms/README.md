# @numosai/transforms

SVG transformations — take an SVG string, apply an effect, get an SVG string back.

## Example

```ts
import { recolor } from "@numosai/transforms";

const tinted = recolor(originalSvg, {
  map: { "#FF0000": "var(--color-primary)", "#0000FF": "var(--color-accent)" }
});
```

## What goes in here

Pure string-in, string-out (or string-in, path-in / path-out) transformations: recolor, displace, distort, stylize, simplify, jitter, etc. Keep them framework-agnostic.
