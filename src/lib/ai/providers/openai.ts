import type { AIProviderCallArgs, AIProviderResult } from "@/lib/ai/types";
import type { ModelMessage } from "ai";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const toModelMessages = (messages: AIProviderCallArgs["messages"]): ModelMessage[] =>
  messages.map((m) => ({ role: m.role, content: m.content }));

export const callOpenAI = async (args: AIProviderCallArgs): Promise<AIProviderResult> => {
  const { apiKey, model, messages, temperature, maxOutputTokens, timeoutMs } = args;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const openai = createOpenAI({ apiKey });
    const result = await generateText({
      model: openai.chat(model),
      messages: toModelMessages(messages),
      temperature,
      maxOutputTokens,
      abortSignal: controller.signal,
    });

    const text = result.text?.trim?.() ?? "";
    if (!text) throw new Error("OpenAI returned an empty response");

    return {
      text,
      usage: result.totalUsage ? (result.totalUsage as unknown as Record<string, unknown>) : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
};
