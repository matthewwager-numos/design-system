import { useState } from "react";
import { clsx } from "clsx";
import { Tooltip } from "../Tooltip";
import "./Avatar.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarType = "person" | "entity";
export type AvatarColor = "info" | "positive" | "notice" | "negative" | "neutral" | "alt-negative";

export interface AvatarProps {
  /** Used to derive the fallback initial (its first character, uppercased) when `initials` isn't given, and as the image's alt text. */
  name?: string;
  /** Explicit fallback initial, overriding the one derived from `name`. */
  initials?: string;
  /** Image URL. Falls back to the initial when omitted, or if it fails to load. */
  src?: string;
  size?: AvatarSize;
  /** Circular, for a person, or a rounded square, for an org/app/entity. */
  type?: AvatarType;
  /**
   * Background/initial color. Defaults to "info" (the brand blue Figma's
   * Avatar always shows). "positive"/"notice"/"negative"/"neutral" reuse
   * the same semantic status colors as Badge/Label/Banner; "alt-negative"
   * is a distinct magenta-based negative variant (Figma's own naming) —
   * useful for e.g. color-coding avatars by team or status rather than
   * every avatar looking identical.
   */
  color?: AvatarColor;
  /**
   * Shows `name` (or `initials`, if there's no `name`) in a tooltip on
   * hover — useful since the avatar itself only ever shows an image or a
   * single initial, never the full name. On by default; set to `false` to
   * opt out (or when there's neither `name` nor `initials` to show, it's a
   * no-op regardless).
   */
  tooltip?: boolean;
  className?: string;
}

/**
 * A person/entity avatar. Shows `src` when it's set and loads successfully;
 * otherwise falls back to a single initial derived from `name` (or
 * `initials`, if given directly). Sizes reuse the Heading XS→XL semantic
 * type tokens — Figma's own avatar sizes map exactly onto that scale.
 */
export function Avatar({ name, initials, src, size = "md", type = "person", color = "info", tooltip = true, className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;
  const fallback = (initials ?? name)?.trim().charAt(0).toUpperCase();

  const avatar = (
    <span className={clsx("ds-avatar", `ds-avatar--${type}`, `ds-avatar--${size}`, `ds-avatar--${color}`, className)}>
      {showImage ? (
        <img className="ds-avatar__image" src={src} alt={name ?? ""} onError={() => setImageFailed(true)} />
      ) : (
        fallback || null
      )}
    </span>
  );

  const tooltipLabel = name ?? initials;
  if (!tooltip || !tooltipLabel) return avatar;

  return <Tooltip content={tooltipLabel}>{avatar}</Tooltip>;
}
