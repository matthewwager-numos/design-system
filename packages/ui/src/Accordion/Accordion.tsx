import { Children, isValidElement, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { AccordionContext, AccordionItemIndexContext, useAccordionContext, useAccordionItemIndex } from "./AccordionContext";
import "./Accordion.css";

export interface AccordionProps {
  /** `<AccordionItem>`s. */
  children: ReactNode;
  /**
   * When true, expanding one item collapses any other open item — only one
   * panel open at a time, the same "radio vs. checkbox" distinction
   * `<RadioGroup>`/`<CheckboxGroup>` already draw. Defaults to false: each
   * item expands/collapses independently, matching Figma's own Accordion
   * example (a plain stack of independently-collapsed rows, not a
   * single-open-at-a-time widget).
   *
   * Whichever item has `defaultExpanded` starts open (the first one, if
   * more than one sets it) — figured out once, up front, not via a mount-
   * order race. `expanded`/`onExpandedChange` on individual items are
   * ignored here: `exclusive` means there's one shared source of truth
   * instead of each item's own.
   */
  exclusive?: boolean;
  className?: string;
}

/**
 * A rounded, clipped group of `<AccordionItem>`s — matches Figma's Accordion
 * exactly (a `CollapsableRow` list, each with its own head/divider, clipped
 * into one rounded shape).
 */
export function Accordion({ children, exclusive = false, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    if (!exclusive) return null;
    let initial: number | null = null;
    Children.forEach(children, (child, index) => {
      if (initial === null && isValidElement(child) && (child.props as AccordionItemProps).defaultExpanded) {
        initial = index;
      }
    });
    return initial;
  });

  return (
    <AccordionContext.Provider value={{ exclusive, openIndex, setOpenIndex }}>
      <div className={clsx("ds-accordion", className)}>
        {Children.map(children, (child, index) => (
          <AccordionItemIndexContext.Provider value={index}>{child}</AccordionItemIndexContext.Provider>
        ))}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  /** The head's label — always visible, click/tap target that toggles the panel. */
  title: ReactNode;
  /** The panel's content — only rendered visibly while expanded. */
  children: ReactNode;
  /** Ignored inside an `exclusive` `<Accordion>` — see its own doc comment. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * One row: a `title` head (chevron + label) that toggles a `children` panel
 * below it. Confirmed from Figma: the collapsed panel isn't unmounted, it's
 * a 1px sliver — that's what still shows the divider between rows when
 * every item is collapsed, so this animates height rather than
 * conditionally rendering the panel.
 */
export function AccordionItem({ title, children, expanded: controlledExpanded, defaultExpanded = false, onExpandedChange, className }: AccordionItemProps) {
  const accordion = useAccordionContext();
  const index = useAccordionItemIndex();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);

  const grouped = Boolean(accordion?.exclusive) && index !== null;
  const expanded = grouped ? accordion!.openIndex === index : controlledExpanded ?? uncontrolledExpanded;

  function toggle() {
    if (grouped) {
      accordion!.setOpenIndex(accordion!.openIndex === index ? null : index);
      return;
    }
    const next = !expanded;
    setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  }

  return (
    <div className={clsx("ds-accordion-item", className)}>
      <button type="button" className="ds-accordion-item__head" onClick={toggle} aria-expanded={expanded}>
        <ChevronDown className="ds-accordion-item__chevron" size={16} aria-hidden />
        <span className="ds-accordion-item__title">{title}</span>
      </button>
      <div className="ds-accordion-item__panel-track" data-expanded={expanded}>
        <div className="ds-accordion-item__panel">
          <div className="ds-accordion-item__panel-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
