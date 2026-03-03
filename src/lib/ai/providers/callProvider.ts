import type {
  AIProviderCallArgs,
  AIProviderName,
  AIProviderResult,
} from "@/lib/ai/types";
import { callOpenAI } from "@/lib/ai/providers/openai";
import { callOpenRouter } from "@/lib/ai/providers/openrouter";

export const callProvider = async (
  provider: AIProviderName,
  args: AIProviderCallArgs,
): Promise<AIProviderResult> => {
  if (provider === "openai") return callOpenAI(args);
  if (provider === "openrouter") return callOpenRouter(args);
  throw new Error("Unsupported provider");
};
