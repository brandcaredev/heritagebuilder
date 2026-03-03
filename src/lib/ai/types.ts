export type AIProviderName = "openai" | "openrouter";

export type AIGenerateRequest = {
  collection: string;
  docId: string;
  locale: string;
  fieldPath: string;
  additionalInstructions?: string;
};

export type AIGenerateResponse = {
  provider: AIProviderName;
  model: string;
  text?: string;
  citations?: Array<{ url: string; title?: string }>;
  usage?: Record<string, unknown>;
  warnings?: string[];
  renderedPrompt?: string;
  missingVariables?: string[];
};

export type AIChatMessage = {
  role: "system" | "user";
  content: string;
};

export type AIProviderCallArgs = {
  apiKey: string;
  model: string;
  messages: AIChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs: number;
};

export type AIProviderResult = {
  text: string;
  citations?: Array<{ url: string; title?: string }>;
  usage?: Record<string, unknown>;
};

export type AITemplateDoc = {
  id: string | number;
  enabled?: boolean;
  provider: AIProviderName;
  model: string;
  systemPrompt?: string | null;
  userPromptTemplate: string;
  supportsCitations?: boolean | null;
  maxOutputTokens?: number | null;
  temperature?: number | null;
  allowedCollections?: string[] | null;
  allowedFieldPaths?: string[] | null;
};
