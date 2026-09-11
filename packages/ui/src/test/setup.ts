import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// RTL's own auto-cleanup-after-each-test registration didn't kick in for
// this vitest setup (every test after the first one in a multi-render file
// was finding duplicate elements from previous tests' un-unmounted DOM) —
// registering it explicitly instead of relying on the implicit detection.
afterEach(() => {
  cleanup();
});

// jsdom implements neither of these — several real components use them
// (ResizeObserver: Carousel/Wizard/useMeasuredHeightVar; matchMedia:
// useCountUp's reduced-motion check), so rendering them under RTL without a
// stand-in throws "X is not a constructor"/"X is not a function" before the
// test itself ever runs. Both are minimal, inert stand-ins — no test in this
// suite currently depends on either actually firing a callback; a test that
// does should override `window.matchMedia`/`ResizeObserver` itself for that
// one case rather than relying on this global default doing more than it does.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= MockResizeObserver as unknown as typeof ResizeObserver;

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
