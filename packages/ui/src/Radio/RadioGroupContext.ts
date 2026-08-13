import { createContext, useContext } from "react";

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** Unlike `useTabsContext`, this doesn't throw when missing — a bare `<Radio>` works standalone (native `checked`/`onChange`), a group is opt-in. */
export function useRadioGroupContext(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
