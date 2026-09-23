import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronUp, Flag, Paperclip, X } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Banner,
  Button,
  ButtonGroup,
  Checkbox,
  FileUpload,
  IconButton,
  ModalFooter,
  Pagination,
  Textarea,
  Toggle,
  useMeasuredHeightVar,
} from "@numosai/ui";
import { NOTIFICATIONS } from "../../data/notifications";
import type { NotificationItem, NotificationThreadMessage } from "../../data/notifications";
import { useToast } from "../../toast/ToastProvider";
import { ListDetailRow } from "../../components/ListDetailRow";
import { Timestamp } from "../../components/Timestamp";

/** A collapsed thread message's own head — avatar, name over a truncated snippet, timestamp + attachment indicator flush right. */
function ThreadMessageHead({ message }: { message: NotificationThreadMessage }) {
  return (
    <span className="notification-thread-row">
      <Avatar name={message.author} size="sm" />
      <span className="notification-thread-row__text">
        <span className="notification-thread-row__author">{message.author}</span>
        <span className="notification-thread-row__snippet">{message.text}</span>
      </span>
      <span className="notification-thread-row__meta">
        <Timestamp date={message.timestamp} className="notification-thread-row__timestamp" />
        {message.attachment ? <Paperclip size={14} className="notification-thread-row__attachment-icon" aria-hidden /> : null}
      </span>
    </span>
  );
}

/**
 * The Inbox. A List & Detail widget, always one shared container that fills
 * the page's own height: the row list and the detail pane are both always
 * mounted (only the detail pane's *width* animates open/closed, same
 * squeeze technique `.app-shell__assistant` already uses — see app.css),
 * each scrolling independently, with a footer spanning both that slides
 * open the moment anything is checked (not tied to whether a detail happens
 * to be open) and slides shut again once nothing is.
 *
 * Two distinct, independent states per row, not one: "selected" (its
 * checkbox is checked — included in the footer's bulk action) and
 * "focused" (it's the one whose detail is currently shown — set by
 * clicking it or navigating to it with arrow keys, cleared with Escape).
 * Focus reuses the same light `--background-selected` row treatment rather
 * than a separate outline/ring — see `<ListDetailRow>`'s own doc comment
 * and `.list-detail-row--focused` in app.css, which also suppresses the
 * browser's own default focus ring so there's only one visual language for
 * "this is the one you're looking at."
 *
 * Modeled directly on a real email client's own split between per-item and
 * bulk actions: replying only ever makes sense for the one message you're
 * looking at (there's no such thing as one reply draft meaningfully sent to
 * several different people at once), so `sendReply` lives in the detail
 * pane and takes just that one item's id. Archive/flag/mark-as-read, by
 * contrast, are genuinely bulk-shaped — the footer's own three actions,
 * each folding the *whole* selection in one call.
 */
