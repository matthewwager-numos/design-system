import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Paperclip } from "lucide-react";
import { Accordion, AccordionItem, Avatar, Banner, Button, ButtonGroup, Checkbox, FileUpload, Header, Modal, ModalFooter, Textarea, Toggle } from "@numosai/ui";
import type { CollectActionItem, CollectActionThreadMessage, CollectBulkAction } from "../../data/collectActions";
import { useToast } from "../../toast/ToastProvider";
import { ListDetailRow } from "../../components/ListDetailRow";

export interface BulkActionModalProps {
  /** `null` closes the modal. */
  action: CollectBulkAction | null;
  onClose: () => void;
  /** Fires the first time each customer is focused (clicked or arrow-key'd to) — lets `WorkTab` show review progress on the referring Task without this modal knowing anything about how that's displayed. */
  onItemRead: (actionId: string, itemId: string) => void;
  /** Fires once the bulk send actually goes out. */
  onSent: (actionId: string) => void;
}

/** A collapsed thread message's own head — same layout Notifications' own thread rows use (avatar, name over a truncated snippet, timestamp + attachment indicator flush right). */
function ThreadMessageHead({ message }: { message: CollectActionThreadMessage }) {
  return (
    <span className="notification-thread-row">
      <Avatar name={message.author} size="sm" />
      <span className="notification-thread-row__text">
        <span className="notification-thread-row__author">{message.author}</span>
        <span className="notification-thread-row__snippet">{message.text}</span>
      </span>
      <span className="notification-thread-row__meta">
        <span className="notification-thread-row__timestamp">{message.timestamp}</span>
        {message.attachment ? <Paperclip size={14} className="notification-thread-row__attachment-icon" aria-hidden /> : null}
      </span>
    </span>
  );
}

/**
 * The full-screen List & Detail review modal a Collect Task opens into.
 * Reuses the same `<ListDetailRow>` every List & Detail widget in this demo
 * shares, plus Notifications' own thread/reply visual language (see
 * app.css), with deliberate differences for this "review a prescribed bulk
 * action" context rather than "browse an inbox":
 *
 * 1. The header's own × (`<Header variant="modal" onClose>`) is the only
 *    close affordance — there's no separate close button inside the detail
 *    pane, since dismissing "the item you're previewing" and dismissing
 *    "the whole review" are the same action here.
 * 2. The detail pane always shows something (defaults to the first item) —
 *    there's no "nothing focused" state to design for, so no width-
 *    transition/slide animation is needed either.
 * 3. The select-all/count row is pinned to the top of the list pane and its
 *    rows scroll beneath it, rather than sitting above the whole panel.
 * 4. Because the detail pane has no close of its own, Escape and Enter get
 *    new jobs here instead of "close the detail"/"open a row that's
 *    already open": Escape closes the whole modal, Enter submits the send.
 * 5. Opens with every customer already selected, not none — this is a
 *    prescribed action being reviewed for exclusions, not an inbox being
 *    triaged from zero.
 */
export function BulkActionModal({ action, onClose, onItemRead, onSent }: BulkActionModalProps) {
  // Keeps rendering the last real action's content through the modal's own
  // close transition — clearing straight to `null` the instant `action`
  // becomes null would blank the content out before the panel finishes
  // fading/scaling away.
  const [lastAction, setLastAction] = useState<CollectBulkAction | null>(null);
  useEffect(() => {
    if (action) setLastAction(action);
  }, [action]);

  return (
    <Modal variant="fullscreen" open={action !== null} onOpenChange={(open) => !open && onClose()}>
      {lastAction && <BulkActionModalContent key={lastAction.id} action={lastAction} onClose={onClose} onItemRead={onItemRead} onSent={onSent} />}
    </Modal>
  );
}

interface BulkActionModalContentProps {
  action: CollectBulkAction;
  onClose: () => void;
  onItemRead: (actionId: string, itemId: string) => void;
  onSent: (actionId: string) => void;
}

