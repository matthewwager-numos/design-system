import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  BarChart3,
  Calculator,
  Check,
  Download,
  Eye,
  FileText,
  Mail,
  MessagesSquare,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import {
  Avatar,
  BarChart,
  Button,
  ButtonGroup,
  Cell,
  Column,
  DetailHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  GaugeChart,
  IconButton,
  JournalEntry,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  SegmentedControl,
  SegmentedControlOption,
  useScrollSpy,
} from "@numosai/ui";
import type { ChartSeries, GroupedChartDatum, JournalEntryValue, SelectOption } from "@numosai/ui";
import {
  ACCRUAL_DIMENSION_VALUES,
  ACCRUAL_HISTORY_MONTHS,
  ACCRUAL_TEAMMATES,
  EVIDENCE_TYPES,
  accrualCurrency,
  accrualFor,
  assigneeForLineItem,
  confidenceForLineItem,
  dimensionValueName,
  evidenceCoverage,
  findLineItem,
  historyForLineItem,
  journalEntryStatus,
  relatedPostings,
} from "../../data/accruals";
import type { AccrualLineItem, EvidenceType } from "../../data/accruals";
import { useToast } from "../../toast/ToastProvider";

interface DrawerComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

let nextCommentId = 1;

function timestamp(): string {
  return "Today " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const SECTIONS = [
  { id: "confidence", label: "Confidence" },
  { id: "journal-entry", label: "Journal Entry" },
  { id: "history", label: "History" },
  { id: "evidence", label: "Evidence" },
  { id: "collaborate", label: "Collaborate" },
];

const HISTORY_SERIES: ChartSeries[] = [
  { key: "recorded", label: "Recorded at close" },
  { key: "accrual", label: "Accrual" },
  { key: "final", label: "Final" },
];

const EVIDENCE_ICONS: Record<EvidenceType, LucideIcon> = {
  "Purchase Order": Receipt,
  "Trailing 3m Avg": TrendingUp,
  Budget: BarChart3,
  Invoice: FileText,
  Email: Mail,
  "GL Actual": Calculator,
};

export interface AccrualDetailDrawerProps {
  /** `null` closes the drawer — its own transition still plays out since `<Modal>` stays mounted for that duration. */
  lineItemId: string | null;
  onClose: () => void;
}

/**
 * The Object Detail drawer for an individual accrual entry — one posting
 * from the Table tab's own pivot (`ACCRUAL_LINE_ITEMS`), the intersection
 * of whichever primary-key row and breakdown row were clicked, never the
 * rollup/group row itself. Matches Figma's revamped Drawer template: a
 * `<DetailHeader>` whose `tabs` slot is a scroll-spy nav (`useScrollSpy`),
 * not real `<Tabs>`, since all five sections below are always mounted in
 * one continuously-scrolling `<ModalBody>` rather than switched panels.
 *
 * Confidence/Journal Entry/History/Evidence/Collaborate are real, working
 * sections (not static mockups) — the "Collaborate" comment thread mirrors
 * `AssistantPanel`'s own chat UI (message bubbles, auto-growing textarea +
 * send button) but with local, human-authored comments, not an AI reply.
 */
export function AccrualDetailDrawer({ lineItemId, onClose }: AccrualDetailDrawerProps) {
  const lineItem = lineItemId ? findLineItem(lineItemId) : undefined;

  return (
    <Modal
      variant="drawer"
      side="right"
      className="accrual-detail__drawer"
      open={lineItem !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      {lineItem && <AccrualDetailContent lineItem={lineItem} onClose={onClose} />}
    </Modal>
  );
}

interface AccrualDetailContentProps {
  lineItem: AccrualLineItem;
  onClose: () => void;
}

function AccrualDetailContent({ lineItem, onClose }: AccrualDetailContentProps) {
  const showToast = useToast();
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionIds = SECTIONS.map((section) => section.id);
  const activeSection = useScrollSpy(sectionIds, bodyRef);

  const [comments, setComments] = useState<DrawerComment[]>(() => [
    {
      id: "comment-seed-1",
      author: "M. Lamont",
      text: "Confirmed this against the vendor's own invoice history — looks consistent with last month.",
      timestamp: "Yesterday 4:12p",
    },
    {
      id: "comment-seed-2",
      author: "A. Butler",
      text: "Thanks — I'll get the purchase order attached before close.",
      timestamp: "Yesterday 4:30p",
    },
  ]);
  const [commentDraft, setCommentDraft] = useState("");
  const [historyView, setHistoryView] = useState("chart");
  const [assignee, setAssignee] = useState(() => assigneeForLineItem(lineItem));

  const vendorName = dimensionValueName("vendor", lineItem.vendorId);
  const subsidiaryName = dimensionValueName("subsidiary", lineItem.subsidiaryId);
  const departmentName = dimensionValueName("department", lineItem.departmentId);
  const locationName = dimensionValueName("location", lineItem.locationId);
  const glAccountName = dimensionValueName("glAccount", lineItem.glAccountId);

  const accountOptions: SelectOption[] = [
    ...ACCRUAL_DIMENSION_VALUES.glAccount.map((value) => ({ value: value.id, label: value.name })),
    { value: "accrued-liabilities", label: "Accrued liabilities" },
  ];
  const departmentOptions: SelectOption[] = ACCRUAL_DIMENSION_VALUES.department.map((value) => ({ value: value.id, label: value.name }));
  const locationOptions: SelectOption[] = ACCRUAL_DIMENSION_VALUES.location.map((value) => ({ value: value.id, label: value.name }));

  const [journalValue, setJournalValue] = useState<JournalEntryValue>(() => ({
    date: new Date().toISOString().slice(0, 10),
    reference: lineItem.id,
    lines: [
      {
        id: `${lineItem.id}-debit`,
        account: lineItem.glAccountId,
        department: lineItem.departmentId,
        location: lineItem.locationId,
        memo: `Accrual: ${vendorName} — ${subsidiaryName}`,
        debit: accrualFor(lineItem),
      },
      {
        id: `${lineItem.id}-credit`,
        account: "accrued-liabilities",
        department: lineItem.departmentId,
        location: lineItem.locationId,
        memo: `Accrual: ${vendorName} — ${subsidiaryName}`,
        credit: accrualFor(lineItem),
      },
    ],
  }));

  const confidence = confidenceForLineItem(lineItem);
  const jeStatus = journalEntryStatus(lineItem);
  const jeStatusLabel = jeStatus === "Complete" ? "Ready" : jeStatus;
  const jeStatusLabelStatus = jeStatus === "Complete" ? "positive" : jeStatus === "Incomplete" ? "notice" : "neutral";
  const history = historyForLineItem(lineItem);
  // `<BarChart>` has no clustered-of-stacks hybrid (a variant is one or the
  // other for every category) — so a real stacked bar (Recorded + Accrual)
  // paired against a solo Final bar, per month, is built as `variant="stacked"`
  // over *twice* as many categories instead: each month becomes two, one
  // holding only `recorded`/`accrual` (the other series left at their
  // implicit 0, contributing nothing to that bar's stack) and the next
  // holding only `final`.
  const historyChartData: GroupedChartDatum[] = history.flatMap((point) => [
    { category: point.category, values: { recorded: point.values.recorded, accrual: point.values.accrual, final: 0 } },
    { category: `${point.category} (Final)`, values: { recorded: 0, accrual: 0, final: point.values.final } },
  ]);
  const coverage = evidenceCoverage(lineItem);
  const related = relatedPostings(lineItem);

  function handleJournalSave(next: JournalEntryValue) {
    setJournalValue(next);
    showToast({ status: "positive", title: "Saved journal entry" });
  }

  function handleSendComment(event: FormEvent) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    setComments((prev) => [...prev, { id: `comment-${nextCommentId++}`, author: "You", text, timestamp: timestamp() }]);
    setCommentDraft("");
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <DetailHeader
        breadcrumb="Accruals"
        title={
          <>
            {vendorName}
            <span className="accrual-detail__divider" aria-hidden>
              |
            </span>
            {accrualCurrency.format(accrualFor(lineItem))}
          </>
        }
        meta={[subsidiaryName, glAccountName, locationName, departmentName]}
        onClose={onClose}
        tabs={
          <nav className="ds-tab-list ds-tab-list--horizontal accrual-detail__nav" aria-label="Sections">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`ds-tab accrual-detail__nav-item${activeSection === section.id ? " ds-tab--selected" : ""}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
                {section.id === "collaborate" && <span className="ds-tab__badge">{comments.length}</span>}
              </button>
            ))}
          </nav>
        }
      />

      <ModalBody ref={bodyRef} className="accrual-detail__body">
        <section id="confidence" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Confidence</h3>
          <div className="accrual-detail__confidence">
            <GaugeChart value={confidence.score} label="Percent" size="xl" />
            <ul className="accrual-detail__confidence-factors">
              {confidence.factors.map((factor, index) => (
                <li
                  key={index}
                  className={`accrual-detail__confidence-factor accrual-detail__confidence-factor--${factor.passed ? "passed" : "failed"}`}
                >
                  {factor.passed ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
                  <span>{factor.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="journal-entry" className="accrual-detail__section">
          <div className="accrual-detail__section-header">
            <h3 className="accrual-detail__section-title">Journal Entry</h3>
            <Label status={jeStatusLabelStatus}>{jeStatusLabel}</Label>
          </div>
          <div className="accrual-detail__journal-card">
            <JournalEntry
              aria-label={`Journal entry for ${vendorName} — ${glAccountName}`}
              value={journalValue}
              onSave={handleJournalSave}
              accountOptions={accountOptions}
              departmentOptions={departmentOptions}
              locationOptions={locationOptions}
            />
          </div>
          {related.length > 0 && (
            <div className="accrual-detail__related-accounts">
              <h4 className="accrual-detail__related-accounts-title">Also coded to {glAccountName} for {vendorName}</h4>
              <ul className="accrual-detail__related-accounts-list">
                {related.map((sibling) => (
                  <li key={sibling.id} className="accrual-detail__related-accounts-item">
                    <span>{dimensionValueName("subsidiary", sibling.subsidiaryId)}</span>
                    <span>{accrualCurrency.format(sibling.forecast)} forecast</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section id="history" className="accrual-detail__section">
          <div className="accrual-detail__section-header">
            <h3 className="accrual-detail__section-title">History</h3>
            <SegmentedControl value={historyView} onValueChange={setHistoryView} size="sm">
              <SegmentedControlOption value="chart">Chart</SegmentedControlOption>
              <SegmentedControlOption value="table">Table</SegmentedControlOption>
            </SegmentedControl>
          </div>
          {historyView === "chart" ? (
            <BarChart variant="stacked" data={historyChartData} series={HISTORY_SERIES} height={220} />
          ) : (
            <div className="accrual-detail__history-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col" />
                    {history.map((point) => (
                      <th key={point.category} scope="col">
                        {point.category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY_SERIES.map((series) => (
                    <tr key={series.key}>
                      <th scope="row">{series.label}</th>
                      {history.map((point) => (
                        <td key={point.category}>{accrualCurrency.format(point.values[series.key as keyof typeof point.values])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="evidence" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Evidence History</h3>
          <div className="accrual-detail__evidence-table">
            <Column header={<Cell type="columnHead">Evidence</Cell>} width={160}>
              {EVIDENCE_TYPES.map((type) => (
                <Cell key={type} type="text">
                  {type}
                </Cell>
              ))}
            </Column>
            {ACCRUAL_HISTORY_MONTHS.map((month, monthIndex) => (
              <Column key={month} header={<Cell type="columnHead">{month}</Cell>}>
                {EVIDENCE_TYPES.map((type) => {
                  const Icon = EVIDENCE_ICONS[type];
                  const hasEvidence = monthIndex < coverage[type];
                  return (
                    <Cell key={type} type="slot">
                      {hasEvidence ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button type="button" className="accrual-detail__evidence-icon" aria-label={`${type} for ${month} — open actions`}>
                              <Icon size={16} aria-hidden />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem leadingIcon={<Eye size={16} />} onClick={() => showToast({ status: "info", title: "Previewing evidence isn't designed yet" })}>
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem leadingIcon={<Download size={16} />} onClick={() => showToast({ status: "info", title: "Downloading evidence isn't designed yet" })}>
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem leadingIcon={<Trash2 size={16} />} onClick={() => showToast({ status: "negative", title: "Deleting evidence isn't designed yet" })}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <IconButton
                          icon={<Plus size={16} />}
                          aria-label={`Add ${type} for ${month}`}
                          variant="ghost"
                          size="sm"
                          className="accrual-detail__evidence-add"
                          onClick={() => showToast({ status: "info", title: "Uploading evidence isn't designed yet" })}
                        />
                      )}
                    </Cell>
                  );
                })}
              </Column>
            ))}
          </div>
        </section>

        <section id="collaborate" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Collaborate</h3>

          <div className="accrual-detail__collaborate-to">
            <span className="accrual-detail__collaborate-to-label">To:</span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                {assignee ? (
                  <button type="button" className="accrual-detail__assignee">
                    <Avatar size="xs" name={assignee.name} />
                    <span>{assignee.name}</span>
                  </button>
                ) : (
                  <Button variant="secondary" size="sm" leadingIcon={<UserPlus size={16} />}>
                    Assign
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ACCRUAL_TEAMMATES.map((teammate) => (
                  <DropdownMenuItem
                    key={teammate.name}
                    leadingIcon={<Avatar size="xs" name={teammate.name} />}
                    active={teammate.name === assignee?.name}
                    onClick={() => {
                      setAssignee(teammate);
                      showToast({ status: "positive", title: `Assigned to ${teammate.name}` });
                    }}
                  >
                    {teammate.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {comments.length === 0 ? (
            <div className="accrual-detail__comments-empty">
              <MessagesSquare size={24} aria-hidden />
              <p className="accrual-detail__comments-empty-title">No comments yet</p>
              <p className="accrual-detail__comments-empty-text">Share your thoughts with team</p>
            </div>
          ) : (
            <div className="accrual-detail__comments">
              {comments.map((comment) => (
                <div key={comment.id} className="accrual-detail__comment">
                  <p className="accrual-detail__comment-bubble">{comment.text}</p>
                  <span className="accrual-detail__comment-meta">
                    {comment.author} · {comment.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form className="accrual-detail__comment-form" onSubmit={handleSendComment}>
            <textarea
              className="accrual-detail__comment-input"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendComment(event);
                }
              }}
              placeholder="Comment on this accrual..."
              rows={1}
            />
            <IconButton type="submit" variant="primary" size="md" icon={<ArrowUp size={24} />} aria-label="Send comment" disabled={!commentDraft.trim()} />
          </form>
        </section>
      </ModalBody>

      <ModalFooter secondaryAction={<Button variant="link" onClick={() => showToast({ status: "info", title: "Not designed yet" })}>Tertiary</Button>}>
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              showToast({ status: "positive", title: "Submitted" });
              onClose();
            }}
          >
            Submit
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
