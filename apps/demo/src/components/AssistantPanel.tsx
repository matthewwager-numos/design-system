import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { Button, IconButton, Tab, TabList, Tabs, TextInput } from "@numosai/ui";
import { loadAssistantSettings, saveAssistantSettings } from "../data/assistantSettings";
import type { AssistantSettings } from "../data/assistantSettings";
import { fetchAssistantReply } from "../data/openRouterAssistant";
import { useToast } from "../toast/ToastProvider";

type AssistantTab = "new" | "history" | "settings";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

let nextMessageId = 1;

// Only used when no API key is configured (see useAssistantConversation's
// submitDraft) — the zero-config default so the panel still does
// *something* out of the box, matching every other demo interaction in
// this app. Reusing Figma's own sample copy since it's genuinely on-topic
// for this app's own domain (accruals), not filler text.
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
  const [settings, setSettings] = useState<AssistantSettings>(loadAssistantSettings);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSettings(next: AssistantSettings) {
    setSettings(next);
    saveAssistantSettings(next);
  }

  async function submitDraft() {
    const text = draft.trim();
    if (!text || pending) return;

    const userMessage: AssistantMessage = { id: String(nextMessageId++), role: "user", text, timestamp: timestamp() };
    const history = [...messages, userMessage];
    setMessages(history);
    setDraft("");
    setError(null);

    // No key configured — the zero-config demo experience, same canned
    // reply this panel always gave before real API wiring existed.
    if (!settings.apiKey.trim() || !settings.model.trim()) {
      setMessages((prev) => [...prev, { id: String(nextMessageId++), role: "assistant", text: CANNED_REPLY, timestamp: timestamp() }]);
      return;
    }

    setPending(true);
    try {
      const reply = await fetchAssistantReply(
        settings,
        history.map((message) => ({ role: message.role, content: message.text })),
      );
      setMessages((prev) => [...prev, { id: String(nextMessageId++), role: "assistant", text: reply, timestamp: timestamp() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong talking to the model.");
    } finally {
      setPending(false);
    }
  }

  return { tab, setTab, messages, draft, setDraft, submitDraft, settings, updateSettings, pending, error };
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
  const { tab, setTab, messages, draft, setDraft, submitDraft, settings, updateSettings, pending, error } = conversation;

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
                {pending && (
                  <div className="assistant-panel__message assistant-panel__message--assistant">
                    <p className="assistant-panel__pending" aria-live="polite">
                      Thinking…
                    </p>
                  </div>
                )}
                {error && (
                  <div className="assistant-panel__error" role="alert">
                    {error}
                  </div>
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
              disabled={pending}
            />
            <IconButton
              type="submit"
              variant="primary"
              size="md"
              icon={<ArrowUp size={24} />}
              aria-label="Send"
              disabled={!draft.trim() || pending}
            />
          </form>
        </>
      )}

      {tab === "history" && (
        <div className="assistant-panel__body assistant-panel__body--placeholder">
          <p>Past conversations will show up here.</p>
        </div>
      )}

      {tab === "settings" && <AssistantSettingsForm settings={settings} onSave={updateSettings} />}
    </div>
  );
}

interface AssistantSettingsFormProps {
  settings: AssistantSettings;
  onSave: (settings: AssistantSettings) => void;
}

/**
 * A real API key + model, not a placeholder — but deliberately not built
 * on `<SettingsCard>`/`<Setting>` like every other Settings tab in this
 * app: `Setting`'s read mode shows its value as plain text, which would
 * mean an API key sitting unmasked on screen. A bespoke form with a real
 * `type="password"` field is a better fit for a secret than stretching a
 * component built for ordinary display values.
 */
function AssistantSettingsForm({ settings, onSave }: AssistantSettingsFormProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const showToast = useToast();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ apiKey: apiKey.trim(), model: model.trim() });
    showToast({ status: "positive", title: "Assistant settings saved" });
  }

  return (
    <form className="assistant-panel__body assistant-panel__settings" onSubmit={handleSubmit}>
      <TextInput
        type="password"
        label="OpenRouter API key"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        placeholder="sk-or-..."
        helpText="Stored only in this browser's own local storage, sent only to openrouter.ai — never anywhere else. Get a free key at openrouter.ai/keys."
        autoComplete="off"
      />
      <TextInput
        label="Model"
        value={model}
        onChange={(event) => setModel(event.target.value)}
        placeholder="e.g. meta-llama/llama-3.1-8b-instruct:free"
        helpText="Any model id from openrouter.ai/models. Without a key, this panel just gives a single canned reply."
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
