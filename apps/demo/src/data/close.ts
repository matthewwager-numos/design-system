import type { BadgeStatus } from "@numosai/ui";

/**
 * Placeholder until a real close-calendar/period-end date exists to derive
 * this from — shared by the nav badge (`NavContent.tsx`) and the Close
 * app's own Overview (`OverviewTab.tsx`), so both always agree on the same
 * countdown instead of drifting independently.
 */
export const DAYS_UNTIL_CLOSE = 1;

/** Gets more urgent as the close deadline actually gets closer, not a fixed color. */
export function closeBadgeStatus(daysRemaining: number): BadgeStatus {
  if (daysRemaining <= 1) return "negative";
  if (daysRemaining <= 3) return "notice";
  return "info";
}
