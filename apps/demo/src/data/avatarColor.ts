import type { AvatarColor } from "@numosai/ui";

const AVATAR_COLORS: AvatarColor[] = ["info", "positive", "notice", "negative", "neutral", "alt-negative"];

/**
 * Picks one of `<Avatar>`'s own defined colors for a given id — stable
 * across re-renders (not re-rolled every time), just varied from one
 * person to the next rather than every avatar defaulting to the same
 * "info" blue.
 */
export function avatarColorFor(id: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? "info";
}
