import type { AIProviderCallArgs, AIProviderResult } from "@/lib/ai/types";
import { callOpenAI } from "@/lib/ai/providers/openai";

export const callProvider = async (
  _provider: "openai",
  args: AIProviderCallArgs,
): Promise<AIProviderResult> => callOpenAI(args);