export function InboxTab() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [dismissedSummaries, setDismissedSummaries] = useState<Set<string>>(new Set());
  const showToast = useToast();
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // Scoped to `.notifications-page` (this component's own root), not the
  // whole document — this is local chrome, not app-wide like the mobile nav
  // bar/app header. Both the toolbar and the footer are `position: fixed`
  // on mobile (see app.css), out of flow, so whatever's meant to clear them
  // needs their real rendered height, not a guessed one — the toolbar's
  // varies with its own content, and the footer's varies between closed,
  // the bulk row, and the review row.
  const pageRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useMeasuredHeightVar<HTMLDivElement>("--notifications-toolbar-height", () => pageRef.current!);
  const footerRef = useMeasuredHeightVar<HTMLDivElement>("--notifications-footer-height", () => pageRef.current!);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const focusedItem = items.find((item) => item.id === focusedId) ?? null;

  /** Up/Down move DOM focus to the neighboring row, whose own `onFocus` (see `ListDetailRow`) does the rest — no need to also call `focusItem` here. Escape clears focus without needing to tab back to the detail's own × button. Tab toggles the focused row's own checkbox instead of leaving the list, since that's the one piece of per-row state a keyboard user would otherwise have no fast way to reach. */
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
        clearFocus();
        break;
      case "Tab":
        event.preventDefault();
        toggleSelected(id);
        break;
      default:
        break;
    }
  }

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

  /** Focusing a row only previews it — checking a box is a separate, deliberate action for the bulk footer, never a side effect of looking. Viewing the detail is what marks it read, same as any email client. */
  function focusItem(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    setFocusedId(id);
    setMobileView("detail");
  }

  function clearFocus() {
    setFocusedId(null);
    setMobileView("list");
  }

  /** Mobile-only footer affordance (see .notifications-footer-review) — on
      desktop the list is already visible beside the detail, so Up/Down on a
      row does the same job; on mobile the list is hidden while a detail is
      open, so this is the only way to move between items without going
      back to it first. */
  const focusedIndex = items.findIndex((item) => item.id === focusedId);
  function goToPrevious() {
    if (focusedIndex > 0) focusItem(items[focusedIndex - 1]!.id);
  }
  function goToNext() {
    if (focusedIndex !== -1 && focusedIndex < items.length - 1) focusItem(items[focusedIndex + 1]!.id);
  }

  function updateReplyDraft(id: string, text: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, replyDraft: text } : item)));
  }

  function removeAttachment(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, attachment: undefined } : item)));
  }

  /** Per-item, not bulk — see this file's own doc comment for why. Clears the draft after sending, same as any real reply box, so a second click can't resend the same text. */
  function sendReply(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true, replyDraft: "" } : item)));
    showToast({ status: "positive", title: "Reply sent" });
  }

  /** Archiving removes the item from the inbox entirely — there's no separate "Archived" view in this demo to move it to instead. If the item currently focused is among those archived, its detail pane would otherwise be left pointing at nothing. */
  function archiveSelected() {
    const count = selectedIds.size;
    if (count === 0) return;
    const losingFocus = focusedId !== null && selectedIds.has(focusedId);
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    showToast({ status: "positive", title: `Archived ${count} ${count === 1 ? "notification" : "notifications"}` });
    setSelectedIds(new Set());
    if (losingFocus) clearFocus();
  }

  function flagSelected() {
    const count = selectedIds.size;
    if (count === 0) return;
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, flagged: true } : item)));
    showToast({ status: "positive", title: `Flagged ${count} ${count === 1 ? "notification" : "notifications"}` });
    setSelectedIds(new Set());
  }

  function markSelectedRead() {
    const count = selectedIds.size;
    if (count === 0) return;
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, read: true } : item)));
    showToast({ status: "positive", title: `Marked ${count} ${count === 1 ? "notification" : "notifications"} as read` });
    setSelectedIds(new Set());
  }

  return (
    <div className="page page--fill-height page--full-width notifications-page" ref={pageRef} data-mobile-view={focusedItem ? mobileView : "list"}>
      <div className="notifications-toolbar" ref={toolbarRef}>
        <div className="notifications-toolbar__left">
          <Checkbox checked={allSelected} indeterminate={someSelected} onChange={selectAll} aria-label="Select all notifications" />
          <span className="notifications-toolbar__count">
            {selectedIds.size > 0 ? `${selectedIds.size} of ${items.length} selected` : `${items.length} Messages`}
          </span>
        </div>
        <Pagination totalPages={1} />
      </div>

      <div className="notifications-panel-shadow">
        <div className="notifications-panel" data-mobile-view={focusedItem ? mobileView : "list"}>
          <div className="notifications-panel__body" data-mobile-view={focusedItem ? mobileView : "list"}>
            <div className={`notifications-list-pane${focusedItem ? " notifications-list-pane--split" : ""}`}>
              {items.map((item, index) => (
                <ListDetailRow
                  key={item.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  read={item.read}
                  focused={item.id === focusedId}
                  checked={selectedIds.has(item.id)}
                  onCheckChange={() => toggleSelected(item.id)}
                  onFocusRow={() => focusItem(item.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, index, item.id)}
                  meta={
                    !focusedItem ? (
                      <>
                        {item.flagged ? <Flag size={14} className="list-detail-row__flag-icon" aria-hidden /> : null}
                        <Timestamp date={item.timestamp} className="list-detail-row__timestamp" />
                        {item.attachment ? <Paperclip size={14} className="list-detail-row__attachment-icon" aria-hidden /> : null}
                      </>
                    ) : undefined
                  }
                />
              ))}
            </div>

            {/* Always mounted (even with nothing focused) so its width can
                transition open/closed rather than popping in — mirrors
                `.app-shell__assistant`'s own squeeze panel. */}
            <div className={`notifications-detail-pane${focusedItem ? " notifications-detail-pane--open" : ""}`}>
              {focusedItem && (
                <>
                  <div className="notification-detail__header">
                    <div className="notification-detail__heading">
                      {/* Chevron-left (mobile) / X (desktop) — see the
                          matching pair of classes in app.css. Mobile reads
                          this as "back to the list"; desktop as "close the
                          detail" — both are the exact same action
                          (`clearFocus`), just the icon convention each
                          platform expects for it. */}
                      <button type="button" className="notification-detail__close" onClick={clearFocus} aria-label="Close">
                        <ChevronLeft size={16} className="notification-detail__close-icon notification-detail__close-icon--mobile" aria-hidden />
                        <X size={16} className="notification-detail__close-icon notification-detail__close-icon--desktop" aria-hidden />
                      </button>
                      <div className="notification-detail__titles">
                        <p className="notification-detail__title">{focusedItem.title}</p>
                        <p className="notification-detail__subtitle">{focusedItem.reference}</p>
                      </div>
                    </div>
                    {/* Desktop only — the list sits right beside this pane
                        with every checkbox visible, so this is just a
                        shortcut for the one piece of per-row state (see
                        ListDetailRow's own checkbox) worth reaching from
                        here too. On mobile it moves to the footer's own
                        review row instead (see .notifications-footer-review)
                        — the list is hidden there. */}
                    <Toggle
                      label="Select"
                      labelPlacement="left"
                      size="md"
                      className="notification-detail__include"
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
                              <span className="notification-reply-item__line">To: {focusedItem.actor}</span>
                              <span className="notification-reply-item__line">Re: {focusedItem.reference}</span>
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
                          {/* Per-item, not the footer — see this file's own
                              doc comment for why replying is never a bulk
                              action here. */}
                          <div className="notification-reply__actions">
                            <Button variant="primary" size="sm" onClick={() => sendReply(focusedItem.id)} disabled={!focusedItem.replyDraft.trim()}>
                              Send
                            </Button>
                          </div>
                        </div>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Always mounted — a grid `fr`-unit height animation (same
              technique `<Accordion>`'s own panel uses). `--open` (something's
              checked) opens this at any width; `--preview-open` (a detail is
              open) only does on mobile — see app.css. Two different rows
              share the track depending on which opened it: the bulk row
              (Archive/Mark as read/Flag) is what desktop always shows and
              what mobile shows back in list view; the review row (Select +
              prev/next) is mobile-only, replacing the bulk row while a
              detail is open there — see .notifications-footer-bulk/-review
              below for why those two never show at once on mobile. */}
          <div
            ref={footerRef}
            className={`notifications-footer-track${selectedIds.size > 0 ? " notifications-footer-track--open" : ""}${focusedItem ? " notifications-footer-track--preview-open" : ""}`}
          >
            <div className="notifications-footer-track__inner">
              {/* Standard footer shape, same as every other footer in this
                  demo (e.g. Collect's own bulk-action modal) — a plain link
                  button for the tertiary option on the left
                  (`secondaryAction`), primary + secondary right-aligned in
                  their own `<ButtonGroup>`. Not icon buttons: those read as
                  a generic toolbar, not this app's own established "footer
                  full of real buttons" language. */}
              <ModalFooter
                className="notifications-footer-bulk"
                secondaryAction={
                  <Button variant="link" onClick={flagSelected} disabled={selectedIds.size === 0}>
                    Flag
                  </Button>
                }
              >
                <ButtonGroup>
                  <Button variant="secondary" onClick={markSelectedRead} disabled={selectedIds.size === 0}>
                    Mark as read
                  </Button>
                  <Button variant="primary" onClick={archiveSelected} disabled={selectedIds.size === 0}>
                    Archive
                  </Button>
                </ButtonGroup>
              </ModalFooter>

              {focusedItem && (
                <div className="notifications-footer-review">
                  <div className="notifications-footer-review__include">
                    <Toggle checked={selectedIds.has(focusedItem.id)} onChange={() => toggleSelected(focusedItem.id)} label="Select" />
                    <span className="notifications-footer-review__count">({selectedIds.size} selected)</span>
                  </div>
                  <div className="notifications-footer-review__nav">
                    <span className="notifications-footer-review__position">
                      {focusedIndex + 1} of {items.length}
                    </span>
                    <div className="notifications-footer-review__chevrons">
                      <IconButton
                        icon={<ChevronUp size={20} />}
                        aria-label="Previous message"
                        variant="ghost"
                        size="md"
                        disabled={focusedIndex <= 0}
                        onClick={goToPrevious}
                      />
                      <IconButton
                        icon={<ChevronDown size={20} />}
                        aria-label="Next message"
                        variant="ghost"
                        size="md"
                        disabled={focusedIndex === -1 || focusedIndex >= items.length - 1}
                        onClick={goToNext}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
