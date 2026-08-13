import { useContext } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Checkbox, CheckboxGroup } from "../Checkbox";
import { Radio, RadioGroup } from "../Radio";
import { SegmentedControl, SegmentedControlOption } from "../SegmentedControl";
import { Select } from "../Select";
import { Slider } from "../Slider";
import { Textarea } from "../Textarea";
import { TextInput } from "../TextInput";
import { Toggle } from "../Toggle";
import { SettingsCardContext } from "../SettingsCard/SettingsCardContext";
import "./Setting.css";

export type SettingType = "text" | "textarea" | "select" | "radio" | "checkbox" | "slider" | "toggle" | "segmentedControl";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingProps {
  label: ReactNode;
  /** Defaults to `"text"`. See the type-specific props below for what each one needs. */
  type?: SettingType;
  /**
   * Read/edit mode. Omit to inherit whichever mode `<SettingsCard>` is
   * currently in (this is how every `<Setting>` in a card switches at
   * once without threading the prop through each one by hand) — only
   * needed explicitly when using `<Setting>` on its own, outside a card.
   */
  edit?: boolean;
  /** Form field name, used in edit mode so `<SettingsCard>`'s Save collects it via `FormData`. */
  name?: string;
  /** `text`/`textarea`/`select`/`radio`/`segmentedControl` — the current value. */
  value?: string;
  /** `checkbox` only — the current selected values (plural, since checkboxes are multi-select). */
  values?: string[];
  /** `toggle` only. */
  checked?: boolean;
  /** `select`/`radio`/`checkbox`/`segmentedControl` — the full set of choices. */
  options?: SettingOption[];
  /** `text`/`textarea` only. */
  placeholder?: string;
  /** `slider` only. Defaults to 0/100/1. */
  min?: number;
  max?: number;
  step?: number;
  /** `slider` only — formats the read-mode value and the slider's own label. Defaults to `${value}%`. */
  formatValue?: (value: number) => string;
  className?: string;
}

const defaultFormatValue = (value: number) => `${value}%`;

function optionLabel(options: SettingOption[] | undefined, value: string | undefined): string {
  return options?.find((option) => option.value === value)?.label ?? "—";
}

/**
 * One row of a settings form: a label, and either a read-only value or a
 * real editable field, depending on `edit` — matches Figma's Setting
 * exactly across all 8 `type`s. Every edit-mode field is a real component
 * this library already ships (`<TextInput>`, `<Select>`, `<RadioGroup>`,
 * etc.) at the confirmed `"md"` size, not a reimplementation — `<Setting>`
 * only supplies the label (these components' own `label` prop goes
 * unused here) and switches between read/edit.
 *
 * Read-mode formatting per type isn't arbitrary: it's what Figma's own
 * examples show — `select`/`radio`/`segmentedControl` show the chosen
 * option's label, `checkbox` shows every checked option's label joined
 * with ", ", `slider` shows a formatted value (`${value}%` by default,
 * matching `<Slider>`'s own default), and `toggle` shows "On"/"Off".
 */
export function Setting({
  label,
  type = "text",
  edit: editProp,
  name,
  value = "",
  values = [],
  checked = false,
  options = [],
  placeholder,
  min = 0,
  max = 100,
  step = 1,
  formatValue = defaultFormatValue,
  className,
}: SettingProps) {
  const cardContext = useContext(SettingsCardContext);
  const edit = editProp ?? cardContext?.editing ?? false;

  let readValue: ReactNode;
  switch (type) {
    case "select":
    case "radio":
    case "segmentedControl":
      readValue = optionLabel(options, value);
      break;
    case "checkbox":
      readValue = options.filter((option) => values.includes(option.value)).map((option) => option.label).join(", ") || "—";
      break;
    case "slider":
      readValue = formatValue(Number(value) || 0);
      break;
    case "toggle":
      readValue = checked ? "On" : "Off";
      break;
    default:
      readValue = value || "—";
  }

  return (
    <div className={clsx("ds-setting", className)}>
      <span className="ds-setting__label">{label}</span>
      <div className="ds-setting__value">
        {!edit && <span className="ds-setting__read">{readValue}</span>}

        {edit && type === "text" && <TextInput size="md" name={name} defaultValue={value} placeholder={placeholder} />}

        {edit && type === "textarea" && <Textarea size="md" name={name} defaultValue={value} placeholder={placeholder} />}

        {edit && type === "select" && <Select size="md" name={name} defaultValue={value} options={options} />}

        {edit && type === "radio" && (
          <RadioGroup name={name} defaultValue={value}>
            {options.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
        )}

        {edit && type === "checkbox" && (
          <CheckboxGroup>
            {options.map((option) => (
              <Checkbox key={option.value} name={name} value={option.value} label={option.label} defaultChecked={values.includes(option.value)} />
            ))}
          </CheckboxGroup>
        )}

        {edit && type === "slider" && (
          <Slider size="md" name={name} min={min} max={max} step={step} defaultValue={Number(value) || 0} formatValue={formatValue} />
        )}

        {edit && type === "toggle" && <Toggle name={name} defaultChecked={checked} />}

        {edit && type === "segmentedControl" && (
          <SegmentedControl name={name} defaultValue={value}>
            {options.map((option) => (
              <SegmentedControlOption key={option.value} value={option.value}>
                {option.label}
              </SegmentedControlOption>
            ))}
          </SegmentedControl>
        )}
      </div>
    </div>
  );
}
