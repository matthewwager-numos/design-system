// History (a chronological feed/audit log of task changes) is explicitly
// deferred — not designed yet, matching the same placeholder used for the
// People app's own History tab. This is a plain placeholder, not an
// attempt to guess at that design.
export function HistoryTab() {
  return (
    <div className="page">
      <p style={{ margin: 0, color: "var(--content-subtle)" }}>History isn't designed yet — this tab is a placeholder.</p>
    </div>
  );
}
