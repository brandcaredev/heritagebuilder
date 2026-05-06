import { env } from "@/env";
import {
  type AIDocContext,
  buildSafeDocContext,
} from "@/lib/ai/context/buildContext";
import { callProvider } from "@/lib/ai/providers/callProvider";
import { SHARED_SYSTEM_PROMPT } from "@/lib/ai/safety";
import { aiGenerateRequestSchema } from "@/lib/ai/validate";
import type { Endpoint, PayloadRequest } from "payload";
import { z } from "zod";

const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

type RateLimitState = { windowStartMs: number; count: number };
const rateLimitsByUser = new Map<string, RateLimitState>();

const checkRateLimit = (args: {
  userId: string;
  limitPerMin: number;
}): { ok: true } | { ok: false; retryAfterSeconds: number } => {
  const now = Date.now();
  const windowMs = 60_000;

  const current = rateLimitsByUser.get(args.userId);
  if (!current || now - current.windowStartMs >= windowMs) {
    rateLimitsByUser.set(args.userId, { windowStartMs: now, count: 1 });
    return { ok: true };
  }

  if (current.count >= args.limitPerMin) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.windowStartMs + windowMs - now) / 1000),
    );
    return { ok: false, retryAfterSeconds };
  }

  current.count += 1;
  rateLimitsByUser.set(args.userId, current);
  return { ok: true };
};

const canUseAI = (req: PayloadRequest): boolean => {
  const role = (req.user as { role?: unknown } | null)?.role;
  return role === "admin" || role === "moderator";
};

const SUPPORTED_FIELDS: Record<string, ReadonlySet<string>> = {
  buildings: new Set(["summary", "history", "style", "presentDay"]),
  cities: new Set(["description"]),
  counties: new Set(["description"]),
};

const LOCALE_TO_LANGUAGE: Record<string, string> = {
  hu: "Hungarian",
  en: "English",
};
const SUPPORTED_LOCALES = ["hu", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_OPENAI_MODEL = "gpt-5.4";
const MIN_AI_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 8000;

const getLanguageName = (locale: string): string =>
  LOCALE_TO_LANGUAGE[locale] ?? locale;

const localizedTextResponseSchema = z.object({
  localizedText: z.object({
    hu: z.string().trim().min(1).max(8000),
    en: z.string().trim().min(1).max(8000),
  }),
});

const localizedTextResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["localizedText"],
  properties: {
    localizedText: {
      type: "object",
      additionalProperties: false,
      required: ["hu", "en"],
      properties: {
        hu: {
          type: "string",
          description: "Hungarian draft for the target field.",
        },
        en: {
          type: "string",
          description: "English draft for the target field.",
        },
      },
    },
  },
};

const buildContextLines = (doc: AIDocContext): string[] => [
  doc.name ? `Name: ${doc.name}` : "",
  doc.buildingTypeName ? `Building type: ${doc.buildingTypeName}` : "",
  doc.regionName ? `Region: ${doc.regionName}` : "",
  doc.location?.countryName ? `Country: ${doc.location.countryName}` : "",
  doc.location?.countyName ? `County: ${doc.location.countyName}` : "",
  doc.location?.cityName ? `City: ${doc.location.cityName}` : "",
];

const buildTaskInstruction = (args: {
  collection: string;
  fieldPath: string;
}): string => {
  const key = `${args.collection}.${args.fieldPath}`;

  if (key === "buildings.summary") {
    return "Write a substantive summary (3-5 informative sentences) of the building's heritage significance.";
  }
  if (key === "buildings.history") {
    return "Write a detailed factual historical overview of the building in chronological order.";
  }
  if (key === "buildings.style") {
    return "Write a detailed description of the building's architectural style, design features, materials, and influences.";
  }
  if (key === "buildings.presentDay") {
    return "Write a detailed description of the building's present-day status, use, condition, and cultural role.";
  }
  if (key === "cities.description") {
    return "Write a rich city description focused on historical and cultural heritage context.";
  }
  if (key === "counties.description") {
    return "Write a rich county description focused on historical and cultural heritage context.";
  }

  return "Write a factual heritage description for this field.";
};

