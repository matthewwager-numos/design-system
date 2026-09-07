import type { AssistantSettings } from "./assistantSettings";

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Calls OpenRouter's own OpenAI-compatible chat completions endpoint
 * directly from the browser — no backend of any kind in this demo, so the
 * key travels straight from whoever's using this page to openrouter.ai and
 * nowhere else. `history` should be the full conversation so far (mapped
 * to `{role, content}` pairs), oldest first, ending with the newest user
 * message — OpenRouter (like any OpenAI-shaped chat API) has no memory of
 * its own between requests.
 */
export async function fetchAssistantReply(settings: AssistantSettings, history: AssistantChatMessage[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: history,
      // Without a cap, OpenRouter defaults to the model's own max output
      // (e.g. 65536 for some models) — far more than a chat reply in this
      // panel needs, and enough to get rejected outright on a low credit
      // balance ("can only afford N tokens") before the model ever runs.
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let detail = body;
    try {
      detail = JSON.parse(body)?.error?.message ?? body;
    } catch {
      // Not JSON — use the raw body as-is.
    }
    throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 300) || response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The model returned an empty response.");
  }
  return content;
}
