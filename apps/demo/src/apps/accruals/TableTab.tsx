import { useState } from "react";
import { ChevronDown, MoreVertical, Settings } from "lucide-react";
import { Cell, Checkbox, CheckboxGroup, Column, IconButton, Pagination, Select, SearchFilter } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";
import { ACCRUAL_COLUMNS, ACCRUAL_REGIONS, accrualCurrency, grandTotals, regionTotals } from "../../data/accruals";
import type { AccrualCountry, AccrualRegion } from "../../data/accruals";
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
  regionId?: string;
  indent?: boolean;
  emphasis?: boolean;
  revenue: number;
  expenses: number;
  netProfit: number;
  accrued: number;
  budget: number;
  variance: number;
  costCenter?: string;
  glAccount?: string;
}

function countryRow(country: AccrualCountry, indent: boolean): Row {
  return {
    key: country.id,
    name: country.name,
    indent,
    revenue: country.revenue,
    expenses: country.expenses,
    netProfit: country.revenue - country.expenses,
    accrued: country.accrued,
    budget: country.budget,
    variance: country.revenue - country.budget,
    costCenter: country.costCenter,
    glAccount: country.glAccount,
  };
}

function regionRow(region: AccrualRegion): Row {
  const totals = regionTotals(region);
  return { key: region.id, name: `${region.name} Total`, regionId: region.id, emphasis: true, ...totals };
}

function compareRows(a: Row, b: Row, column: string, direction: "asc" | "desc"): number {
  const sign = direction === "asc" ? 1 : -1;
  if (column === "region") return sign * a.name.localeCompare(b.name);
  const av = a[column as keyof Row];
  const bv = b[column as keyof Row];
  if (typeof av === "string" || typeof bv === "string") return sign * String(av ?? "").localeCompare(String(bv ?? ""));
  return sign * ((Number(av) || 0) - (Number(bv) || 0));
}

const REGION_FILTER_OPTIONS = ACCRUAL_REGIONS.map((region) => ({ value: region.id, label: region.name }));

/**
 * Region → country breakdown with collapsible region rows — matches the
 * Figma selection this app was built from: North America starts expanded
 * (showing its three countries), every other region starts collapsed.
 * `<Cell>`/`<Column>` are the design system's own table primitives; there's
 * no built-in expand/collapse affordance on them, so the toggle here is
 * hand-rolled the same way `GanttChart`'s own collapsible groups are.
 *
 * Which columns show (and their order), whether the Region column is
 * frozen while scrolling, and whether rows group by region at all are all
 * configured via the settings drawer (the gear button next to the search
 * field) rather than hard-coded here.
 */
export function TableTab() {
  const [month, setMonth] = useState("2027-01");
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string[]>(ACCRUAL_REGIONS.map((region) => region.id));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(ACCRUAL_REGIONS.filter((region) => region.id !== "north-america").map((region) => region.id)));
  const [sortColumn, setSortColumn] = useState("region");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnIds, setColumnIds] = useState<string[]>(["revenue", "expenses", "netProfit"]);
  const [freezeFirstColumn, setFreezeFirstColumn] = useState(true);
  const [groupRegions, setGroupRegions] = useState(true);
  const showToast = useToast();

  function toggleRegion(id: string) {
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
  const visibleRegions = ACCRUAL_REGIONS.filter((region) => regionFilter.includes(region.id)).filter(
    (region) => !query_ || region.name.toLowerCase().includes(query_) || region.countries.some((country) => country.name.toLowerCase().includes(query_)),
  );

  let rows: Row[];
  if (groupRegions) {
    const sortedRegions = [...visibleRegions].sort((a, b) => compareRows(regionRow(a), regionRow(b), sortColumn, sortDirection));
    rows = [];
    for (const region of sortedRegions) {
      rows.push(regionRow(region));
      if (!collapsed.has(region.id)) {
        for (const country of region.countries) rows.push(countryRow(country, true));
      }
    }
  } else {
    rows = visibleRegions
      .flatMap((region) => region.countries.map((country) => countryRow(country, false)))
      .sort((a, b) => compareRows(a, b, sortColumn, sortDirection));
  }
  const grand = grandTotals(ACCRUAL_REGIONS);
  rows.push({ key: "grand-total", name: "Total", emphasis: true, ...grand });

  function figure(value: number, emphasis?: boolean) {
    return <span className={emphasis ? "accruals-figure accruals-figure--emphasis" : "accruals-figure"}>{accrualCurrency.format(value)}</span>;
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
                  {REGION_FILTER_OPTIONS.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={regionFilter.includes(option.value)}
                      onChange={(event) =>
                        setRegionFilter((prev) => (event.target.checked ? [...prev, option.value] : prev.filter((id) => id !== option.value)))
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
          <Column header={headerCell("Region", "region")} width={240} className={freezeFirstColumn ? "accruals-column--frozen" : undefined}>
            {rows.map((row) => (
              <Cell key={row.key} type="slot">
                {row.regionId ? (
                  <button
                    type="button"
                    className="accruals-region-cell accruals-region-cell--interactive"
                    onClick={() => toggleRegion(row.regionId!)}
                    aria-expanded={!collapsed.has(row.regionId)}
                  >
                    <ChevronDown size={16} className={`accruals-chevron${collapsed.has(row.regionId) ? " accruals-chevron--collapsed" : ""}`} aria-hidden />
                    <span className="accruals-region-label accruals-region-label--emphasis">{row.name}</span>
                  </button>
                ) : (
                  <div className="accruals-region-cell">
                    <span className="accruals-region-spacer" aria-hidden />
                    <span className={`accruals-region-label${row.indent ? " accruals-region-label--indent" : ""}`}>{row.name}</span>
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
                    {figure(row[column.id as keyof Row] as number, row.emphasis)}
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
        groupRegions={groupRegions}
        onSave={(next) => {
          setColumnIds(next.columnIds);
          setFreezeFirstColumn(next.freezeFirstColumn);
          setGroupRegions(next.groupRegions);
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
