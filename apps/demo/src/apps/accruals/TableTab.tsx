import { useState } from "react";
import { ChevronDown, MoreVertical, Settings } from "lucide-react";
import { Cell, Checkbox, CheckboxGroup, Column, IconButton, Pagination, Select, SearchFilter } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";
import {
  ACCRUAL_COLUMNS,
  ACCRUAL_VENDORS,
  accrualCurrency,
  accrualCurrencyAccounting,
  grandTotals,
  subsidiaryTotals,
  vendorTotals,
} from "../../data/accruals";
import type { AccrualSubsidiary, AccrualVendor } from "../../data/accruals";
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
  vendorId?: string;
  indent?: boolean;
  emphasis?: boolean;
  mayActual: number;
  junActual: number;
  julActual: number;
  augMtd: number;
  momVariance: number;
  threeMonthAverage: number;
  accrualAmount: number;
  ytdActual: number;
  category?: string;
}

function subsidiaryRow(subsidiary: AccrualSubsidiary, indent: boolean): Row {
  return { key: subsidiary.id, name: subsidiary.name, indent, category: subsidiary.category, ...subsidiaryTotals(subsidiary) };
}

function vendorRow(vendor: AccrualVendor): Row {
  return { key: vendor.id, name: `${vendor.name} Total`, vendorId: vendor.id, emphasis: true, ...vendorTotals(vendor) };
}

function compareRows(a: Row, b: Row, column: string, direction: "asc" | "desc"): number {
  const sign = direction === "asc" ? 1 : -1;
  if (column === "vendor") return sign * a.name.localeCompare(b.name);
  const av = a[column as keyof Row];
  const bv = b[column as keyof Row];
  if (typeof av === "string" || typeof bv === "string") return sign * String(av ?? "").localeCompare(String(bv ?? ""));
  return sign * ((Number(av) || 0) - (Number(bv) || 0));
}

const VENDOR_FILTER_OPTIONS = ACCRUAL_VENDORS.map((vendor) => ({ value: vendor.id, label: vendor.name }));

/**
 * Vendor → subsidiary spend/accrual breakdown, modeled on a real product
 * screenshot: a vendor row rolls up its own subsidiaries, sorted by
 * Accrual Amount (descending) by default, matching that reference exactly.
 * `<Cell>`/`<Column>` are the design system's own table primitives; there's
 * no built-in expand/collapse affordance on them, so the toggle here is
 * hand-rolled the same way `GanttChart`'s own collapsible groups are.
 *
 * Which columns show (and their order), whether the Vendor column is
 * frozen while scrolling, and whether rows group by vendor at all are all
 * configured via the settings drawer (the gear button next to the search
 * field) rather than hard-coded here.
 */
export function TableTab() {
  const [month, setMonth] = useState("2027-01");
  const [query, setQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState<string[]>(ACCRUAL_VENDORS.map((vendor) => vendor.id));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(ACCRUAL_VENDORS.filter((vendor) => vendor.id !== "aws").map((vendor) => vendor.id)));
  const [sortColumn, setSortColumn] = useState("accrualAmount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnIds, setColumnIds] = useState<string[]>(["mayActual", "junActual", "julActual", "augMtd", "momVariance", "threeMonthAverage", "accrualAmount"]);
  const [freezeFirstColumn, setFreezeFirstColumn] = useState(true);
  const [groupVendors, setGroupVendors] = useState(true);
  const showToast = useToast();

  function toggleVendor(id: string) {
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
  const visibleVendors = ACCRUAL_VENDORS.filter((vendor) => vendorFilter.includes(vendor.id)).filter(
    (vendor) => !query_ || vendor.name.toLowerCase().includes(query_) || vendor.subsidiaries.some((sub) => sub.name.toLowerCase().includes(query_)),
  );

  let rows: Row[];
  if (groupVendors) {
    const sortedVendors = [...visibleVendors].sort((a, b) => compareRows(vendorRow(a), vendorRow(b), sortColumn, sortDirection));
    rows = [];
    for (const vendor of sortedVendors) {
      rows.push(vendorRow(vendor));
      if (!collapsed.has(vendor.id)) {
        for (const subsidiary of vendor.subsidiaries) rows.push(subsidiaryRow(subsidiary, true));
      }
    }
  } else {
    rows = visibleVendors
      .flatMap((vendor) => vendor.subsidiaries.map((subsidiary) => subsidiaryRow(subsidiary, false)))
      .sort((a, b) => compareRows(a, b, sortColumn, sortDirection));
  }
  const grand = grandTotals(ACCRUAL_VENDORS);
  rows.push({ key: "grand-total", name: "Total (USD)", emphasis: true, ...grand });

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
                  {VENDOR_FILTER_OPTIONS.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={vendorFilter.includes(option.value)}
                      onChange={(event) =>
                        setVendorFilter((prev) => (event.target.checked ? [...prev, option.value] : prev.filter((id) => id !== option.value)))
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
          <Column header={headerCell("Vendor", "vendor")} width={220} className={freezeFirstColumn ? "accruals-column--frozen" : undefined}>
            {rows.map((row) => (
              <Cell key={row.key} type="slot">
                {row.vendorId ? (
                  <button
                    type="button"
                    className="accruals-region-cell accruals-region-cell--interactive"
                    onClick={() => toggleVendor(row.vendorId!)}
                    aria-expanded={!collapsed.has(row.vendorId)}
                  >
                    <ChevronDown size={16} className={`accruals-chevron${collapsed.has(row.vendorId) ? " accruals-chevron--collapsed" : ""}`} aria-hidden />
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
        groupVendors={groupVendors}
        onSave={(next) => {
          setColumnIds(next.columnIds);
          setFreezeFirstColumn(next.freezeFirstColumn);
          setGroupVendors(next.groupVendors);
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
