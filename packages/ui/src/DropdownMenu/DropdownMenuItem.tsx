import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { useDropdownMenuContext } from "./DropdownMenuContext";

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Matches Figma's "Active" state — a filled brand highlight, e.g. for the currently selected option. */
  active?: boolean;
  /** Close the menu when this item is clicked. Defaults to true. */
  closeOnSelect?: boolean;
}

/** One selectable row. Renders as a real <button role="menuitem"> inside an <li>. */
export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { leadingIcon, trailingIcon, active, closeOnSelect = true, className, children, onClick, disabled, ...rest },
  ref,
) {
  const { setOpen } = useDropdownMenuContext("DropdownMenuItem");

  return (
    <li role="none">
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={clsx("ds-dropdown-menu-item", active && "ds-dropdown-menu-item--active", className)}
        onClick={(event) => {
          onClick?.(event);
          if (closeOnSelect) setOpen(false);
        }}
        {...rest}
      >
        {leadingIcon ? <span className="ds-dropdown-menu-item__icon" aria-hidden>{leadingIcon}</span> : null}
        <span className="ds-dropdown-menu-item__label">{children}</span>
        {trailingIcon ? <span className="ds-dropdown-menu-item__icon" aria-hidden>{trailingIcon}</span> : null}
      </button>
    </li>
  );
});
