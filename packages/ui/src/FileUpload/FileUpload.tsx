import { useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { File, FileX, Trash2, Upload } from "lucide-react";
import { clsx } from "clsx";
import { ProgressBar } from "../ProgressBar";
import "./FileUpload.css";

export type FileUploadVariant = "dropzone" | "link";
export type FileUploadState = "empty" | "loading" | "complete" | "error";

export interface FileUploadProps {
  /** `"dropzone"` (default) — a dashed-bordered drag-and-drop target with a "Browse" link inside it. `"link"` — a plain, compact "Browse files" link with no box, for tighter spaces. */
  variant?: FileUploadVariant;
  state?: FileUploadState;
  /** `loading` only — 0–100. */
  progress?: number;
  /** `complete` only — the uploaded file's display name. */
  filename?: ReactNode;
  /** Forwarded to the hidden native `<input type="file">`, e.g. `".pdf,.png"`. */
  accept?: string;
  /** Allow picking/dropping more than one file at once. */
  multiple?: boolean;
  disabled?: boolean;
  /** Fires with the picked or dropped files — browsing and dropping both funnel through here, same as the real `<input>`'s own `files`. */
  onFilesSelected?: (files: FileList) => void;
  /** `complete` only — the file's own remove action. */
  onRemove?: () => void;
  /** `error` only — the "Try again" action. */
  onRetry?: () => void;
  id?: string;
  className?: string;
}

/**
 * A file upload control — matches Figma's File Upload exactly across its two
 * real axes: `variant` ("dropzone", a bordered drag-and-drop target with a
 * "Browse" link inside it; "link", a plain compact "Browse files" link with
 * no box, for tighter spaces) and `state` (empty/loading/complete/error).
 * Figma models these as a flat `border` boolean crossed with a 7-value
 * `state` enum (its own `State4`/`State5`/`State6` are just the `!border`
 * copies of Error/Filled/Empty) — collapsed here into the two orthogonal
 * props above, matching how this design system already renames Figma's own
 * confusing variant axes elsewhere (e.g. `<IconButton>`'s "Tertiary" is
 * "secondary" here).
 *
 * Drag-and-drop is real (native HTML5 `dragover`/`drop`, same technique as
 * `<DragList>`/the kanban board), and only wired for `variant="dropzone"`
 * while `state="empty"` — there's no visible drop target to react to
 * otherwise. The drag-active highlight isn't a distinct Figma variant; it
 * reuses `--border-brand`, the same "actively interacting" border color
 * every other drop target/focus state in this system already uses, since a
 * real dropzone with zero drag feedback would be broken UX.
 *
 * Browsing (both variants) opens the platform's native file picker via a
 * visually hidden real `<input type="file">` — nothing custom to replicate
 * there. `disabled` isn't a Figma variant either, but every other input in
 * this system has one; it's styled by dimming rather than any specific spec.
 */
export function FileUpload({
  variant = "dropzone",
  state = "empty",
  progress = 0,
  filename,
  accept,
  multiple = false,
  disabled = false,
  onFilesSelected,
  onRemove,
  onRetry,
  id,
  className,
}: FileUploadProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const canDrop = variant === "dropzone" && state === "empty" && !disabled;

  function browse() {
    if (!disabled) inputRef.current?.click();
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) onFilesSelected?.(event.target.files);
    // Reset so picking the same file again still fires a change event.
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!canDrop) return;
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!canDrop) return;
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!canDrop) return;
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files.length > 0) onFilesSelected?.(event.dataTransfer.files);
  }

  return (
    <div
      className={clsx(
        "ds-file-upload",
        `ds-file-upload--${variant}`,
        `ds-file-upload--${state}`,
        canDrop && dragActive && "ds-file-upload--drag-active",
        disabled && "ds-file-upload--disabled",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="ds-file-upload__input"
        tabIndex={-1}
      />

      {state === "empty" && variant === "dropzone" && (
        <>
          <Upload size={16} className="ds-file-upload__icon" aria-hidden />
          <span className="ds-file-upload__text">
            <button type="button" className="ds-file-upload__link" onClick={browse} disabled={disabled}>
              Browse
            </button>
            {" or drop file"}
          </span>
        </>
      )}

      {state === "empty" && variant === "link" && (
        <button type="button" className="ds-file-upload__link ds-file-upload__browse-files" onClick={browse} disabled={disabled}>
          <Upload size={16} aria-hidden />
          Browse files
        </button>
      )}

      {state === "loading" && (
        <div className="ds-file-upload__progress">
          <ProgressBar className="ds-file-upload__progress-bar" value={progress} showValue={false} mode="info" />
          <span className="ds-file-upload__progress-value">{Math.round(Math.min(100, Math.max(0, progress)))}%</span>
        </div>
      )}

      {state === "complete" && (
        <>
          <File size={16} className="ds-file-upload__icon ds-file-upload__icon--file" aria-hidden />
          <span className="ds-file-upload__filename">{filename}</span>
          <button type="button" className="ds-file-upload__remove" onClick={onRemove} aria-label="Remove file" disabled={disabled}>
            <Trash2 size={16} aria-hidden />
          </button>
        </>
      )}

      {state === "error" && (
        <>
          <FileX size={16} className="ds-file-upload__icon ds-file-upload__icon--error" aria-hidden />
          <span className="ds-file-upload__error-text">
            Upload failed.{" "}
            <button type="button" className="ds-file-upload__link" onClick={onRetry} disabled={disabled}>
              Try again
            </button>
          </span>
        </>
      )}
    </div>
  );
}
