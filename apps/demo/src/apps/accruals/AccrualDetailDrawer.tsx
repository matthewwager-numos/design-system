import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp, MessagesSquare, Sparkles, UserPlus } from "lucide-react";
import { Button, ButtonGroup, DetailHeader, FileUpload, IconButton, JournalEntry, Modal, ModalBody, ModalFooter, useScrollSpy } from "@numosai/ui";
import type { JournalEntryValue, SelectOption } from "@numosai/ui";
import { ACCRUAL_DIMENSION_VALUES, accrualCurrency, dimensionValueName, findLineItem, lineItemReasoning } from "../../data/accruals";
import type { AccrualLineItem } from "../../data/accruals";
import { useToast } from "../../toast/ToastProvider";

interface DrawerComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface DrawerDocument {
  id: string;
  filename: string;
}

let nextCommentId = 1;
let nextDocumentId = 1;

function timestamp(): string {
  return "Today " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const SECTIONS = [
  { id: "reasoning", label: "Reasoning" },
  { id: "journal-entry", label: "Journal Entry" },
  { id: "documents", label: "Documents" },
  { id: "collaborate", label: "Collaborate" },
];

export interface AccrualDetailDrawerProps {
  /** `null` closes the drawer — its own transition still plays out since `<Modal>` stays mounted for that duration. */
  lineItemId: string | null;
  onClose: () => void;
}

/**
 * The Object Detail drawer for an individual accrual entry — one posting
 * from the Table tab's own pivot (`ACCRUAL_LINE_ITEMS`), the intersection
 * of whichever primary-key row and breakdown row were clicked, never the
 * rollup/group row itself. Matches Figma's Drawer template: a
 * `<DetailHeader>` whose `tabs` slot is a scroll-spy nav (`useScrollSpy`),
 * not real `<Tabs>`, since all four sections below are always mounted in
 * one continuously-scrolling `<ModalBody>` rather than switched panels.
 * Reasoning/Journal Entry/Documents/Collaborate are real, working sections
 * (not static mockups) — the "Collaborate" comment thread mirrors
 * `AssistantPanel`'s own chat UI (message bubbles, auto-growing textarea +
 * send button) but with local, human-authored comments, not an AI reply —
 * Figma's own empty-state copy ("Assign to a teammate and share your
 * comments") frames this as team collaboration, not an assistant.
 */
export function AccrualDetailDrawer({ lineItemId, onClose }: AccrualDetailDrawerProps) {
  const lineItem = lineItemId ? findLineItem(lineItemId) : undefined;

  return (
    <Modal variant="drawer" side="right" open={lineItem !== undefined} onOpenChange={(open) => !open && onClose()}>
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

  const [documents, setDocuments] = useState<DrawerDocument[]>(() => [
    { id: `doc-${nextDocumentId++}`, filename: "Purchase Order" },
    { id: `doc-${nextDocumentId++}`, filename: "Purchase Order" },
  ]);

  const [comments, setComments] = useState<DrawerComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");

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
        debit: lineItem.accrualAmount,
      },
      {
        id: `${lineItem.id}-credit`,
        account: "accrued-liabilities",
        department: lineItem.departmentId,
        location: lineItem.locationId,
        memo: `Accrual: ${vendorName} — ${subsidiaryName}`,
        credit: lineItem.accrualAmount,
      },
    ],
  }));

  function handleJournalSave(next: JournalEntryValue) {
    setJournalValue(next);
    showToast({ status: "positive", title: "Saved journal entry" });
  }

  function handleFilesSelected(files: FileList) {
    const additions = Array.from(files).map((file) => ({ id: `doc-${nextDocumentId++}`, filename: file.name }));
    setDocuments((prev) => [...prev, ...additions]);
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
        title={vendorName}
        meta={[subsidiaryName, departmentName, locationName, glAccountName]}
        actions={<span className="accrual-detail__amount">{accrualCurrency.format(lineItem.accrualAmount)}</span>}
        onClose={onClose}
        tabs={
          <nav className="ds-tab-list ds-tab-list--horizontal accrual-detail__nav" aria-label="Sections">
            {SECTIONS.map((section) => {
              const count = section.id === "documents" ? documents.length : section.id === "collaborate" ? comments.length : 0;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`ds-tab accrual-detail__nav-item${activeSection === section.id ? " ds-tab--selected" : ""}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                  {count > 0 && <span className="ds-tab__badge">{count}</span>}
                </button>
              );
            })}
          </nav>
        }
      />

      <ModalBody ref={bodyRef} className="accrual-detail__body">
        <section id="reasoning" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Reasoning</h3>
          <div className="accrual-detail__reasoning">
            <Sparkles size={16} className="accrual-detail__reasoning-icon" aria-hidden />
            <div className="accrual-detail__reasoning-content">
              <p className="accrual-detail__reasoning-title">Detection &amp; Explanation</p>
              <p className="accrual-detail__reasoning-text">{lineItemReasoning(lineItem)}</p>
            </div>
          </div>
        </section>

        <section id="journal-entry" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Journal Entry</h3>
          <JournalEntry
            aria-label={`Journal entry for ${vendorName} — ${glAccountName}`}
            value={journalValue}
            onSave={handleJournalSave}
            accountOptions={accountOptions}
            departmentOptions={departmentOptions}
            locationOptions={locationOptions}
          />
        </section>

        <section id="documents" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Documents</h3>
          <div className="accrual-detail__documents">
            {documents.map((doc) => (
              <FileUpload
                key={doc.id}
                variant="link"
                state="complete"
                filename={doc.filename}
                onRemove={() => setDocuments((prev) => prev.filter((candidate) => candidate.id !== doc.id))}
              />
            ))}
            <FileUpload variant="dropzone" multiple onFilesSelected={handleFilesSelected} />
          </div>
        </section>

        <section id="collaborate" className="accrual-detail__section">
          <h3 className="accrual-detail__section-title">Collaborate</h3>

          {comments.length === 0 ? (
            <div className="accrual-detail__comments-empty">
              <MessagesSquare size={24} aria-hidden />
              <p className="accrual-detail__comments-empty-title">No comments yet</p>
              <p className="accrual-detail__comments-empty-text">Assign to a teammate and share your comments</p>
              <Button
                variant="secondary"
                leadingIcon={<UserPlus size={16} />}
                onClick={() => showToast({ status: "info", title: "Assigning isn't designed yet" })}
              >
                Assign
              </Button>
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
              placeholder="Share a comment...."
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
              showToast({ status: "positive", title: "Approved" });
              onClose();
            }}
          >
            Approve
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
