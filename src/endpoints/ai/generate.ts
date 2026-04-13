import { env } from "@/env";
import {
  type AIDocContext,
  buildSafeDocContext,
} from "@/lib/ai/context/buildContext";
import { callProvider } from "@/lib/ai/providers/callProvider";
import { SHARED_SYSTEM_PROMPT } from "@/lib/ai/safety";
import { aiGenerateRequestSchema } from "@/lib/ai/validate";
import type { Endpoint, PayloadRequest } from "payload";

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

const DEFAULT_OPENAI_MODEL = "gpt-5.4-nano";
const MIN_AI_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 4800;

const getLanguageName = (locale: string): string =>
  LOCALE_TO_LANGUAGE[locale] ?? locale;

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
    return "Write a concise summary (2-4 sentences) of the building's heritage significance.";
  }
  if (key === "buildings.history") {
    return "Write a factual historical overview of the building in chronological order.";
  }
  if (key === "buildings.style") {
    return "Write about the building's architectural style, design features, materials, and influences.";
  }
  if (key === "buildings.presentDay") {
    return "Write about the building's present-day status, use, condition, and cultural role.";
  }
  if (key === "cities.description") {
    return "Write a city description focused on historical and cultural heritage context.";
  }
  if (key === "counties.description") {
    return "Write a county description focused on historical and cultural heritage context.";
  }

  return "Write a factual heritage description for this field.";
};

const buildUserPrompt = (args: {
  collection: string;
  fieldPath: string;
  locale: string;
  doc: AIDocContext;
  existingValue: string;
  additionalInstructions?: string;
}): string => {
  const contextLines = buildContextLines(args.doc).filter(Boolean);
  const existingValueBlock = args.existingValue.trim()
    ? `Existing value:\n${args.existingValue.trim()}`
    : "Existing value: (empty)";

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
    `Output language: ${getLanguageName(args.locale)} (${args.locale})`,
    "",
    contextLines.length ? `Document context:\n${contextLines.join("\n")}` : "",
    "",
    existingValueBlock,
    "",
    extra,
    "",
    "Rules:",
    "- Return plain text only (no markdown, no lists unless absolutely necessary).",
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

  const { doc, existingValue } = await buildSafeDocContext({
    req,
    collection,
    docId,
    locale,
    fieldPath,
  });

  const userPrompt = buildUserPrompt({
    collection,
    fieldPath,
    locale,
    doc,
    existingValue,
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
      timeoutMs,
    });

    return jsonResponse({
      provider: "openai",
      model: DEFAULT_OPENAI_MODEL,
      text: providerResult.text,
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
