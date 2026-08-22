import { createContext, useContext } from "react";

export interface AccordionContextValue {
  exclusive: boolean;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

/** Doesn't throw when missing — a bare `<AccordionItem>` outside `<Accordion>` still works standalone (independent expand/collapse), same as `<Radio>` outside a `<RadioGroup>`. */
export function useAccordionContext(): AccordionContextValue | null {
  return useContext(AccordionContext);
}

/**
 * Each `<AccordionItem>`'s position among its siblings — assigned by
 * `<Accordion>` itself (see `Accordion.tsx`), never set directly. The only
 * thing this identifies an item by in `exclusive` mode; there's no public
 * `value` prop to keep the common case (a plain list of items, no shared
 * state) exactly as simple as it was before `exclusive` existed.
 */
export const AccordionItemIndexContext = createContext<number | null>(null);

export function useAccordionItemIndex(): number | null {
  return useContext(AccordionItemIndexContext);
}
