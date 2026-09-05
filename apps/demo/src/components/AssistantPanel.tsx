import { useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { IconButton, Tab, TabList, Tabs } from "@numosai/ui";

type AssistantTab = "new" | "history" | "settings";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

let nextMessageId = 1;

// A single canned reply regardless of what's asked — there's no real model
// behind this panel, matching every other demo interaction in this app
// (fake, invented, no backend). Reusing Figma's own sample copy since it's
// genuinely on-topic for this app's own domain (accruals), not filler text.
const CANNED_REPLY =
  "Yes. Accruals are an important part of the monthly close, although “accrual” itself refers to an accounting concept rather than specifically to the close process. Under accrual accounting, revenue and expenses are recorded in the period in which they were earned or incurred, rather than simply when cash changes hands. For example, suppose a company uses AWS throughout April but won't receive the $50,000 invoice until May. At April 30:";

const EXAMPLE_CAPABILITIES = [
  "Filter with natural language",
  "Perform actions on selected items",
  "Analyze items for content or tone",
  "Create reports and presentations",
];

function timestamp(): string {
  return "Today " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * The panel's own chat state, lifted out of `AssistantPanel` itself and
 * called once, up in `App.tsx` — desktop (the squeeze panel) and mobile
 * (a full-screen `<Modal>`) each render their own `<AssistantPanel>`
 * instance so CSS alone can pick which one is actually visible per
 * breakpoint, the same way `.desktop-app-header`/`.mobile-app-header`
 * both stay mounted everywhere. If each instance owned this state itself,
 * resizing across the breakpoint mid-conversation would silently fork it
 * into two diverging copies; sharing one instance of this hook instead
 * means both renders always show the exact same conversation.
 */
export function useAssistantConversation() {
  const [tab, setTab] = useState<AssistantTab>("new");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: String(nextMessageId++), role: "user", text, timestamp: timestamp() },
      { id: String(nextMessageId++), role: "assistant", text: CANNED_REPLY, timestamp: timestamp() },
    ]);
    setDraft("");
  }

  return { tab, setTab, messages, draft, setDraft, submitDraft };
}

export type AssistantConversation = ReturnType<typeof useAssistantConversation>;

export interface AssistantPanelProps {
  onClose: () => void;
  conversation: AssistantConversation;
}

/**
 * The "Numos Assistant" chat panel — matches Figma's reference frames
 * (closed / open-empty / open-with-conversation). Lives here rather than
 * in `@numosai/ui`, same reasoning as `HistoryTimeline`: this is a
 * demo-level page template built from shared primitives (`IconButton`,
 * `Tabs`), not a new reusable design-system component.
 *
 * The header is bespoke markup, not `<Header variant="modal">`: that
 * variant's own doc comment states Figma's modal header has no icon slot,
 * but this panel's Figma frame shows one (the same sparkle-on-navy
 * treatment as the FAB that opens it) — stretching `variant="modal"` to
 * add an icon would contradict its documented, confirmed-from-Figma shape.
 */
export function AssistantPanel({ onClose, conversation }: AssistantPanelProps) {
  const { tab, setTab, messages, draft, setDraft, submitDraft } = conversation;

  return (
    <div className="assistant-panel">
      <div className="assistant-panel__header">
        <div className="assistant-panel__title-row">
          <span className="assistant-panel__icon" aria-hidden>
            <Sparkles size={24} />
          </span>
          <p className="assistant-panel__title">Numos Assistant</p>
          <button type="button" className="assistant-panel__close" onClick={onClose} aria-label="Close Numos Assistant">
            <X size={20} aria-hidden />
          </button>
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as AssistantTab)}>
          <TabList>
            <Tab value="new">New</Tab>
            <Tab value="history">History</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
        </Tabs>
      </div>

      {tab === "new" && (
        <>
          <div className="assistant-panel__body">
            {messages.length === 0 ? (
              <div className="assistant-panel__empty">
                <Sparkles size={24} aria-hidden />
                <p className="assistant-panel__empty-title">Ask anything...</p>
                <ul className="assistant-panel__capabilities">
                  {EXAMPLE_CAPABILITIES.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="assistant-panel__messages">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="assistant-panel__message assistant-panel__message--user">
                      <p className="assistant-panel__bubble">{message.text}</p>
                      <span className="assistant-panel__message-timestamp">{message.timestamp}</span>
                    </div>
                  ) : (
                    <div key={message.id} className="assistant-panel__message assistant-panel__message--assistant">
                      <p className="assistant-panel__reply">{message.text}</p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <form
            className="assistant-panel__footer"
            onSubmit={(event) => {
              event.preventDefault();
              submitDraft();
            }}
          >
            <textarea
              className="assistant-panel__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitDraft();
                }
              }}
              placeholder="Ask about anything...."
              rows={1}
            />
            <IconButton type="submit" variant="primary" size="md" icon={<ArrowUp size={24} />} aria-label="Send" disabled={!draft.trim()} />
          </form>
        </>
      )}

      {tab === "history" && (
        <div className="assistant-panel__body assistant-panel__body--placeholder">
          <p>Past conversations will show up here.</p>
        </div>
      )}

      {tab === "settings" && (
        <div className="assistant-panel__body assistant-panel__body--placeholder">
          <p>Assistant settings will show up here.</p>
        </div>
      )}
    </div>
  );
}
