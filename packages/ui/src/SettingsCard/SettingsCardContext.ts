import { createContext } from "react";

export interface SettingsCardContextValue {
  editing: boolean;
}

/**
 * Not required the way `NavigationContext` is — `<Setting>` works fine
 * standalone (Figma's own "Setting" page demonstrates it outside any
 * card), it just falls back to its own `edit` prop when there's no
 * provider, rather than throwing.
 */
export const SettingsCardContext = createContext<SettingsCardContextValue | null>(null);