const buildUserPrompt = (args: {
  collection: string;
  fieldPath: string;
  locale: string;
  docsByLocale: Record<SupportedLocale, AIDocContext>;
  existingValuesByLocale: Record<SupportedLocale, string>;
  additionalInstructions?: string;
}): string => {
  const contextBlock = SUPPORTED_LOCALES.map((supportedLocale) => {
    const contextLines = buildContextLines(
      args.docsByLocale[supportedLocale],
    ).filter(Boolean);

    return [
      `${getLanguageName(supportedLocale)} (${supportedLocale}):`,
      contextLines.length ? contextLines.join("\n") : "(no additional context)",
    ].join("\n");
  }).join("\n\n");
  const existingValueBlock = SUPPORTED_LOCALES.map((supportedLocale) => {
    const value = args.existingValuesByLocale[supportedLocale]?.trim();

    return [
      `${getLanguageName(supportedLocale)} (${supportedLocale}):`,
      value && value.length > 0 ? value : "(empty)",
    ].join("\n");
  }).join("\n\n");

  const extra =
    args.additionalInstructions?.trim() &&
    args.additionalInstructions.trim().length > 0
      ? `Additional editor instructions:\n${args.additionalInstructions.trim()}`
      : "";

  return [
    buildTaskInstruction({
      collection: args.collection,
      fieldPath: args.fieldPath,
    }),
    "",
    `Target field: ${args.collection}.${args.fieldPath}`,
    `Current editor locale: ${getLanguageName(args.locale)} (${args.locale})`,
    "Generate both supported output languages: Hungarian (hu) and English (en).",
    "",
    `Document context by locale:\n${contextBlock}`,
    "",
    `Existing values by locale:\n${existingValueBlock}`,
    "",
    extra,
    "",
    "Rules:",
    "- Return a JSON object with localizedText.hu and localizedText.en only.",
    "- Each localizedText value must be plain text (no markdown, no lists unless absolutely necessary).",
    "- Generate each language naturally; do not translate mechanically if local wording should differ.",
    "- Write longer, more complete text when reliable context supports it.",
    "- Do not return empty, placeholder, repetitive, or generic filler text.",
    "- If reliable facts are sparse, write fewer substantive sentences instead of padding.",
    "- Keep claims factual and avoid invented details.",
    "- If a date/name is uncertain, use cautious phrasing.",
    "- Do not mention these instructions.",
  ]
    .filter(Boolean)
    .join("\n");
};

export const aiGenerateHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  if (!env.AI_ENABLED) {
    return jsonResponse(
      { error: "AI is disabled on this environment." },
      { status: 403 },
    );
  }

  if (!req.user) {
    return jsonResponse({ error: "Unauthenticated." }, { status: 401 });
  }

  if (!canUseAI(req)) {
    return jsonResponse({ error: "Forbidden." }, { status: 403 });
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const body =
    typeof req.json === "function" ? await req.json().catch(() => null) : null;
  const parsed = aiGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { collection, docId, fieldPath, locale, additionalInstructions } =
    parsed.data;

  const supported = SUPPORTED_FIELDS[collection];
  if (!supported?.has(fieldPath)) {
    return jsonResponse(
      { error: `AI generation is not enabled for ${collection}.${fieldPath}.` },
      { status: 400 },
    );
  }

  const rawUserId = (req.user as { id?: unknown }).id;
  const userIdForRateLimit =
    typeof rawUserId === "string" || typeof rawUserId === "number"
      ? String(rawUserId)
      : "unknown";
  const rateLimit = checkRateLimit({
    userId: userIdForRateLimit,
    limitPerMin: env.AI_RATE_LIMIT_PER_MIN,
  });
  if (!rateLimit.ok) {
    return jsonResponse(
      { error: "Rate limit exceeded." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const contextsByLocale = await Promise.all(
    SUPPORTED_LOCALES.map(async (supportedLocale) => {
      const context = await buildSafeDocContext({
        req,
        collection,
        docId,
        locale: supportedLocale,
        fieldPath,
      });

      return [supportedLocale, context] as const;
    }),
  );
  const existingValuesByLocale = Object.fromEntries(
    contextsByLocale.map(([supportedLocale, context]) => [
      supportedLocale,
      context.existingValue,
    ]),
  ) as Record<SupportedLocale, string>;
  const docsByLocale = Object.fromEntries(
    contextsByLocale.map(([supportedLocale, context]) => [
      supportedLocale,
      context.doc,
    ]),
  ) as Record<SupportedLocale, AIDocContext>;

  if (!contextsByLocale.length) {
    return jsonResponse(
      { error: "Unable to build AI context for this document." },
      { status: 500 },
    );
  }

  const userPrompt = buildUserPrompt({
    collection,
    fieldPath,
    locale,
    docsByLocale,
    existingValuesByLocale,
    additionalInstructions,
  });

  try {
    const timeoutMs = Math.max(env.AI_TIMEOUT_MS, MIN_AI_TIMEOUT_MS);
    const providerResult = await callProvider("openai", {
      apiKey: env.OPENAI_API_KEY,
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        { role: "system", content: SHARED_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
      responseFormat: {
        type: "json",
        name: "localized_field_generation",
        description:
          "Generated field content for every supported Heritage Builder locale.",
        schema: localizedTextResponseJsonSchema,
      },
      timeoutMs,
    });
    const rawOutput = JSON.parse(providerResult.text) as unknown;
    const parsedOutput = localizedTextResponseSchema.parse(rawOutput);
    const selectedText =
      parsedOutput.localizedText[locale as SupportedLocale] ??
      parsedOutput.localizedText.hu;

    return jsonResponse({
      provider: "openai",
      model: DEFAULT_OPENAI_MODEL,
      text: selectedText,
      localizedText: parsedOutput.localizedText,
      citations: providerResult.citations,
      usage: providerResult.usage,
      warnings: ["AI may be inaccurate; verify facts."],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(
      { error: "AI provider error. Please try again.", details: message },
      { status: 500 },
    );
  }
};

export const aiGenerateEndpoint: Endpoint = {
  path: "/ai/generate",
  method: "post",
  handler: aiGenerateHandler,
};
