import { useState } from "react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";

const MAX_RESULTS = 48;

/**
 * A live search over lucide-react's full icon set, for the Foundations/Icons
 * docs page. Uses DynamicIcon so only matched icons are actually imported —
 * rendering all ~2000 icons eagerly would be wasteful.
 */
export function IconGallery() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const matches = trimmed ? iconNames.filter((name) => name.includes(trimmed)) : [];
  const shown = matches.slice(0, MAX_RESULTS);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${iconNames.length.toLocaleString()} icons (e.g. "arrow", "user", "trash")`}
        style={{
          width: "100%",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-base)",
          background: "var(--background-default)",
          color: "var(--content-base)",
          font: "var(--type-paragraph-m-regular)",
          letterSpacing: "var(--type-paragraph-m-regular-tracking)",
          marginBottom: "1rem",
        }}
      />

      {!trimmed && (
        <p style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)" }}>
          Start typing to search.
        </p>
      )}

      {trimmed && matches.length === 0 && (
        <p style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)" }}>
          No icons match "{query}".
        </p>
      )}

      {shown.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "0.75rem" }}>
            {shown.map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.75rem 0.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-base)",
                }}
              >
                <DynamicIcon name={name} size={20} color="var(--content-base)" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--content-subtle)",
                    textAlign: "center",
                    wordBreak: "break-word",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          {matches.length > MAX_RESULTS && (
            <p style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)", marginTop: "0.75rem" }}>
              Showing {MAX_RESULTS} of {matches.length} matches — refine your search to see more.
            </p>
          )}
        </>
      )}
    </div>
  );
}
