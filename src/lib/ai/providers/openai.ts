import type { AIProviderCallArgs, AIProviderResult } from "@/lib/ai/types";
import type { ModelMessage } from "ai";
import { generateText, Output, jsonSchema } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const toModelMessages = (
  messages: AIProviderCallArgs["messages"],
): ModelMessage[] =>
  messages.map((m) => ({ role: m.role, content: m.content }));

export const callOpenAI = async (
  args: AIProviderCallArgs,
): Promise<AIProviderResult> => {
  const {
    apiKey,
    model,
    messages,
    maxOutputTokens,
    responseFormat,
    timeoutMs,
  } = args;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const openai = createOpenAI({ apiKey });
    const result = await generateText({
      model: openai.chat(model),
      messages: toModelMessages(messages),
      maxOutputTokens,
      output: responseFormat
        ? Output.object({
            schema: jsonSchema(responseFormat.schema),
            name: responseFormat.name,
            description: responseFormat.description,
          })
        : undefined,
      providerOptions: {
        openai: {
          strictJsonSchema: true,
        },
      },
      abortSignal: controller.signal,
    });

    const text =
      result.text?.trim?.() ||
      (responseFormat ? JSON.stringify(result.output) : "");
    if (!text) throw new Error("OpenAI returned an empty response");

    return {
      text,
      usage: result.totalUsage
        ? (result.totalUsage as unknown as Record<string, unknown>)
        : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
};
