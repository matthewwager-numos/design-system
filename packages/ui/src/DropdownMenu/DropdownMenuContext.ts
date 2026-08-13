import { createContext, useContext } from "react";
import type { RefObject } from "react";

export interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement>;
  contentId: string;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <DropdownMenu>`);
  }
  return ctx;
}
