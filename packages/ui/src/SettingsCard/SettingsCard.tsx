import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Form, FormBody, FormFooter, FormHeader } from "../Form";
import { SettingsCardContext } from "./SettingsCardContext";
import "./SettingsCard.css";

export interface SettingsCardProps {
  title: ReactNode;
  description?: ReactNode;
  /** `<Setting>` rows — each one reads this card's edit/read mode from context, so none of them need `edit` passed by hand. */
  children: ReactNode;
  /** Controlled edit mode. Omit to let SettingsCard manage its own. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /**
   * Called on Save with the real `<form>`'s submit event, so
   * `new FormData(event.currentTarget)` collects every `<Setting>`'s
   * current edit-mode value in one read. SettingsCard doesn't read or
   * validate this itself — persisting it is the caller's job.
   */
  onSave?: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * A card of `<Setting>` rows that switches between a read-only summary and
 * a real editable form — matches Figma's SettingsCard exactly. Built
 * directly from `<Form>`/`<FormHeader>`/`<FormBody>`/`<FormFooter>`
 * (confirmed from Figma's own `data-name`s on this component, not just a
 * visual resemblance) — none of that chrome is reimplemented here.
 *
 * The header's action button is the same 24px pill icon button
 * `<FormHeader>`'s own `actions` slot already styles (`.ds-form-header__icon-button`)
 * — a pencil that enters edit mode, becoming an × that cancels back out of
 * it once editing. Cancel (the × or the footer's own Cancel button) simply
 * re-renders every `<Setting>` back to read mode: since each edit-mode
 * field is uncontrolled, unmounting it this way — rather than resetting
 * some tracked draft state — is what discards whatever was typed, for
 * free. Save submits the real `<form>` and calls `onSave` with it, then
 * returns to read mode.
 */
export function SettingsCard({
  title,
  description,
  children,
  editing: controlledEditing,
  defaultEditing = false,
  onEditingChange,
  onSave,
  onCancel,
  className,
}: SettingsCardProps) {
  const [uncontrolledEditing, setUncontrolledEditing] = useState(defaultEditing);
  const editing = controlledEditing ?? uncontrolledEditing;

  function setEditing(next: boolean) {
    setUncontrolledEditing(next);
    onEditingChange?.(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.(event);
    setEditing(false);
  }

  function handleCancel() {
    onCancel?.();
    setEditing(false);
  }

  return (
    <SettingsCardContext.Provider value={{ editing }}>
      <Form className={clsx("ds-settings-card", className)} onSubmit={handleSubmit}>
        <FormHeader
          actions={
            <button
              type="button"
              className="ds-form-header__icon-button"
              onClick={editing ? handleCancel : () => setEditing(true)}
              aria-label={editing ? "Cancel editing" : "Edit"}
            >
              {editing ? <X size={16} aria-hidden /> : <Pencil size={16} aria-hidden />}
            </button>
          }
        >
          {title}
        </FormHeader>

        <FormBody>
          {description && <p className="ds-settings-card__description">{description}</p>}
          {children}
        </FormBody>

        {editing && (
          <FormFooter>
            <ButtonGroup>
              <Button variant="secondary" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </ButtonGroup>
          </FormFooter>
        )}
      </Form>
    </SettingsCardContext.Provider>
  );
}
