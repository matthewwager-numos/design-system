import { useEffect, useState } from "react";
import { ChevronDown, MoreVertical, Settings } from "lucide-react";
import { Cell, Checkbox, CheckboxGroup, Column, IconButton, Pagination, Select, SearchFilter, Tooltip } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";
import {
  ACCRUAL_COLUMNS,
  ACCRUAL_DIMENSION_LABELS,
  ACCRUAL_DIMENSION_VALUES,
  ACCRUAL_LINE_ITEMS,
  accrualCurrency,
  accrualCurrencyAccounting,
  isEmptyTotals,
  lineItemDimensionId,
  lineItemTotals,
} from "../../data/accruals";
import type { AccrualDimensionKey, AccrualDimensionValue, AccrualLineItem } from "../../data/accruals";
import { AccrualDetailDrawer } from "./AccrualDetailDrawer";
import { TableSettingsDrawer } from "./TableSettingsDrawer";

const MONTH_OPTIONS = [
  { value: "2027-01", label: "Jan 2027" },
  { value: "2026-12", label: "Dec 2026" },
  { value: "2026-11", label: "Nov 2026" },
];

const PAGE_SIZE_OPTIONS = [{ value: "10", label: "Show 10 per page" }];

interface Row {
  key: string;
  name: string;
  /** Present on a primary-key parent row — its own dimension value id, drives the expand/collapse toggle. */
  groupId?: string;
  /** Primary-key parent rows only — the names of its own non-empty breakdown children, shown as "(N)" next to its name, with a tooltip listing them. */
  presentNames?: string[];
  /** Present on a breakdown/leaf row *only* when it resolves to exactly one posting — drives opening the detail drawer for that one posting. */
  lineItemId?: string;
  emphasis?: boolean;
  mayActual: number;
  junActual: number;
  julActual: number;
  augMtd: number;
  momVariance: number;
  threeMonthAverage: number;
  accrualAmount: number;
  ytdActual: number;
}

function primaryRow(value: AccrualDimensionValue, items: AccrualLineItem[], presentNames: string[]): Row {
  return { key: `group:${value.id}`, name: value.name, groupId: value.id, presentNames, emphasis: true, ...lineItemTotals(items) };
}

/** `groupId` scopes the key to its parent — the same breakdown value (e.g. "New York") can appear as a child under several different primary-key groups at once, and each is a distinct row over distinct postings, not the same row repeated. */
function breakdownRow(groupId: string, value: AccrualDimensionValue, items: AccrualLineItem[]): Row {
  return {
    key: `leaf:${groupId}:${value.id}`,
    name: value.name,
    lineItemId: items.length === 1 ? items[0]!.id : undefined,
    ...lineItemTotals(items),
  };
}

function compareRows(a: Row, b: Row, column: string, direction: "asc" | "desc"): number {
  const sign = direction === "asc" ? 1 : -1;
  if (column === "label") return sign * a.name.localeCompare(b.name);
  const av = a[column as keyof Row];
  const bv = b[column as keyof Row];
  if (typeof av === "string" || typeof bv === "string") return sign * String(av ?? "").localeCompare(String(bv ?? ""));
  return sign * ((Number(av) || 0) - (Number(bv) || 0));
}

/**
 * A pivot over one flat table of postings (`ACCRUAL_LINE_ITEMS`), each
 * tagged with all 5 dimensions at once (Vendor/Subsidiary/Department/
 * Location/GL Account) — matches a real chart of accounts, where a single
 * line is coded to all of those simultaneously, not owned by just one of
 * them. Table Settings' own "Group by" picks which dimension supplies the
 * parent/rollup row (the expandable "X Total" row); "Breakdown by" picks a
 * *different* dimension whose values become that group's own child rows
 * once expanded — each child is the intersection of one primary-key value
 * and one breakdown value, not a fixed, pre-existing sub-entity the way
 * the old vendor→subsidiary shape was. `<Cell>`/`<Column>` are the design
 * system's own table primitives; there's no built-in expand/collapse
 * affordance on them, so the toggle here is hand-rolled the same way
 * `GanttChart`'s own collapsible groups are.
 *
 * Which columns show (and their order), whether the row-label column is
 * frozen while scrolling, and the primary/breakdown dimensions themselves
 * are all configured via the settings drawer (the gear button next to the
 * search field) rather than hard-coded here.
 */
