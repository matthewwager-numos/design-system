import { createContext } from "react";

export interface CheckboxGroupContextValue {
  /** Kept as a plain `"md" | "lg"` literal, not imported from `./Checkbox` — `Checkbox.tsx` imports this context, so importing its type back here would be circular. */
  size: "md" | "lg";
}

/** Unlike `RadioGroupContext`, this only carries `size` — a bare `<Checkbox>` already works standalone (native `checked`/`onChange`), so there's no selection state to share, just the group-level size cascade. */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);
