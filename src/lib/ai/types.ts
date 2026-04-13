export type AIProviderName = "openai";

export type AIGenerateRequest = {
  collection: string;
  docId: string;
  locale: string;
  fieldPath: string;
  additionalInstructions?: string;
};

export type LocalizedAIText = {
  hu: string;
  en: string;
};

export type MissingLocationTarget = "counties" | "cities" | "buildings";

export type MissingCountyProposal = {
  kind: "county";
  name: LocalizedAIText;
  description: LocalizedAIText;
};

export type MissingCityProposal = {
  kind: "city";
  name: LocalizedAIText;
  description: LocalizedAIText;
};

export type MissingBuildingProposal = {
  kind: "building";
  name: LocalizedAIText;
  buildingTypeId: string;
  summary: LocalizedAIText;
  history: LocalizedAIText;
  style: LocalizedAIText;
  presentDay: LocalizedAIText;
};

export type MissingLocationProposal =
  | MissingCountyProposal
  | MissingCityProposal
  | MissingBuildingProposal;

export type AIGenerateMissingCountiesPreviewRequest = {
  mode: "preview";
  countryId: string;
  count: number;
  additionalInstructions?: string;
};

export type AIGenerateMissingCountiesCreateRequest = {
  mode: "create";
  countryId: string;
  proposals: MissingCountyProposal[];
};

export type AIGenerateMissingCitiesPreviewRequest = {
  mode: "preview";
  countyId: string;
  count: number;
  additionalInstructions?: string;
};

export type AIGenerateMissingCitiesCreateRequest = {
  mode: "create";
  countyId: string;
  proposals: MissingCityProposal[];
};

export type AIGenerateMissingBuildingsPreviewRequest = {
  mode: "preview";
  cityId: string;
  count: number;
  additionalInstructions?: string;
};

export type AIGenerateMissingBuildingsCreateRequest = {
  mode: "create";
  cityId: string;
  proposals: MissingBuildingProposal[];
};

export type AIGenerateMissingLocationsPreviewResponse = {
  mode: "preview";
  target: MissingLocationTarget;
  proposals: MissingLocationProposal[];
  warnings?: string[];
  skipped?: Array<{ reason: string; proposal?: Record<string, unknown> }>;
  existingSummary: {
    countyCount?: number;
    cityCount?: number;
    buildingCount?: number;
  };
};

export type AIGenerateMissingLocationsCreateResponse = {
  mode: "create";
  target: MissingLocationTarget;
  createdCounties: Array<{ id: string; name: LocalizedAIText }>;
  createdCities: Array<{ id: string; name: LocalizedAIText }>;
  createdBuildings: Array<{ id: string; name: LocalizedAIText }>;
  warnings?: string[];
  skipped?: Array<{ reason: string; proposal?: Record<string, unknown> }>;
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

export type AIJSONResponseFormat = {
  type: "json";
  name: string;
  description?: string;
  schema: Record<string, unknown>;
};

export type AIProviderCallArgs = {
  apiKey: string;
  model: string;
  messages: AIChatMessage[];
  maxOutputTokens?: number;
  responseFormat?: AIJSONResponseFormat;
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
  allowedCollections?: string[] | null;
  allowedFieldPaths?: string[] | null;
};
