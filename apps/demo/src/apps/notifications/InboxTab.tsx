import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { ArrowLeft, Paperclip, X } from "lucide-react";
import { Accordion, AccordionItem, Avatar, Banner, Button, ButtonGroup, Checkbox, FileUpload, ModalFooter, Pagination, Textarea, Toggle } from "@numosai/ui";
import { NOTIFICATIONS } from "../../data/notifications";
import type { NotificationItem, NotificationThreadMessage } from "../../data/notifications";
import { useToast } from "../../toast/ToastProvider";
import { ListDetailRow } from "../../components/ListDetailRow";

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
        <span className="notification-thread-row__timestamp">{message.timestamp}</span>
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
 */
export function InboxTab() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [dismissedSummaries, setDismissedSummaries] = useState<Set<string>>(new Set());
  const showToast = useToast();
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  /** Focusing a row only previews it — checking a box (or the detail's own "Include" toggle) is a separate, deliberate action for the bulk footer, never a side effect of looking. Viewing the detail is what marks it read, same as any email client. */
  function focusItem(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    setFocusedId(id);
    setMobileView("detail");
  }

  function clearFocus() {
    setFocusedId(null);
    setMobileView("list");
  }

  /** The footer's own Cancel — abandons the pending bulk action entirely (unlike the detail pane's X, which only clears focus off one item but leaves the rest of the selection intact). */
  function cancelSelection() {
    setSelectedIds(new Set());
    clearFocus();
  }

  function updateReplyDraft(id: string, text: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, replyDraft: text } : item)));
  }

  function removeAttachment(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, attachment: undefined } : item)));
  }

  function sendReplies() {
    const count = selectedIds.size;
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, read: true } : item)));
    showToast({ status: "positive", title: `Sent ${count} ${count === 1 ? "reply" : "replies"}` });
    setSelectedIds(new Set());
    clearFocus();
  }

  return (
    <div className="page page--fill-height page--full-width notifications-page">
      <div className="notifications-toolbar">
        <div className="notifications-toolbar__left">
          <Checkbox checked={allSelected} indeterminate={someSelected} onChange={selectAll} aria-label="Select all notifications" />
          <span className="notifications-toolbar__count">
            {selectedIds.size > 0 ? `${selectedIds.size} of ${items.length} selected` : `${items.length} Messages`}
          </span>
        </div>
        <Pagination totalPages={1} />
      </div>

      <div className="notifications-panel-shadow">
        <div className="notifications-panel">
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
                        <span className="list-detail-row__timestamp">{item.timestamp}</span>
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
                  <Button
                    variant="link"
                    size="sm"
                    leadingIcon={<ArrowLeft size={16} />}
                    className="notifications-back"
                    onClick={() => setMobileView("list")}
                  >
                    Messages
                  </Button>

                  <div className="notification-detail__header">
                    <div className="notification-detail__heading">
                      <button type="button" className="notification-detail__close" onClick={clearFocus} aria-label="Close">
                        <X size={16} />
                      </button>
                      <div className="notification-detail__titles">
                        <p className="notification-detail__title">{focusedItem.title}</p>
                        <p className="notification-detail__subtitle">{focusedItem.reference}</p>
                      </div>
                    </div>
                    <Toggle
                      label="Include"
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
                        </div>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Always mounted — a grid `fr`-unit height animation (same
              technique `<Accordion>`'s own panel uses) driven purely by
              whether anything is checked, independent of whether a detail
              happens to be open. */}
          <div className={`notifications-footer-track${selectedIds.size > 0 ? " notifications-footer-track--open" : ""}`}>
            <div className="notifications-footer-track__inner">
              <ModalFooter>
                <ButtonGroup>
                  <Button variant="secondary" onClick={cancelSelection}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={sendReplies} disabled={selectedIds.size === 0}>
                    Send {selectedIds.size} {selectedIds.size === 1 ? "reply" : "replies"}
                  </Button>
                </ButtonGroup>
              </ModalFooter>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