export function TableTab() {
  const [month, setMonth] = useState("2027-01");
  const [query, setQuery] = useState("");
  const [primaryDimension, setPrimaryDimension] = useState<AccrualDimensionKey>("vendor");
  const [breakdownDimension, setBreakdownDimension] = useState<AccrualDimensionKey>("glAccount");
  const [primaryFilter, setPrimaryFilter] = useState<string[]>(ACCRUAL_DIMENSION_VALUES.vendor.map((value) => value.id));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(ACCRUAL_DIMENSION_VALUES.vendor.slice(1).map((value) => value.id)));
  const [sortColumn, setSortColumn] = useState("accrualAmount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnIds, setColumnIds] = useState<string[]>(["mayActual", "junActual", "julActual", "augMtd", "momVariance", "threeMonthAverage", "accrualAmount"]);
  const [freezeFirstColumn, setFreezeFirstColumn] = useState(true);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const showToast = useToast();

  // Both the filter and the expand/collapse state are keyed by the
  // *primary* dimension's own value ids — stale ids left over from
  // whatever the previous "Group by" was would silently filter/collapse
  // nothing once it changes, so both reset (everything visible, only the
  // first group expanded) whenever it does.
  useEffect(() => {
    const values = ACCRUAL_DIMENSION_VALUES[primaryDimension];
    setPrimaryFilter(values.map((value) => value.id));
    setCollapsed(new Set(values.slice(1).map((value) => value.id)));
  }, [primaryDimension]);

  function toggleGroup(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSort(column: string) {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const query_ = query.trim().toLowerCase();
  const matchesQuery = (name: string) => !query_ || name.toLowerCase().includes(query_);
  const primaryFilterOptions = ACCRUAL_DIMENSION_VALUES[primaryDimension].map((value) => ({ value: value.id, label: value.name }));
  const primaryValues = ACCRUAL_DIMENSION_VALUES[primaryDimension].filter((value) => primaryFilter.includes(value.id));

  const sortedPrimaryValues = [...primaryValues].sort((a, b) => {
    const aItems = ACCRUAL_LINE_ITEMS.filter((item) => lineItemDimensionId(item, primaryDimension) === a.id);
    const bItems = ACCRUAL_LINE_ITEMS.filter((item) => lineItemDimensionId(item, primaryDimension) === b.id);
    return compareRows(primaryRow(a, aItems, []), primaryRow(b, bItems, []), sortColumn, sortDirection);
  });

  const rows: Row[] = [];
  for (const value of sortedPrimaryValues) {
    const groupItems = ACCRUAL_LINE_ITEMS.filter((item) => lineItemDimensionId(item, primaryDimension) === value.id);
    // A breakdown value is only shown when its own intersection with this
    // primary-key value has real activity — an all-zero intersection (no
    // accrual, no actuals in any month) means nothing was ever coded to
    // that combination, so it's omitted entirely rather than shown as a
    // $0 row.
    const breakdownChildren = ACCRUAL_DIMENSION_VALUES[breakdownDimension]
      .map((breakdownValue) => ({ breakdownValue, items: groupItems.filter((item) => lineItemDimensionId(item, breakdownDimension) === breakdownValue.id) }))
      .filter(({ items }) => items.length > 0 && !isEmptyTotals(lineItemTotals(items)));
    const presentNames = breakdownChildren.map(({ breakdownValue }) => breakdownValue.name);

    // A group is included if its own name matches, or any of its
    // (unexpanded) children's names do — matching either shows the whole
    // group with *every* non-empty child, not just the ones that
    // themselves match.
    const included = matchesQuery(value.name) || breakdownChildren.some(({ breakdownValue }) => matchesQuery(breakdownValue.name));
    if (!included) continue;

    rows.push(primaryRow(value, groupItems, presentNames));
    if (!collapsed.has(value.id)) {
      for (const { breakdownValue, items } of breakdownChildren) rows.push(breakdownRow(value.id, breakdownValue, items));
    }
  }

  // Always the full, unfiltered set — a grand total shouldn't shrink just
  // because a search or filter is hiding some of the rows above it.
  rows.push({ key: "grand-total", name: "Total (USD)", emphasis: true, ...lineItemTotals(ACCRUAL_LINE_ITEMS) });

  function figure(value: number, emphasis?: boolean, accounting?: boolean) {
    const formatted = accounting ? accrualCurrencyAccounting.format(value) : accrualCurrency.format(value);
    return <span className={emphasis ? "accruals-figure accruals-figure--emphasis" : "accruals-figure"}>{formatted}</span>;
  }

  function text(value: string | undefined, emphasis?: boolean) {
    return <span className={emphasis ? "accruals-figure accruals-figure--emphasis" : "accruals-figure"}>{value ?? "—"}</span>;
  }

  function headerCell(label: string, column: string, end?: boolean) {
    const isActive = sortColumn === column;
    return (
      <Cell type={isActive ? "sorted" : "columnHead"} direction={sortDirection} onClick={() => toggleSort(column)} className={end ? "ds-cell--end" : undefined}>
        {label}
      </Cell>
    );
  }

  const visibleColumns = columnIds.map((id) => ACCRUAL_COLUMNS.find((column) => column.id === id)).filter((column): column is (typeof ACCRUAL_COLUMNS)[number] => Boolean(column));

  return (
    <div className="page page--full-width">
      <div className="accruals-toolbar">
        <div className="accruals-month-select">
          <Select size="md" value={month} onChange={setMonth} options={MONTH_OPTIONS} />
        </div>
        <div className="accruals-toolbar__controls">
          <div className="accruals-search-filter">
            <SearchFilter
              size="md"
              placeholder="Search or filter"
              value={query}
              onChange={setQuery}
              filters={
                <CheckboxGroup>
                  {primaryFilterOptions.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={primaryFilter.includes(option.value)}
                      onChange={(event) =>
                        setPrimaryFilter((prev) => (event.target.checked ? [...prev, option.value] : prev.filter((id) => id !== option.value)))
                      }
                    />
                  ))}
                </CheckboxGroup>
              }
            />
          </div>
          <IconButton icon={<Settings size={16} />} variant="ghost" size="md" aria-label="Table settings" onClick={() => setSettingsOpen(true)} />
        </div>
      </div>

      <div className="accruals-table-wrapper">
        <div className="accruals-table">
          <Column header={headerCell(ACCRUAL_DIMENSION_LABELS[primaryDimension], "label")} width={220} className={freezeFirstColumn ? "accruals-column--frozen" : undefined}>
            {rows.map((row) => (
              <Cell key={row.key} type="slot">
                {row.groupId ? (
                  <button
                    type="button"
                    className="accruals-region-cell accruals-region-cell--interactive"
                    onClick={() => toggleGroup(row.groupId!)}
                    aria-expanded={!collapsed.has(row.groupId)}
                  >
                    <ChevronDown size={16} className={`accruals-chevron${collapsed.has(row.groupId) ? " accruals-chevron--collapsed" : ""}`} aria-hidden />
                    <span className="accruals-region-label accruals-region-label--emphasis">
                      {row.name}
                      {row.presentNames && row.presentNames.length > 0 && (
                        <Tooltip content={row.presentNames.join(", ")}>
                          <span className="accruals-region-count" tabIndex={0}>
                            {" "}
                            ({row.presentNames.length})
                          </span>
                        </Tooltip>
                      )}
                    </span>
                  </button>
                ) : row.lineItemId ? (
                  <button type="button" className="accruals-region-cell accruals-region-cell--interactive" onClick={() => setSelectedLineItemId(row.lineItemId!)}>
                    <span className="accruals-region-spacer" aria-hidden />
                    <span className="accruals-region-label accruals-region-label--link">{row.name}</span>
                  </button>
                ) : (
                  <div className="accruals-region-cell">
                    <span className="accruals-region-spacer" aria-hidden />
                    <span className={`accruals-region-label${row.emphasis ? " accruals-region-label--emphasis" : ""}`}>{row.name}</span>
                  </div>
                )}
              </Cell>
            ))}
          </Column>

          {visibleColumns.map((column) => (
            <Column key={column.id} header={headerCell(column.label, column.id, column.numeric)} className={freezeFirstColumn ? "accruals-column--metric" : undefined}>
              {rows.map((row) =>
                column.numeric ? (
                  <Cell key={row.key} type="numeric">
                    {figure(row[column.id as keyof Row] as number, row.emphasis, row.key === "grand-total")}
                  </Cell>
                ) : (
                  <Cell key={row.key} type="text">
                    {text(row[column.id as keyof Row] as string | undefined, row.emphasis)}
                  </Cell>
                ),
              )}
            </Column>
          ))}

          <Column header={<Cell type="columnHead"> </Cell>} width={56}>
            {rows.map((row) => (
              <Cell
                key={row.key}
                type="icon"
                actions={
                  row.key === "grand-total"
                    ? []
                    : [
                        {
                          icon: <MoreVertical size={16} />,
                          label: `Actions for ${row.name}`,
                          onClick: () => showToast({ status: "info", title: `Actions for ${row.name} aren't designed yet` }),
                        },
                      ]
                }
              />
            ))}
          </Column>
        </div>
      </div>

      <div className="accruals-pagination">
        <div className="accruals-page-size-select">
          <Select size="sm" value="10" onChange={() => {}} options={PAGE_SIZE_OPTIONS} />
        </div>
        <Pagination page={page} totalPages={5} onPageChange={setPage} />
      </div>

      <TableSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        columnIds={columnIds}
        freezeFirstColumn={freezeFirstColumn}
        primaryDimension={primaryDimension}
        breakdownDimension={breakdownDimension}
        onSave={(next) => {
          setColumnIds(next.columnIds);
          setFreezeFirstColumn(next.freezeFirstColumn);
          setPrimaryDimension(next.primaryDimension);
          setBreakdownDimension(next.breakdownDimension);
          setSettingsOpen(false);
        }}
      />

      <AccrualDetailDrawer lineItemId={selectedLineItemId} onClose={() => setSelectedLineItemId(null)} />
    </div>
  );
}
