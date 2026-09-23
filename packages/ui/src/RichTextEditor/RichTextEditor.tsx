import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Smile,
  Strikethrough,
  TriangleAlert,
  Underline,
  Undo2,
} from "lucide-react";
import { clsx } from "clsx";
import { FieldLabel } from "../FieldLabel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import "./RichTextEditor.css";

export type RichTextEditorSize = "sm" | "md" | "lg";
export type RichTextEditorStatus = "default" | "error" | "success";

interface FontFamilyOption {
  label: string;
  value: string;
}

// "Sans Serif" reuses the app's own body font token so switching back to it
// matches surrounding text exactly; Serif/Monospace are real stacks since
// there's no token for either in this system.
const DEFAULT_FONT_FAMILY: FontFamilyOption = { label: "Sans Serif", value: "var(--font-sans)" };
const FONT_FAMILIES: FontFamilyOption[] = [
  DEFAULT_FONT_FAMILY,
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace", value: "'SF Mono', ui-monospace, Menlo, monospace" },
];

const FONT_SIZES = [12, 14, 16, 18, 24, 32];

const EMOJI = ["😀", "😂", "😍", "👍", "🙌", "🎉", "❤️", "🔥", "✅", "⚠️", "👀", "🙏"];

export interface RichTextEditorProps {
  /** Field label, rendered above the field. Rendered as a `<span>` (not a real `<label>`) since a `contentEditable` div isn't a labelable element — associated via `aria-labelledby` instead of `htmlFor`. */
  label?: ReactNode;
  /** Only read by assistive tech when there's no visible `label` — same reasoning as `<IconButton>`'s required `aria-label`, just optional here since a visible label is the common case. */
  "aria-label"?: string;
  /** Helper or validation text, rendered below the field. */
  helpText?: ReactNode;
  /** Validation state. Error/success also style the help text and its icon. */
  status?: RichTextEditorStatus;
  size?: RichTextEditorSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /**
   * Fixed text rendered immediately before the value — e.g. a currency
   * symbol. Unlike `leadingIcon`, this is real content (not `aria-hidden`),
   * so a screen reader reads it as part of the field. Not shown by default.
   */
  prefix?: ReactNode;
  /** Fixed text rendered immediately after the value. Same real-content reasoning as `prefix`. */
  suffix?: ReactNode;
  placeholder?: string;
  /**
   * Controlled HTML content. Only synced into the editor while it isn't
   * focused — otherwise every keystroke's own re-render would echo the
   * content back in and fight the caret, the same problem any controlled
   * `contentEditable` has.
   */
  value?: string;
  /** Initial HTML content for uncontrolled use — set once, on mount. */
  defaultValue?: string;
  /** Fires on every input with the editor's current `innerHTML`. */
  onChange?: (html: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}

// Every toolbar control needs `onMouseDown` prevented, not just `onClick`
// wired up — a plain button click first fires `mousedown`, which moves focus
// (and the caret) off the editor before `click` ever runs. Preventing the
// default on `mousedown` keeps focus (and the current selection) right
// where a formatting command needs it.
function ToolbarButton({ icon, label, onClick, pressed, disabled }: ToolbarButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        className="ds-rich-text-editor__tool"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={pressed}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

/**
 * A labeled rich text field — matches Figma's "Input / RichTextEditor"
 * (S/M/L) exactly: same Field padding/radius/type tokens as `<TextInput>`/
 * `<Textarea>` at every size (confirmed against Figma directly, same as
 * `<Textarea>`'s own comment), stacked with an embedded formatting toolbar
 * instead of a single-row control. Figma's static export shows the Field
 * with a permanent blue focus ring — implemented here as real
 * `:focus-within`, not a hardcoded border, same reasoning as every other
 * input in this family.
 *
 * Built on a real `contentEditable` div (not a library) plus
 * `document.execCommand` — deprecated, but still universally supported for
 * exactly this kind of inline formatting, and consistent with this
 * codebase's own practice of hand-building interactive behavior (Modal,
 * DropdownMenu, Tabs) rather than reaching for a dependency.
 *
 * The toolbar's icon-to-action mapping (font family/size, the alignment/
 * list cluster, the "more" overflow) is inferred from Figma's screenshot and
 * layer names, not confirmed icon-by-icon — flag any mismatch against the
 * real design intent.
 *
 * Framed by design as the likely basis for a future "prompt input" (a chat
 * composer with its own send/attach controls embedded the same way) — this
 * component's Field-wraps-content-plus-toolbar shape is exactly that
 * pattern already; a prompt input would swap the toolbar's contents, not
 * its structure.
 */
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor(
  {
    label,
    "aria-label": ariaLabel,
    helpText,
    status = "default",
    size = "lg",
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled = false,
    id,
    className,
  },
  forwardedRef,
) {
  const labelId = `${id ?? "rich-text-editor"}-label`;
  const contentRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const isControlled = value !== undefined;

  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [fontFamily, setFontFamily] = useState<FontFamilyOption>(DEFAULT_FONT_FAMILY);
  const [selectedFontSize, setSelectedFontSize] = useState(size === "lg" ? 16 : size === "md" ? 14 : 12);

  useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement, []);

  // Sets the initial DOM content once (uncontrolled) or keeps it in sync
  // with `value` (controlled) — but never while the editor itself has
  // focus, so a controlled consumer re-rendering mid-keystroke can't clobber
  // the caret. A layout effect (not a plain effect) so this lands before
  // paint, avoiding a flash of empty content on mount.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (!isControlled) {
      if (!initializedRef.current) {
        el.innerHTML = defaultValue ?? "";
        initializedRef.current = true;
      }
      return;
    }
    if (document.activeElement === el) return;
    const next = value ?? "";
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value, isControlled, defaultValue]);

  function handleInput() {
    const el = contentRef.current;
    if (!el) return;
    // A contentEditable div left completely empty by the user often keeps a
    // stray <br>, which fails the :empty CSS selector the placeholder
    // relies on — normalize it away so the placeholder actually reappears.
    if (el.innerHTML === "<br>") el.innerHTML = "";
    onChange?.(el.innerHTML);
  }

  function isInsideTag(tagName: string): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    let node: Node | null = selection.getRangeAt(0).startContainer;
    while (node && node !== contentRef.current) {
      if (node instanceof HTMLElement && node.tagName === tagName) return true;
      node = node.parentNode;
    }
    return false;
  }

  function updateActiveFormats() {
    const formats = new Set<string>();
    (["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"] as const).forEach((command) => {
      try {
        if (document.queryCommandState(command)) formats.add(command);
      } catch {
        // Unsupported in some browsers for some commands — just skip it.
      }
    });
    if (isInsideTag("BLOCKQUOTE")) formats.add("blockquote");
    setActiveFormats(formats);
  }

  function exec(command: string, commandValue?: string) {
    if (disabled) return;
    contentRef.current?.focus();
    document.execCommand(command, false, commandValue);
    handleInput();
    updateActiveFormats();
  }

  function toggleQuote() {
    exec("formatBlock", isInsideTag("BLOCKQUOTE") ? "P" : "BLOCKQUOTE");
  }

  // Opening a dropdown (font family/size, emoji, "more") moves focus into
  // its own menu, which loses the editor's current selection before its own
  // item's onClick ever runs — save it on open, restore it right before
  // applying the command, so the format still lands where the user actually
  // selected instead of wherever the caret happens to end up.
  function saveSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    const range = savedRangeRef.current;
    if (range) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  useEffect(() => {
    function handleSelectionChange() {
      if (document.activeElement === contentRef.current) updateActiveFormats();
    }
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFontFamily(option: FontFamilyOption) {
    if (disabled) return;
    restoreSelection();
    setFontFamily(option);
    document.execCommand("fontName", false, option.value);
    handleInput();
  }

  // execCommand("fontSize") only accepts the legacy 1–7 scale and emits a
  // <font size="7"> element — "7" is just a marker so the real elements this
  // selection just created can be found and swapped for a <span> with the
  // exact pixel size actually requested.
  function applyFontSize(px: number) {
    if (disabled) return;
    restoreSelection();
    setSelectedFontSize(px);
    document.execCommand("fontSize", false, "7");
    contentRef.current?.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.append(...Array.from(font.childNodes));
      font.replaceWith(span);
    });
    handleInput();
  }

  function insertEmoji(emoji: string) {
    if (disabled) return;
    restoreSelection();
    document.execCommand("insertText", false, emoji);
    handleInput();
  }

  function applyMoreCommand(command: string) {
    if (disabled) return;
    restoreSelection();
    document.execCommand(command);
    handleInput();
    updateActiveFormats();
  }

  return (
    <div className={clsx("ds-rich-text-editor", `ds-rich-text-editor--${size}`, className)}>
      {label ? (
        <FieldLabel as="span" size={size} id={labelId} className="ds-rich-text-editor__label">
          {label}
        </FieldLabel>
      ) : null}

      <div
        className={clsx(
          "ds-rich-text-editor__field",
          `ds-rich-text-editor__field--${status}`,
          disabled && "ds-rich-text-editor__field--disabled",
        )}
      >
        <div className="ds-rich-text-editor__body">
          {leadingIcon ? (
            <span className="ds-rich-text-editor__icon" aria-hidden>
              {leadingIcon}
            </span>
          ) : null}
          {prefix ? <span className="ds-rich-text-editor__affix">{prefix}</span> : null}
          <div
            ref={contentRef}
            id={id}
            className="ds-rich-text-editor__content"
            contentEditable={!disabled}
            role="textbox"
            aria-multiline="true"
            aria-labelledby={label ? labelId : undefined}
            aria-label={!label ? ariaLabel : undefined}
            aria-invalid={status === "error" || undefined}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            data-placeholder={placeholder}
            onInput={handleInput}
            onFocus={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            suppressContentEditableWarning
          />
          {suffix ? <span className="ds-rich-text-editor__affix">{suffix}</span> : null}
          {trailingIcon ? (
            <span className="ds-rich-text-editor__icon" aria-hidden>
              {trailingIcon}
            </span>
          ) : null}
        </div>

        <div className="ds-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
          <div className="ds-rich-text-editor__toolbar-group">
            <ToolbarButton icon={<Undo2 aria-hidden />} label="Undo" onClick={() => exec("undo")} disabled={disabled} />
            <ToolbarButton icon={<Redo2 aria-hidden />} label="Redo" onClick={() => exec("redo")} disabled={disabled} />
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <DropdownMenu size="sm" onOpenChange={(open) => open && saveSelection()}>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="ds-rich-text-editor__tool-select"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={disabled}
                  aria-label="Font family"
                >
                  <span className="ds-rich-text-editor__tool-select-label">{fontFamily.label}</span>
                  <ChevronDown aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {FONT_FAMILIES.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    active={option.label === fontFamily.label}
                    style={{ fontFamily: option.value }}
                    onClick={() => applyFontFamily(option)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <DropdownMenu size="sm" onOpenChange={(open) => open && saveSelection()}>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="ds-rich-text-editor__tool-select"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={disabled}
                  aria-label="Font size"
                >
                  <span>{selectedFontSize}</span>
                  <ChevronDown aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {FONT_SIZES.map((px) => (
                  <DropdownMenuItem key={px} active={px === selectedFontSize} onClick={() => applyFontSize(px)}>
                    {px}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <ToolbarButton icon={<Bold aria-hidden />} label="Bold" pressed={activeFormats.has("bold")} onClick={() => exec("bold")} disabled={disabled} />
            <ToolbarButton icon={<Italic aria-hidden />} label="Italic" pressed={activeFormats.has("italic")} onClick={() => exec("italic")} disabled={disabled} />
            <ToolbarButton
              icon={<Underline aria-hidden />}
              label="Underline"
              pressed={activeFormats.has("underline")}
              onClick={() => exec("underline")}
              disabled={disabled}
            />
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <DropdownMenu size="sm" onOpenChange={(open) => open && saveSelection()}>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="ds-rich-text-editor__tool"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={disabled}
                  aria-label="Insert emoji"
                >
                  <Smile aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ds-rich-text-editor__emoji-menu">
                {EMOJI.map((emoji) => (
                  <DropdownMenuItem key={emoji} onClick={() => insertEmoji(emoji)}>
                    {emoji}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <ToolbarButton
              icon={<List aria-hidden />}
              label="Bulleted list"
              pressed={activeFormats.has("insertUnorderedList")}
              onClick={() => exec("insertUnorderedList")}
              disabled={disabled}
            />
            <ToolbarButton
              icon={<ListOrdered aria-hidden />}
              label="Numbered list"
              pressed={activeFormats.has("insertOrderedList")}
              onClick={() => exec("insertOrderedList")}
              disabled={disabled}
            />
            <ToolbarButton icon={<Quote aria-hidden />} label="Quote" pressed={activeFormats.has("blockquote")} onClick={toggleQuote} disabled={disabled} />
          </div>

          <div className="ds-rich-text-editor__toolbar-group">
            <DropdownMenu size="sm" onOpenChange={(open) => open && saveSelection()}>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="ds-rich-text-editor__tool"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={disabled}
                  aria-label="More formatting"
                >
                  <ChevronDown aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem leadingIcon={<Strikethrough size={16} aria-hidden />} onClick={() => applyMoreCommand("strikeThrough")}>
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuItem leadingIcon={<RemoveFormatting size={16} aria-hidden />} onClick={() => applyMoreCommand("removeFormat")}>
                  Clear formatting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {helpText ? (
        <div className={clsx("ds-rich-text-editor__help", `ds-rich-text-editor__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}
    </div>
  );
});
