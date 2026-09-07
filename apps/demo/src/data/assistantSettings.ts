export interface AssistantSettings {
  /** An OpenRouter API key (openrouter.ai/keys) — stored only in this browser's own localStorage, sent only as an Authorization header directly to openrouter.ai, never anywhere else. Empty by default: without one, the panel just gives its canned reply, matching every other demo interaction in this app. */
  apiKey: string;
  /** An OpenRouter model id (e.g. "meta-llama/llama-3.1-8b-instruct:free") — free-text rather than a fixed list, since OpenRouter's catalog changes over time; see openrouter.ai/models for current options. */
  model: string;
}

const STORAGE_KEY = "numosai-demo:assistant-settings";

const DEFAULT_SETTINGS: AssistantSettings = { apiKey: "", model: "" };

function isCurrentSettings(value: unknown): value is AssistantSettings {
  return typeof value === "object" && value !== null && typeof (value as AssistantSettings).apiKey === "string" && typeof (value as AssistantSettings).model === "string";
}

export function loadAssistantSettings(): AssistantSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return isCurrentSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAssistantSettings(settings: AssistantSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
