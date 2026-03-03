import type { AIProviderCallArgs, AIProviderResult } from "@/lib/ai/types";
import { generateText, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const parseCitations = (
  citations: unknown,
): Array<{ url: string; title?: string }> => {
  if (!citations || !Array.isArray(citations)) return [];

  return citations
    .map((citation) => {
      if (typeof citation === "string") return { url: citation };
      if (citation && typeof citation === "object") {
        const rec = citation as Record<string, unknown>;
        const url = typeof rec.url === "string" ? rec.url : undefined;
        const title = typeof rec.title === "string" ? rec.title : undefined;
        return url ? { url, title } : null;
      }
      return null;
    })
    .filter((v): v is { url: string; title?: string } => Boolean(v));
};

const toModelMessages = (messages: AIProviderCallArgs["messages"]): ModelMessage[] =>
  messages.map((m) => ({ role: m.role, content: m.content }));

const extractTextFromContent = (content: unknown): string => {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const rec = part as Record<string, unknown>;
      if (rec.type !== "text" || typeof rec.text !== "string") return "";
      return rec.text;
    })
    .join("\n")
    .trim();
};

const extractTextFromResponseMessages = (messages: unknown): string => {
  if (!Array.isArray(messages)) return "";

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (!msg || typeof msg !== "object") continue;
    const rec = msg as Record<string, unknown>;
    if (rec.role !== "assistant") continue;
    const text = extractTextFromContent(rec.content);
    if (text) return text;
  }

  return "";
};

const extractTextFromRawProviderJson = (raw: unknown): string => {
  if (!raw || typeof raw !== "object") return "";
  const rec = raw as Record<string, unknown>;
  if (!Array.isArray(rec.choices)) return "";

  for (const choice of rec.choices) {
    if (!choice || typeof choice !== "object") continue;
    const choiceRec = choice as Record<string, unknown>;
    const message =
      choiceRec.message && typeof choiceRec.message === "object"
        ? (choiceRec.message as Record<string, unknown>)
        : null;
    if (!message) continue;
    const text = extractTextFromContent(message.content);
    if (text) return text;
  }

  return "";
};

export const callOpenRouter = async (
  args: AIProviderCallArgs,
): Promise<AIProviderResult> => {
  const { apiKey, model, messages, temperature, maxOutputTokens, timeoutMs } = args;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let lastResponseJson: unknown = null;

  try {
    const openrouter = createOpenRouter({
      apiKey,
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        response
          .clone()
          .json()
          .then((json) => {
            lastResponseJson = json;
          })
          .catch(() => null);
        return response;
      },
    });

    const result = await generateText({
      model: openrouter(model),
      messages: toModelMessages(messages),
      temperature,
      maxOutputTokens,
      abortSignal: controller.signal,
    });

    let text = result.text?.trim?.() ?? "";
    if (!text) {
      text = extractTextFromResponseMessages(result.response?.messages);
    }
    if (!text) {
      text = extractTextFromRawProviderJson(lastResponseJson);
    }
    if (!text) {
      throw new Error("OpenRouter returned an empty response");
    }

    const citations = parseCitations(
      lastResponseJson && typeof lastResponseJson === "object"
        ? (lastResponseJson as Record<string, unknown>).citations
        : undefined,
    );

    return {
      text,
      citations: citations.length ? citations : undefined,
      usage: result.totalUsage
        ? (result.totalUsage as unknown as Record<string, unknown>)
        : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
};
