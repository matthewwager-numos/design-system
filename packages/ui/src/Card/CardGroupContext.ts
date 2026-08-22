import { createContext, useContext } from "react";

export type CardGroupType = "single" | "multiple";

export interface CardGroupContextValue {
  type: CardGroupType;
  /** Only meaningful when `type` is `"single"` — `"multiple"` has no shared value to coordinate (see `CardGroup.tsx`). */
  value: string | undefined;
  onSelect: (value: string) => void;
}

export const CardGroupContext = createContext<CardGroupContextValue | null>(null);

/** Doesn't throw when missing — a bare `<Card>` outside `<CardGroup>` still works standalone (its own `selected`/`onClick`), same as `<Radio>` outside a `<RadioGroup>`. */
export function useCardGroupContext(): CardGroupContextValue | null {
  return useContext(CardGroupContext);
}
