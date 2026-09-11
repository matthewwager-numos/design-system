#!/usr/bin/env node
// Aggregates Vitest, Stylelint, dependency-cruiser, and Storybook Test Runner
// results (each already run as a separate CI step, writing to the fixed
// paths read below) into one static HTML report. Run from the repo root —
// every path here is relative to that.
//
// This deliberately does NOT re-run any of the checks itself — it only
// reads whatever JSON each tool already produced, so a step that failed
// (e.g. a real circular dependency, a real a11y violation) still shows up
// in the report instead of silently aborting report generation too.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(path, fallback) {
  const full = join(ROOT, path);
  if (!existsSync(full)) return fallback;
  try {
    return JSON.parse(readFileSync(full, "utf8"));
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// ── 1. Unit tests (Vitest) ──────────────────────────────────────────────
const vitest = readJson("packages/ui/test-results/vitest-results.json", null);
const unitTests = vitest && {
  total: vitest.numTotalTests,
  passed: vitest.numPassedTests,
  failed: vitest.numFailedTests,
  success: vitest.success,
};

// ── 2. Token compliance (Stylelint) ─────────────────────────────────────
const stylelintRaw = readJson("packages/ui/test-results/stylelint-results.json", []);
const stylelintViolations = stylelintRaw.flatMap((file) =>
  (file.warnings ?? []).map((w) => ({ file: relative(ROOT, file.source), line: w.line, rule: w.rule, text: w.text })),
);

// ── 3. Component dependency graph (dependency-cruiser) ──────────────────
const depgraph = readJson("packages/ui/depgraph/graph.json", { modules: [], summary: {} });

// "src/Chart/BarChart.tsx" -> "Chart", "src/Button/Button.tsx" -> "Button" —
// "test" isn't a component, it's the Vitest setup/polyfill directory.
function componentOf(srcPath) {
  const m = srcPath.match(/^src\/([^/]+)\//);
  return m && m[1] !== "test" ? m[1] : null;
}

const internalEdges = new Map(); // component -> Set of components it depends on
const allComponents = new Set();
for (const mod of depgraph.modules) {
  const from = componentOf(mod.source);
  if (!from) continue;
  allComponents.add(from);
  for (const dep of mod.dependencies ?? []) {
    if (!dep.resolved) continue;
    const to = componentOf(dep.resolved);
    if (!to || to === from) continue;
    if (!internalEdges.has(from)) internalEdges.set(from, new Set());
    internalEdges.get(from).add(to);
    allComponents.add(to);
  }
}

const inDegree = new Map();
for (const targets of internalEdges.values()) {
  for (const target of targets) inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
}

// Topological tier: 0 for components with no internal dependencies, else
// 1 + the deepest tier among what it depends on. Purely descriptive (see
// plan) — not an enforced layering rule.
function computeTiers() {
  const tier = new Map();
  const visiting = new Set();
  function tierOf(component) {
    if (tier.has(component)) return tier.get(component);
    if (visiting.has(component)) return 0; // circular guard — already reported separately
    visiting.add(component);
    const deps = internalEdges.get(component);
    const depth = deps && deps.size > 0 ? 1 + Math.max(...Array.from(deps).map(tierOf)) : 0;
    tier.set(component, depth);
    visiting.delete(component);
    return depth;
  }
  for (const c of allComponents) tierOf(c);
  return tier;
}
const tiers = computeTiers();

// ── 4. External usage (apps/demo + apps/storybook consuming @numosai/ui) ─
function externalUsageCounts() {
  const counts = new Map();
  let grepOutput = "";
  try {
    grepOutput = execSync(
      `grep -rhoE 'from "@numosai/ui"' -A0 -B0 apps/demo/src apps/storybook/src --include="*.tsx" --include="*.ts" -l 2>/dev/null || true`,
      { cwd: ROOT, encoding: "utf8" },
    );
  } catch {
    grepOutput = "";
  }
  const files = grepOutput.split("\n").filter(Boolean);
  for (const file of files) {
    let content = "";
    try {
      content = readFileSync(join(ROOT, file), "utf8");
    } catch {
      continue;
    }
    const importLines = content.match(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']@numosai\/ui["']/g) ?? [];
    for (const line of importLines) {
      const names = line.match(/\{([^}]+)\}/)[1].split(",").map((n) => n.trim().split(" as ")[0].trim());
      for (const name of names) {
        if (!name) continue;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
  }
  return counts;
}
const externalUsage = externalUsageCounts();

// ── 5. Storybook Test Runner (render + a11y smoke test per story) ──────
const testStorybook = readJson("apps/storybook/test-results/test-storybook-results.json", null);
let a11yFailures = 0;
let otherFailures = 0;
const failureDetails = [];
if (testStorybook) {
  for (const suite of testStorybook.testResults ?? []) {
    for (const assertion of suite.assertionResults ?? []) {
      if (assertion.status !== "failed") continue;
      const message = (assertion.failureMessages ?? []).join("\n");
      const isA11y = message.includes("accessibility violation");
      if (isA11y) a11yFailures++;
      else otherFailures++;
      failureDetails.push({ name: assertion.fullName, kind: isA11y ? "a11y" : "other" });
    }
  }
}
const storybookTests = testStorybook && {
  total: testStorybook.numTotalTests,
  passed: testStorybook.numPassedTests,
  failed: testStorybook.numFailedTests,
  a11yFailures,
  otherFailures,
};

// ── Build the Mermaid dependency graph (internal packages/ui edges only) ─
function mermaidGraph() {
  const lines = ["graph LR"];
  const sorted = Array.from(allComponents).sort();
  for (const c of sorted) {
    const dependents = inDegree.get(c) ?? 0;
    const style = dependents >= 5 ? ":::hot" : "";
    lines.push(`  ${c}["${c} (${dependents})"]${style}`);
  }
  for (const [from, targets] of internalEdges) {
    for (const to of targets) lines.push(`  ${from} --> ${to}`);
  }
  lines.push("classDef hot fill:#f5deb3,stroke:#a05a2c,stroke-width:2px;");
  return lines.join("\n");
}

// ── Render ───────────────────────────────────────────────────────────────
const generatedAt = process.env.HEALTH_REPORT_TIMESTAMP ?? new Date().toISOString();

const componentRows = Array.from(allComponents)
  .sort((a, b) => (inDegree.get(b) ?? 0) - (inDegree.get(a) ?? 0) || a.localeCompare(b))
  .map(
    (c) => `<tr>
      <td>${escapeHtml(c)}</td>
      <td class="num">${inDegree.get(c) ?? 0}</td>
      <td class="num">${externalUsage.get(c) ?? 0}</td>
      <td class="num">${tiers.get(c) ?? 0}</td>
    </tr>`,
  )
  .join("\n");

const stylelintRows = stylelintViolations.length
  ? stylelintViolations.map((v) => `<tr><td>${escapeHtml(v.file)}:${v.line}</td><td>${escapeHtml(v.rule)}</td><td>${escapeHtml(v.text)}</td></tr>`).join("\n")
  : `<tr><td colspan="3">No token-compliance violations found.</td></tr>`;

function statusBadge(pass) {
  return pass ? `<span class="badge badge--pass">pass</span>` : `<span class="badge badge--fail">fail</span>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Component Health Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.5; }
  h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
  .meta { color: #767676; font-size: 0.875rem; margin-bottom: 2rem; }
  section { margin-bottom: 3rem; }
  h2 { font-size: 1.25rem; border-bottom: 1px solid #8884; padding-bottom: 0.5rem; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; margin: 1rem 0; }
  .summary-card { border: 1px solid #8884; border-radius: 0.5rem; padding: 1rem; }
  .summary-card .figure { font-size: 1.75rem; font-weight: 600; }
  .summary-card .label { font-size: 0.8rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.03em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #8882; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .badge--pass { background: #1a7f3720; color: #1a7f37; }
  .badge--fail { background: #cf222e20; color: #cf222e; }
  .limitation { border-left: 3px solid #8884; padding-left: 1rem; opacity: 0.85; font-size: 0.9rem; }
  .mermaid { overflow-x: auto; }
  code { background: #8882; padding: 0.1rem 0.3rem; border-radius: 0.25rem; }
</style>
</head>
<body>
  <h1>Component Health Report</h1>
  <p class="meta">Generated ${escapeHtml(generatedAt)} — <a href="../storybook/">back to Storybook</a></p>

  <section>
    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Unit tests ${unitTests ? statusBadge(unitTests.success) : ""}</div>
        <div class="figure">${unitTests ? `${unitTests.passed}/${unitTests.total}` : "n/a"}</div>
      </div>
      <div class="summary-card">
        <div class="label">Token compliance ${statusBadge(stylelintViolations.length === 0)}</div>
        <div class="figure">${stylelintViolations.length} ${stylelintViolations.length === 1 ? "violation" : "violations"}</div>
      </div>
      <div class="summary-card">
        <div class="label">Dependency graph ${statusBadge((depgraph.summary.error ?? 0) === 0)}</div>
        <div class="figure">${depgraph.summary.error ?? 0} circular</div>
      </div>
      <div class="summary-card">
        <div class="label">Storybook stories ${storybookTests ? statusBadge(storybookTests.failed === 0) : ""}</div>
        <div class="figure">${storybookTests ? `${storybookTests.passed}/${storybookTests.total}` : "n/a"}</div>
      </div>
    </div>
    ${
      storybookTests
        ? `<p>Of ${storybookTests.failed} failing stories: <strong>${storybookTests.a11yFailures}</strong> accessibility violations, <strong>${storybookTests.otherFailures}</strong> render/other errors.</p>`
        : ""
    }
  </section>

  <section>
    <h2>Component dependency graph</h2>
    <p>Internal <code>packages/ui</code> component-to-component dependencies only. "Dependents" = other components in this library that import it directly. "External usage" = how many files in <code>apps/demo</code>/<code>apps/storybook</code> import it directly — often far larger than internal dependents, since apps consume components directly rather than through other components. "Tier" is a computed topological depth (0 = no internal dependencies), descriptive only — not an enforced layering rule yet.</p>
    <pre class="mermaid">${mermaidGraph()}</pre>
    <table>
      <thead><tr><th>Component</th><th class="num">Internal dependents</th><th class="num">External usage</th><th class="num">Tier</th></tr></thead>
      <tbody>${componentRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Token compliance violations</h2>
    <table>
      <thead><tr><th>File</th><th>Rule</th><th>Message</th></tr></thead>
      <tbody>${stylelintRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Known limitations</h2>
    <p class="limitation">
      This report catches circular dependencies, hardcoded-value CSS, and story render/accessibility regressions automatically. It does <strong>not</strong> judge whether a component <em>should</em> have been composed from smaller existing pieces instead of reimplementing something inline — that's a human code-review call this data informs, not a verdict it renders. The dependency graph above is scoped to <code>packages/ui</code>'s own internal imports; a component's real blast radius across the monorepo is usually larger once <code>apps/demo</code>/<code>apps/storybook</code> usage (the "external usage" column) is counted too.
    </p>
  </section>

  <script>
    mermaid.initialize({ startOnLoad: true, theme: "neutral" });
  </script>
</body>
</html>
`;

const outDir = join(ROOT, "health-report-dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log(`Health report written to ${relative(ROOT, join(outDir, "index.html"))}`);
