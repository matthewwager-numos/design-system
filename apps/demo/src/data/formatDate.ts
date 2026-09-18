const DATE_WITH_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const DATE_WITHOUT_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/**
 * This app's own date convention, wherever a date is shown (a notification,
 * a history entry, a journal line): "Mon DD", with the year only when it
 * isn't the current one — most dates here are recent, so a year on every
 * single one would just be noise. Deliberately no relative phrasing
 * ("4 days ago") — it goes stale the moment the page has been open a while,
 * and reads differently to everyone depending on when they happen to look.
 */
export function formatDate(date: Date): string {
  const format = date.getFullYear() === new Date().getFullYear() ? DATE_WITHOUT_YEAR : DATE_WITH_YEAR;
  return format.format(date);
}

export function formatTime(date: Date): string {
  return TIME.format(date);
}
