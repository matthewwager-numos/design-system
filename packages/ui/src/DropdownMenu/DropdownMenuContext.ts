import { createContext, useContext } from "react";
import type { RefObject } from "react";

export type DropdownMenuSize = "sm" | "md" | "lg";

export interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement>;
  contentId: string;
  /**
   * Set once on the root `<DropdownMenu size="...">` and inherited by every
   * `<DropdownMenuContent>`/`<DropdownMenuPanel>` inside it — so a
   * trigger's own size and its opened panel's size can't drift out of
   * sync the way two independently-set props could (one of them forgotten
   * on a future edit). A panel can still override it explicitly for the
   * rare case that genuinely needs to.
   */
  size: DropdownMenuSize;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <DropdownMenu>`);
  }
  return ctx;
}