function BulkActionModalContent({ action, onClose, onItemRead, onSent }: BulkActionModalContentProps) {
  const [items, setItems] = useState<CollectActionItem[]>(action.items);
  // Opens with everyone included — reviewing this prescribed action for who
  // to *exclude*, not triaging an inbox up from nothing selected.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(action.items.map((item) => item.id)));
  const [focusedId, setFocusedId] = useState<string>(action.items[0]!.id);
  // The first item is already focused (its detail is showing) the instant
  // this mounts, so it starts out read too — reported to `onItemRead` on
  // mount below, same as any other row becoming focused.
  const [readIds, setReadIds] = useState<Set<string>>(new Set([action.items[0]!.id]));
  const [dismissedSummaries, setDismissedSummaries] = useState<Set<string>>(new Set());
  const showToast = useToast();
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Only on mount — every subsequent read is reported from `focusItem` itself.
  useEffect(() => {
    onItemRead(action.id, action.items[0]!.id);
  }, []);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const focusedItem = items.find((item) => item.id === focusedId)!;

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(event: ChangeEvent<HTMLInputElement>) {
    setSelectedIds(event.target.checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  /** The first time a customer is focused (click or arrow-key nav), it's marked read locally (for the row's own title weight/color) and reported up so the referring Task can show review progress. */
  function focusItem(id: string) {
    setFocusedId(id);
    if (!readIds.has(id)) {
      setReadIds((prev) => new Set(prev).add(id));
      onItemRead(action.id, id);
    }
  }

  function updateReplyDraft(id: string, text: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, replyDraft: text } : item)));
  }

  function removeAttachment(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, attachment: undefined } : item)));
  }

  function send() {
    const count = selectedIds.size;
    if (count === 0) return;
    showToast({ status: "positive", title: `Sent ${count} ${count === 1 ? action.noun.replace(/s$/, "") : action.noun}` });
    onSent(action.id);
    onClose();
  }

  /** Up/Down move DOM focus to the neighboring row, whose own `onFocus` (see `ListDetailRow`) does the rest. Tab toggles the focused row's own checkbox — same convention Notifications' Inbox uses. Escape and Enter differ from that inbox on purpose: this modal's detail pane has no close of its own, so Escape closes the whole review and Enter submits it, rather than either one acting on a single row. */
  function handleRowKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number, id: string) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        rowRefs.current[index + 1]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        rowRefs.current[index - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "Enter":
        event.preventDefault();
        send();
        break;
      case "Tab":
        event.preventDefault();
        toggleSelected(id);
        break;
      default:
        break;
    }
  }

  return (
    <div className="bulk-action-modal">
      <Header variant="modal" className="bulk-action-modal__header" title={`Send ${selectedIds.size} ${action.noun}`} onClose={onClose} />
      <p className="bulk-action-modal__subtitle">Review each customer and choose who to include, then send.</p>

      <div className="bulk-action-modal__body">
        <div className="bulk-action-list-pane">
          <div className="bulk-action-list-pane__toolbar">
            <Checkbox checked={allSelected} indeterminate={someSelected} onChange={selectAll} aria-label="Select all" />
            <span className="notifications-toolbar__count">
              {selectedIds.size} of {items.length} selected
            </span>
          </div>
          <div className="bulk-action-list-pane__rows">
            {items.map((item, index) => (
              <ListDetailRow
                key={item.id}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                id={item.id}
                title={item.customer}
                description={item.reference}
                read={readIds.has(item.id)}
                focused={item.id === focusedId}
                checked={selectedIds.has(item.id)}
                onCheckChange={() => toggleSelected(item.id)}
                onFocusRow={() => focusItem(item.id)}
                onKeyDown={(event) => handleRowKeyDown(event, index, item.id)}
              />
            ))}
          </div>
        </div>

        <div className="bulk-action-detail-pane">
          <div className="notification-detail__header">
            <div className="notification-detail__titles">
              <p className="notification-detail__title">{focusedItem.customer}</p>
              <p className="notification-detail__subtitle">{focusedItem.reference}</p>
            </div>
            <Toggle
              label="Include in bulk action"
              labelPlacement="left"
              size="md"
              checked={selectedIds.has(focusedItem.id)}
              onChange={() => toggleSelected(focusedItem.id)}
            />
          </div>

          <div className="notification-detail__body">
            {!dismissedSummaries.has(focusedItem.id) && (
              <Banner
                status="info"
                title="AI Summary"
                description={focusedItem.description}
                onDismiss={() => setDismissedSummaries((prev) => new Set(prev).add(focusedItem.id))}
              />
            )}

            <Accordion exclusive>
              {focusedItem.thread.map((message) => (
                <AccordionItem key={message.id} className="notification-thread-item" title={<ThreadMessageHead message={message} />}>
                  <p className="notification-thread-item__full-text">{message.text}</p>
                </AccordionItem>
              ))}

              <AccordionItem
                className="notification-reply-item"
                defaultExpanded
                title={
                  <span className="notification-reply-item__head">
                    <Avatar name="Matthew Wager" size="sm" />
                    <span className="notification-reply-item__lines">
                      <span className="notification-reply-item__line">To: {focusedItem.customer}</span>
                      <span className="notification-reply-item__line">Re: {action.noun}</span>
                    </span>
                  </span>
                }
              >
                <div className="notification-reply">
                  <Textarea
                    className="notification-reply__textarea"
                    value={focusedItem.replyDraft}
                    onChange={(event) => updateReplyDraft(focusedItem.id, event.target.value)}
                    rows={6}
                    aria-label="Reply"
                  />
                  {focusedItem.attachment && (
                    <span className="notification-attachment">
                      <Paperclip size={16} className="notification-attachment__icon" aria-hidden />
                      <FileUpload
                        variant="link"
                        state="complete"
                        filename={focusedItem.attachment}
                        onRemove={() => removeAttachment(focusedItem.id)}
                        className="notification-attachment__upload"
                      />
                    </span>
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <ModalFooter>
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={send} disabled={selectedIds.size === 0}>
            Send {selectedIds.size} {selectedIds.size === 1 ? action.noun.replace(/s$/, "") : action.noun}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </div>
  );
}
