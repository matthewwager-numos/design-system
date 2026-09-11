/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "A circular dependency between components breaks the atomic tiering this design system relies on (tokens -> primitives -> composites, never the reverse) and usually means two components are actually one thing split in half, or a shared piece needs pulling out into its own module.",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^src",
    exclude: { path: "\\.test\\.(ts|tsx)$" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
