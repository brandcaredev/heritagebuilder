import { Counties } from "@/collections/county";
import { env } from "@/env";
import { callProvider } from "@/lib/ai/providers/callProvider";
import { SHARED_SYSTEM_PROMPT } from "@/lib/ai/safety";
import type {
  LocalizedAIText,
  MissingBuildingProposal,
  MissingCityProposal,
  MissingCountyProposal,
  MissingLocationTarget,
} from "@/lib/ai/types";
import {
  aiGenerateMissingBuildingsRequestSchema,
  aiGenerateMissingCitiesRequestSchema,
  aiGenerateMissingCountiesRequestSchema,
  aiMissingBuildingsResponseJsonSchema,
  aiMissingBuildingsSelectionModelOutputSchema,
  aiMissingBuildingsSelectionResponseJsonSchema,
  aiMissingBuildingsModelOutputSchema,
  aiMissingCitiesResponseJsonSchema,
  aiMissingCitiesSelectionModelOutputSchema,
  aiMissingCitiesSelectionResponseJsonSchema,
  aiMissingCitiesModelOutputSchema,
  aiMissingCountiesResponseJsonSchema,
  aiMissingCountiesSelectionModelOutputSchema,
  aiMissingCountiesSelectionResponseJsonSchema,
  aiMissingCountiesModelOutputSchema,
} from "@/lib/ai/validate";
import { slugify } from "@/lib/utils";
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

const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const MIN_AI_TIMEOUT_MS = 180_000;
const MAX_PROPOSALS_PER_RUN = 5;
const SELECTION_MAX_OUTPUT_TOKENS = 1_500;
const DESCRIPTION_MAX_OUTPUT_TOKENS = 8_000;
const REPAIR_MAX_OUTPUT_TOKENS = 4_000;
const SHOULD_EXPOSE_AI_DEBUG = env.NODE_ENV === "development";

type CountyCodeOption = {
  label: string;
  value: string;
};

type ExistingLocalizedDoc = {
  id: string;
  name: LocalizedAIText;
};

type CountryContext = {
  countryId: string;
  countryCode: string;
  countryName: LocalizedAIText;
  counties: ExistingLocalizedDoc[];
  countyNameIndex: Map<string, string>;
};

type CountyContext = {
  countryId: string;
  countryName: LocalizedAIText;
  countyId: string;
  countyName: LocalizedAIText;
  cities: ExistingLocalizedDoc[];
  cityNameIndex: Map<string, string>;
};

type CityContext = {
  countryId: string;
  countryName: LocalizedAIText;
  countyId: string;
  countyName: LocalizedAIText;
  cityId: string;
  cityName: LocalizedAIText;
  buildings: ExistingLocalizedDoc[];
  buildingNameIndex: Map<string, string>;
  buildingTypes: ExistingLocalizedDoc[];
};

type SkipItem = { reason: string; proposal?: Record<string, unknown> };
type OutputBucket = "counties" | "cities" | "buildings";
type StructuredEntityType = "county" | "city" | "building";
type SelectionModelOutput = { selected_names: string[] };
type CountiesModelOutput = ReturnType<
  typeof aiMissingCountiesModelOutputSchema.parse
>;
type CitiesModelOutput = ReturnType<
  typeof aiMissingCitiesModelOutputSchema.parse
>;
type BuildingsModelOutput = ReturnType<
  typeof aiMissingBuildingsModelOutputSchema.parse
>;

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

const ensureAIRequestAllowed = (req: PayloadRequest): Response | null => {
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

  return null;
};

const normalizeName = (value: string): string => slugify(value.trim());

const trimLocalized = (value: LocalizedAIText): LocalizedAIText => ({
  hu: value.hu.trim(),
  en: value.en.trim(),
});

const adminAffixesByTarget: Record<
  MissingLocationTarget,
  { prefixes: string[]; suffixes: string[] }
> = {
  counties: {
    prefixes: [
      "county of",
      "county",
      "province of",
      "province",
      "comitatul",
      "comitat",
      "judetul",
      "judet",
      "megye",
    ],
    suffixes: [
      "county",
      "province",
      "comitatul",
      "comitat",
      "judetul",
      "judet",
      "megye",
    ],
  },
  cities: {
    prefixes: [
      "city of",
      "city",
      "municipality of",
      "municipality",
      "municipiul",
      "orasul",
      "oras",
      "varos",
      "town of",
      "town",
    ],
    suffixes: [
      "city",
      "municipality",
      "municipiul",
      "orasul",
      "oras",
      "varos",
      "town",
    ],
  },
  buildings: {
    prefixes: [],
    suffixes: [],
  },
};

const collapseSpaces = (value: string): string =>
  value
    .replace(/[\s_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sortStrings = (values: Iterable<string>): string[] =>
  Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right, "en", { sensitivity: "base" }),
  );

const stripAffixes = (value: string, target: MissingLocationTarget): string => {
  let next = value;
  let changed = true;

  while (changed) {
    changed = false;

    for (const prefix of adminAffixesByTarget[target].prefixes) {
      if (next.startsWith(`${prefix} `)) {
        next = next.slice(prefix.length + 1).trim();
        changed = true;
      }
    }

    for (const suffix of adminAffixesByTarget[target].suffixes) {
      if (next.endsWith(` ${suffix}`)) {
        next = next.slice(0, -(suffix.length + 1)).trim();
        changed = true;
      } else if (next === suffix) {
        next = "";
        changed = true;
      }
    }
  }

  return collapseSpaces(next);
};

const canonicalKeyFromString = (
  value: string,
  target: MissingLocationTarget,
): string => {
  const base = collapseSpaces(normalizeName(value).replace(/-/g, " "));
  if (!base) return "";

  return stripAffixes(base, target) || base;
};

const comparisonKeysFromString = (
  value: string,
  target: MissingLocationTarget,
): string[] => {
  const base = collapseSpaces(normalizeName(value).replace(/-/g, " "));
  if (!base) return [];

  const stripped = canonicalKeyFromString(value, target);
  return Array.from(new Set([base, stripped].filter(Boolean)));
};

const getCountyCodeOptions = (): CountyCodeOption[] => {
  const codeField = Counties.fields.find(
    (field) =>
      Boolean(field) &&
      typeof field === "object" &&
      "name" in field &&
      field.name === "code",
  ) as { options?: unknown } | undefined;

  if (!Array.isArray(codeField?.options)) return [];

  return codeField.options.flatMap((option: unknown) => {
    if (!option || typeof option !== "object") return [];

    const label =
      "label" in option && typeof option.label === "string"
        ? option.label.trim()
        : "";
    const value =
      "value" in option && typeof option.value === "string"
        ? option.value.trim()
        : "";

    return label && value ? [{ label, value }] : [];
  });
};

const getCountyOptionCountryCode = (
  option: CountyCodeOption,
): string | null => {
  if (option.value.startsWith("RO-")) return "RO";
  if (option.value.startsWith("RS-")) return "RS";
  if (option.value.startsWith("SK")) return "SK";
  if (
    option.label.endsWith("Oblast") ||
    option.value === "kiev" ||
    option.value === "kiev_city"
  ) {
    return "UA";
  }

  return null;
};

const countyCandidateUniverseByCountryCode = (() => {
  const byCountry = new Map<string, string[]>();

  for (const option of getCountyCodeOptions()) {
    const countryCode = getCountyOptionCountryCode(option);
    if (!countryCode) continue;

    const existing = byCountry.get(countryCode) ?? [];
    existing.push(option.label);
    byCountry.set(countryCode, existing);
  }

  return byCountry;
})();

const getCountyCandidateUniverse = (countryCode: string): string[] | null => {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  const universe = countyCandidateUniverseByCountryCode.get(
    normalizedCountryCode,
  );
  if (!universe?.length) return null;

  return sortStrings(universe);
};

const comparisonKeysFromName = (
  name: LocalizedAIText,
  target: MissingLocationTarget,
): string[] =>
  sortStrings(
    [name.hu, name.en]
      .flatMap((value) => comparisonKeysFromString(value, target))
      .filter(Boolean),
  );

const canonicalKeysFromName = (
  name: LocalizedAIText,
  target: MissingLocationTarget,
): string[] =>
  sortStrings(
    [name.hu, name.en]
      .map((value) => canonicalKeyFromString(value, target))
      .filter(Boolean),
  );

const addNameToIndex = (
  index: Map<string, string>,
  name: LocalizedAIText,
  id: string,
  target: MissingLocationTarget,
): void => {
  for (const key of comparisonKeysFromName(name, target)) {
    if (!index.has(key)) {
      index.set(key, id);
    }
  }
};

const hasExistingName = (
  index: Map<string, string>,
  name: LocalizedAIText,
  target: MissingLocationTarget,
): boolean =>
  comparisonKeysFromName(name, target).some((key) => index.has(key));

const markSeenName = (
  seen: Set<string>,
  name: LocalizedAIText,
  target: MissingLocationTarget,
): void => {
  for (const key of comparisonKeysFromName(name, target)) {
    seen.add(key);
  }
};

const hasSeenName = (
  seen: Set<string>,
  name: LocalizedAIText,
  target: MissingLocationTarget,
): boolean => comparisonKeysFromName(name, target).some((key) => seen.has(key));

const extractJSONCandidates = (raw: string): string[] => {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const candidates: string[] = [];
  if (withoutFence) candidates.push(withoutFence);

  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < withoutFence.length; i += 1) {
    const char = withoutFence[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inString && char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          candidates.push(withoutFence.slice(start, i + 1));
          start = -1;
        }
      }
    }
  }

  return Array.from(
    new Set(candidates.map((item) => item.trim()).filter(Boolean)),
  );
};

const extractArrayBlock = (
  raw: string,
  key: "counties" | "cities" | "buildings",
): string | null => {
  const keyIndex = raw.indexOf(`"${key}"`);
  if (keyIndex < 0) return null;

  const start = raw.indexOf("[", keyIndex);
  if (start < 0) return null;

  let inString = false;
  let escaped = false;
  let depth = 0;

  for (let i = start; i < raw.length; i += 1) {
    const char = raw[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inString && char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "[") {
      depth += 1;
      continue;
    }

    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return raw.slice(start);
};

const extractCompleteJSONObjectStrings = (raw: string): string[] => {
  const objects: string[] = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inString && char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          objects.push(raw.slice(start, i + 1));
          start = -1;
        }
      }
    }
  }

  return objects;
};

const parseJSONObjectStrings = (raw: string): unknown[] =>
  extractCompleteJSONObjectStrings(raw)
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

const salvageCandidateToModelOutput = <T>(args: {
  bucket: OutputBucket;
  candidate: string;
  schema: {
    parse: (value: unknown) => T;
    safeParse: (
      value: unknown,
    ) => { success: true; data: T } | { success: false };
  };
}): T | null => {
  const salvaged = {
    [args.bucket]: parseJSONObjectStrings(
      extractArrayBlock(args.candidate, args.bucket) ?? "[]",
    ),
  };

  const validated = args.schema.safeParse(salvaged);
  return validated.success ? validated.data : null;
};

const parseModelOutput = <T>(args: {
  bucket: OutputBucket;
  rawText: string;
  schema: {
    parse: (value: unknown) => T;
    safeParse: (
      value: unknown,
    ) =>
      | { success: true; data: T }
      | { success: false; error?: { issues?: unknown } };
  };
}): { ok: true; data: T } | { ok: false; details: string } => {
  const candidates = extractJSONCandidates(args.rawText);
  if (candidates.length === 0) {
    return {
      ok: false,
      details: "Model output did not include a JSON object.",
    };
  }

  let lastDetails = "Could not parse model output.";

  for (const candidate of [...candidates, args.rawText]) {
    let parsedJSON: unknown;
    try {
      parsedJSON = JSON.parse(candidate);
    } catch (error) {
      const salvaged = salvageCandidateToModelOutput({
        bucket: args.bucket,
        candidate,
        schema: args.schema,
      });
      if (salvaged) return { ok: true, data: salvaged };
      lastDetails =
        error instanceof Error ? error.message : "Invalid JSON output";
      continue;
    }

    const validated = args.schema.safeParse(parsedJSON);
    if (!validated.success) {
      const salvaged = salvageCandidateToModelOutput({
        bucket: args.bucket,
        candidate,
        schema: args.schema,
      });
      if (salvaged) return { ok: true, data: salvaged };
      lastDetails = JSON.stringify(validated.error?.issues ?? []);
      continue;
    }

    return { ok: true, data: validated.data };
  }

  return { ok: false, details: lastDetails };
};

const buildLexicalStateFromText = (
  text: string,
): Record<string, unknown> | null => {
  const chunks = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length === 0) return null;

  return {
    root: {
      type: "root",
      children: chunks.map((chunk) => ({
        type: "paragraph",
        children: [
          {
            type: "text",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: chunk,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
      })),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
};

const getDocName = (doc: unknown): string => {
  if (!doc || typeof doc !== "object") return "";
  const name = (doc as { name?: unknown }).name;
  return typeof name === "string" ? name.trim() : "";
};

const getDocStringField = (doc: unknown, field: string): string => {
  if (!doc || typeof doc !== "object") return "";

  const value = (doc as Record<string, unknown>)[field];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  return "";
};

const getDocId = (doc: unknown): string => {
  if (!doc || typeof doc !== "object") return "";
  const id = (doc as { id?: unknown }).id;
  if (typeof id === "string" || typeof id === "number") return String(id);
  return "";
};

const mergeLocalizedDocs = (args: {
  huDocs: unknown[];
  enDocs: unknown[];
}): ExistingLocalizedDoc[] => {
  const map = new Map<string, ExistingLocalizedDoc>();

  for (const row of args.huDocs) {
    const id = getDocId(row);
    if (!id) continue;
    const existing = map.get(id) ?? { id, name: { hu: "", en: "" } };
    existing.name.hu = getDocName(row);
    map.set(id, existing);
  }

  for (const row of args.enDocs) {
    const id = getDocId(row);
    if (!id) continue;
    const existing = map.get(id) ?? { id, name: { hu: "", en: "" } };
    existing.name.en = getDocName(row);
    map.set(id, existing);
  }

  return Array.from(map.values()).filter(
    (doc) => doc.name.hu.trim() || doc.name.en.trim(),
  );
};

const buildNameIndex = (
  rows: ExistingLocalizedDoc[],
  target: MissingLocationTarget,
): Map<string, string> => {
  const index = new Map<string, string>();

  for (const row of rows) {
    addNameToIndex(index, row.name, row.id, target);
  }

  return index;
};

const toPromptJSON = (value: unknown): string => JSON.stringify(value, null, 2);

const toPromptExistingEntities = (
  rows: ExistingLocalizedDoc[],
): Array<{ name: LocalizedAIText }> =>
  rows.map((row) => ({
    name: {
      hu: row.name.hu || "",
      en: row.name.en || "",
    },
  }));

const toPromptRelationshipOptions = (
  rows: ExistingLocalizedDoc[],
): Array<{ id: string; name: LocalizedAIText }> =>
  rows.map((row) => ({
    id: row.id,
    name: {
      hu: row.name.hu || "",
      en: row.name.en || "",
    },
  }));

const getForbiddenCanonicalKeys = (
  rows: ExistingLocalizedDoc[],
  target: MissingLocationTarget,
): string[] =>
  sortStrings(rows.flatMap((row) => canonicalKeysFromName(row.name, target)));

const getCountyAllowedCandidateInputs = (
  countryCode: string,
): { allowedCandidates: string[]; allowedCandidateKeys: string[] } => {
  // County uses the code-defined candidate list, unlike city/building.
  const allowedCandidates = getCountyCandidateUniverse(countryCode) ?? [];
  const allowedCandidateKeys = sortStrings(
    allowedCandidates
      .map((candidate) => canonicalKeyFromString(candidate, "counties"))
      .filter(Boolean),
  );

  return { allowedCandidates, allowedCandidateKeys };
};

const getRemainingCountyCandidateInputs = (args: {
  countryCode: string;
  forbiddenCanonicalKeys: string[];
}): { remainingCandidates: string[]; remainingCandidateKeys: string[] } => {
  // County filters missing options in code before the selection run.
  const { allowedCandidates } = getCountyAllowedCandidateInputs(
    args.countryCode,
  );
  const forbiddenSet = new Set(args.forbiddenCanonicalKeys);
  const remainingCandidates = allowedCandidates.filter((candidate) => {
    const candidateKey = canonicalKeyFromString(candidate, "counties");
    return candidateKey && !forbiddenSet.has(candidateKey);
  });

  return {
    remainingCandidates,
    remainingCandidateKeys: remainingCandidates
      .map((candidate) => canonicalKeyFromString(candidate, "counties"))
      .filter(Boolean),
  };
};

const loadCountryContext = async (args: {
  req: PayloadRequest;
  countryId: string;
}): Promise<CountryContext> => {
  const { req, countryId } = args;

  const [countryHu, countryEn, countiesHu, countiesEn] = await Promise.all([
    req.payload.findByID({
      collection: "countries",
      id: countryId,
      locale: "hu",
      depth: 0,
      req,
    }),
    req.payload.findByID({
      collection: "countries",
      id: countryId,
      locale: "en",
      depth: 0,
      req,
    }),
    req.payload.find({
      collection: "counties",
      locale: "hu",
      draft: true,
      pagination: false,
      limit: 0,
      where: { country: { equals: countryId } },
      select: { id: true, name: true },
      req,
    }),
    req.payload.find({
      collection: "counties",
      locale: "en",
      draft: true,
      pagination: false,
      limit: 0,
      where: { country: { equals: countryId } },
      select: { id: true, name: true },
      req,
    }),
  ]);

  const counties = mergeLocalizedDocs({
    huDocs: (countiesHu.docs ?? []) as unknown[],
    enDocs: (countiesEn.docs ?? []) as unknown[],
  });

  return {
    countryId,
    countryCode:
      getDocStringField(countryHu, "countryCode") ||
      getDocStringField(countryEn, "countryCode"),
    countryName: {
      hu: getDocName(countryHu),
      en: getDocName(countryEn),
    },
    counties,
    countyNameIndex: buildNameIndex(counties, "counties"),
  };
};

const loadCountyContext = async (args: {
  req: PayloadRequest;
  countyId: string;
}): Promise<CountyContext> => {
  const { req, countyId } = args;

  const [countyHu, countyEn, citiesHu, citiesEn] = await Promise.all([
    req.payload.findByID({
      collection: "counties",
      id: countyId,
      locale: "hu",
      depth: 1,
      req,
    }),
    req.payload.findByID({
      collection: "counties",
      id: countyId,
      locale: "en",
      depth: 1,
      req,
    }),
    req.payload.find({
      collection: "cities",
      locale: "hu",
      draft: true,
      pagination: false,
      limit: 0,
      where: { county: { equals: countyId } },
      select: { id: true, name: true },
      req,
    }),
    req.payload.find({
      collection: "cities",
      locale: "en",
      draft: true,
      pagination: false,
      limit: 0,
      where: { county: { equals: countyId } },
      select: { id: true, name: true },
      req,
    }),
  ]);

  const countyCountryHu =
    (
      countyHu as {
        country?: { id?: string | number; name?: string } | string | number;
      }
    ).country ?? null;
  const countyCountryEn =
    (
      countyEn as {
        country?: { id?: string | number; name?: string } | string | number;
      }
    ).country ?? null;

  const countryId =
    typeof countyCountryHu === "object" &&
    countyCountryHu &&
    "id" in countyCountryHu
      ? String(countyCountryHu.id)
      : typeof countyCountryHu === "string" ||
          typeof countyCountryHu === "number"
        ? String(countyCountryHu)
        : "";

  const cities = mergeLocalizedDocs({
    huDocs: (citiesHu.docs ?? []) as unknown[],
    enDocs: (citiesEn.docs ?? []) as unknown[],
  });

  return {
    countryId,
    countryName: {
      hu:
        typeof countyCountryHu === "object" && countyCountryHu
          ? getDocName(countyCountryHu)
          : "",
      en:
        typeof countyCountryEn === "object" && countyCountryEn
          ? getDocName(countyCountryEn)
          : "",
    },
    countyId,
    countyName: {
      hu: getDocName(countyHu),
      en: getDocName(countyEn),
    },
    cities,
    cityNameIndex: buildNameIndex(cities, "cities"),
  };
};

const loadCityContext = async (args: {
  req: PayloadRequest;
  cityId: string;
}): Promise<CityContext> => {
  const { req, cityId } = args;

  const [
    cityHu,
    cityEn,
    buildingsHu,
    buildingsEn,
    buildingTypesHu,
    buildingTypesEn,
  ] = await Promise.all([
    req.payload.findByID({
      collection: "cities",
      id: cityId,
      locale: "hu",
      depth: 2,
      req,
    }),
    req.payload.findByID({
      collection: "cities",
      id: cityId,
      locale: "en",
      depth: 2,
      req,
    }),
    req.payload.find({
      collection: "buildings",
      locale: "hu",
      draft: true,
      pagination: false,
      limit: 0,
      where: { city: { equals: cityId } },
      select: { id: true, name: true },
      req,
    }),
    req.payload.find({
      collection: "buildings",
      locale: "en",
      draft: true,
      pagination: false,
      limit: 0,
      where: { city: { equals: cityId } },
      select: { id: true, name: true },
      req,
    }),
    req.payload.find({
      collection: "building-types",
      locale: "hu",
      draft: true,
      pagination: false,
      limit: 0,
      select: { id: true, name: true },
      req,
    }),
    req.payload.find({
      collection: "building-types",
      locale: "en",
      draft: true,
      pagination: false,
      limit: 0,
      select: { id: true, name: true },
      req,
    }),
  ]);

  const cityCountryHu =
    (
      cityHu as {
        country?: { id?: string | number; name?: string } | string | number;
      }
    ).country ?? null;
  const cityCountryEn =
    (
      cityEn as {
        country?: { id?: string | number; name?: string } | string | number;
      }
    ).country ?? null;
  const cityCountyHu =
    (
      cityHu as {
        county?: { id?: string | number; name?: string } | string | number;
      }
    ).county ?? null;
  const cityCountyEn =
    (
      cityEn as {
        county?: { id?: string | number; name?: string } | string | number;
      }
    ).county ?? null;

  const countryId =
    typeof cityCountryHu === "object" && cityCountryHu && "id" in cityCountryHu
      ? String(cityCountryHu.id)
      : typeof cityCountryHu === "string" || typeof cityCountryHu === "number"
        ? String(cityCountryHu)
        : "";

  const countyId =
    typeof cityCountyHu === "object" && cityCountyHu && "id" in cityCountyHu
      ? String(cityCountyHu.id)
      : typeof cityCountyHu === "string" || typeof cityCountyHu === "number"
        ? String(cityCountyHu)
        : "";

  const buildings = mergeLocalizedDocs({
    huDocs: (buildingsHu.docs ?? []) as unknown[],
    enDocs: (buildingsEn.docs ?? []) as unknown[],
  });
  const buildingTypes = mergeLocalizedDocs({
    huDocs: (buildingTypesHu.docs ?? []) as unknown[],
    enDocs: (buildingTypesEn.docs ?? []) as unknown[],
  });

  return {
    countryId,
    countryName: {
      hu:
        typeof cityCountryHu === "object" && cityCountryHu
          ? getDocName(cityCountryHu)
          : "",
      en:
        typeof cityCountryEn === "object" && cityCountryEn
          ? getDocName(cityCountryEn)
          : "",
    },
    countyId,
    countyName: {
      hu:
        typeof cityCountyHu === "object" && cityCountyHu
          ? getDocName(cityCountyHu)
          : "",
      en:
        typeof cityCountyEn === "object" && cityCountyEn
          ? getDocName(cityCountyEn)
          : "",
    },
    cityId,
    cityName: {
      hu: getDocName(cityHu),
      en: getDocName(cityEn),
    },
    buildings,
    buildingNameIndex: buildNameIndex(buildings, "buildings"),
    buildingTypes,
  };
};

const LOCATIONS_SYSTEM_PROMPT = [
  SHARED_SYSTEM_PROMPT,
  "You generate structured geographic and heritage entities for a CMS.",
  "This is a machine-consumed task, not a chat task.",
  "Return ONLY one JSON object.",
  "Your first character must be { and your last character must be }.",
  "Do not include markdown, comments, code fences, prose, notes, explanations, or reasoning.",
  "Generate only real current entities that already exist in the real world.",
  "Never invent entities. If existence or classification is uncertain, omit the item.",
].join("\n");

const buildSelectionRepairSystemPrompt = (outputSchema: string): string =>
  [
    "You repair invalid JSON selection output for geographic entities.",
    "Return ONLY one valid JSON object with this exact shape:",
    outputSchema,
    "Do not include markdown or prose.",
  ].join("\n");

const buildDescriptionRepairSystemPrompt = (outputSchema: string): string =>
  [
    "You repair invalid JSON description output for geographic entities.",
    "Return ONLY one valid JSON object with this exact shape:",
    outputSchema,
    "Do not include markdown or prose.",
  ].join("\n");

const withAdditionalInstructions = (
  inputPayload: Record<string, unknown>,
  additionalInstructions?: string,
): Record<string, unknown> =>
  additionalInstructions?.trim()
    ? {
        ...inputPayload,
        additional_instructions: additionalInstructions.trim(),
      }
    : inputPayload;

const buildStructuredPrompt = (args: {
  inputPayload: Record<string, unknown>;
  outputSchema: string;
  taskSteps: string[];
  writingGuidance: string[];
}): string =>
  [
    "INPUT JSON",
    toPromptJSON(args.inputPayload),
    "",
    "CANONICALIZATION SUMMARY",
    "Canonical keys are lowercase, trimmed, whitespace-collapsed, accent/punctuation normalized, and generic type words are removed where applicable.",
    "",
    "TASK STEPS",
    ...args.taskSteps,
    "",
    "OUTPUT SCHEMA",
    args.outputSchema,
    "",
    "WRITING GUIDANCE",
    ...args.writingGuidance,
  ].join("\n");

const buildCountySelectionPrompt = (args: {
  context: CountryContext;
  count: number;
  remainingCandidates: string[];
  remainingCandidateKeys: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "county",
        parent_region:
          args.context.countryName.en ||
          args.context.countryName.hu ||
          "(unknown country)",
        target_count: args.count,
        remaining_candidates: args.remainingCandidates,
        remaining_candidate_keys: args.remainingCandidateKeys,
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. This is a names-only selection task.",
      "2. The valid missing county names are already provided in `remaining_candidates`.",
      "3. Copy up to `target_count` names from `remaining_candidates` into `selected_names`.",
      "4. Do not add, replace, reorder, or substitute names.",
      "5. Do not write descriptions.",
      "6. Return valid JSON only.",
    ],
    outputSchema: '{"selected_names":["..."]}',
    writingGuidance: ["Keep names exactly as provided."],
  });

const buildCountyDescriptionPrompt = (args: {
  context: CountryContext;
  selectedNames: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "county",
        parent_region:
          args.context.countryName.en ||
          args.context.countryName.hu ||
          "(unknown country)",
        selected_names: args.selectedNames,
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. Generate localized records only for the provided `selected_names`.",
      "2. Set each `name.en` to the exact selected name at the same index.",
      "3. Generate records only for these exact selected names. Do not add, remove, replace, merge, split, translate into a different entity, or reorder entity names.",
      "4. The output entities must correspond exactly to the provided selected names.",
      "5. Return valid JSON only.",
    ],
    outputSchema:
      '{"counties":[{"name":{"hu":"...","en":"..."},"description":{"hu":"...","en":"..."}}]}',
    writingGuidance: [
      "Write factual current descriptions only.",
      "Write longer descriptions with about 10-15 informative sentences when reliable details exist.",
      "If the available facts do not support that length, stay factual and use fewer sentences.",
      "Prefer concrete current details over generic filler.",
    ],
  });

const buildCitySelectionPrompt = (args: {
  context: CountyContext;
  count: number;
  forbiddenCanonicalKeys: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "city",
        parent_region: [
          args.context.countyName.en ||
            args.context.countyName.hu ||
            "(unknown county)",
          args.context.countryName.en ||
            args.context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        target_count: args.count,
        existing_entities: toPromptExistingEntities(args.context.cities),
        forbidden_canonical_keys: args.forbiddenCanonicalKeys,
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. This is a names-only candidate selection task.",
      "2. Select up to `target_count` real current populated place names in the parent region.",
      "3. Cities, towns, villages, and other small settlements are allowed if they have enough reliable information.",
      "4. Return names only in `selected_names`.",
      "5. Do not include duplicates.",
      "6. Do not include names whose canonical key is in `forbidden_canonical_keys`.",
      "7. Do not write descriptions.",
      "8. Return valid JSON only.",
    ],
    outputSchema: '{"selected_names":["..."]}',
    writingGuidance: ["Use conventional English names."],
  });

const buildCityDescriptionPrompt = (args: {
  context: CountyContext;
  selectedNames: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "city",
        parent_region: [
          args.context.countyName.en ||
            args.context.countyName.hu ||
            "(unknown county)",
          args.context.countryName.en ||
            args.context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        selected_names: args.selectedNames,
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. Generate localized records only for the provided `selected_names`.",
      "2. Set each `name.en` to the exact selected name at the same index.",
      "3. Generate records only for these exact selected names. Do not add, remove, replace, merge, split, translate into a different entity, or reorder entity names.",
      "4. The output entities must correspond exactly to the provided selected names.",
      "5. The selected names may be cities, towns, villages, or other small settlements. Keep the same entity type as implied by each selected name.",
      "6. Return valid JSON only.",
    ],
    outputSchema:
      '{"cities":[{"name":{"hu":"...","en":"..."},"description":{"hu":"...","en":"..."}}]}',
    writingGuidance: [
      "Write factual current descriptions only.",
      "Write longer descriptions with about 10-15 informative sentences when reliable details exist.",
      "If the available facts do not support that length, stay factual and use fewer sentences.",
      "Prefer concrete current details over generic filler.",
    ],
  });

const buildBuildingSelectionPrompt = (args: {
  context: CityContext;
  count: number;
  forbiddenCanonicalKeys: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "building",
        parent_region: [
          args.context.cityName.en ||
            args.context.cityName.hu ||
            "(unknown city)",
          args.context.countyName.en ||
            args.context.countyName.hu ||
            "(unknown county)",
          args.context.countryName.en ||
            args.context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        target_count: args.count,
        existing_entities: toPromptExistingEntities(args.context.buildings),
        forbidden_canonical_keys: args.forbiddenCanonicalKeys,
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. This is a names-only candidate selection task.",
      "2. Select up to `target_count` real current building names in the parent region.",
      "3. Return names only in `selected_names`.",
      "4. Do not include duplicates.",
      "5. Do not include names whose canonical key is in `forbidden_canonical_keys`.",
      "6. Do not write descriptions.",
      "7. Return valid JSON only.",
    ],
    outputSchema: '{"selected_names":["..."]}',
    writingGuidance: ["Use conventional English names."],
  });

const buildBuildingDescriptionPrompt = (args: {
  context: CityContext;
  selectedNames: string[];
  additionalInstructions?: string;
}): string =>
  buildStructuredPrompt({
    inputPayload: withAdditionalInstructions(
      {
        entity_type: "building",
        parent_region: [
          args.context.cityName.en ||
            args.context.cityName.hu ||
            "(unknown city)",
          args.context.countyName.en ||
            args.context.countyName.hu ||
            "(unknown county)",
          args.context.countryName.en ||
            args.context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        selected_names: args.selectedNames,
        building_types: toPromptRelationshipOptions(args.context.buildingTypes),
      },
      args.additionalInstructions,
    ),
    taskSteps: [
      "1. Generate localized records only for the provided `selected_names`.",
      "2. Set each `name.en` to the exact selected name at the same index.",
      "3. Generate records only for these exact selected names. Do not add, remove, replace, merge, split, translate into a different entity, or reorder entity names.",
      "4. The output entities must correspond exactly to the provided selected names.",
      "5. Choose the most appropriate existing building type for each building and set `buildingTypeId` to that exact id from `building_types`.",
      "6. Do not invent new building types or ids.",
      "7. Return valid JSON only.",
    ],
    outputSchema:
      '{"buildings":[{"name":{"hu":"...","en":"..."},"buildingTypeId":"...","summary":{"hu":"...","en":"..."},"history":{"hu":"...","en":"..."},"style":{"hu":"...","en":"..."},"presentDay":{"hu":"...","en":"..."}}]}',
    writingGuidance: [
      "`summary` should be a fuller overview, around 4-6 informative sentences when reliable details exist.",
      "Write `history`, `style`, and `presentDay` with about 10-15 informative sentences each when reliable details exist.",
      "If the available facts do not support that length, stay factual and use fewer sentences.",
      "Prefer concrete current details over generic filler.",
    ],
  });

const buildSelectionRepairPrompt = (args: {
  details: string;
  entityType: StructuredEntityType;
  invalidOutput: string;
  inputPayload: Record<string, unknown>;
  outputSchema: string;
}): string =>
  [
    `Repair the invalid ${args.entityType} selection response.`,
    `Validation error: ${args.details}`,
    "Use only the provided input JSON.",
    `Input JSON: ${toPromptJSON(args.inputPayload)}`,
    `Output schema: ${args.outputSchema}`,
    "Previous response:",
    args.invalidOutput.slice(0, 20_000),
  ].join("\n");

const buildDescriptionRepairPrompt = (args: {
  details: string;
  entityType: StructuredEntityType;
  invalidOutput: string;
  outputSchema: string;
  selectedNames: string[];
}): string =>
  [
    `Repair the invalid ${args.entityType} description response.`,
    `Validation error: ${args.details}`,
    `selected_names: ${toPromptJSON(args.selectedNames)}`,
    "Generate records only for these exact selected names. Do not add, remove, replace, merge, split, translate into a different entity, or reorder entity names.",
    "The output entities must correspond exactly to the provided selected names.",
    `Output schema: ${args.outputSchema}`,
    "Previous response:",
    args.invalidOutput.slice(0, 20_000),
  ].join("\n");

const hasMissingLocalizedText = (value: LocalizedAIText): boolean =>
  Boolean((value.hu && !value.en) || (!value.hu && value.en));

const hasMissingLocalizedCountyFields = (data: CountiesModelOutput): boolean =>
  data.counties.some(
    (county) =>
      hasMissingLocalizedText(county.name) ||
      hasMissingLocalizedText(county.description),
  );

const hasMissingLocalizedCityFields = (data: CitiesModelOutput): boolean =>
  data.cities.some(
    (city) =>
      hasMissingLocalizedText(city.name) ||
      hasMissingLocalizedText(city.description),
  );

const hasMissingLocalizedBuildingFields = (
  data: BuildingsModelOutput,
): boolean =>
  data.buildings.some(
    (building) =>
      !building.buildingTypeId.trim() ||
      hasMissingLocalizedText(building.name) ||
      hasMissingLocalizedText(building.summary) ||
      hasMissingLocalizedText(building.history) ||
      hasMissingLocalizedText(building.style) ||
      hasMissingLocalizedText(building.presentDay),
  );

const validateSelectionModelOutput = (args: {
  bucket: OutputBucket;
  data: SelectionModelOutput;
  entityType: StructuredEntityType;
  forbiddenCanonicalKeys: string[];
  remainingCandidateKeys?: string[];
  remainingCandidates?: string[];
  targetCount: number;
}):
  | { ok: true; data: SelectionModelOutput }
  | { ok: false; details: string } => {
  const selectedNames = args.data.selected_names.map((name) => name.trim());

  if (selectedNames.length > args.targetCount) {
    return {
      ok: false,
      details: `Response exceeded target_count for ${args.entityType}.`,
    };
  }

  const forbiddenSet = new Set(args.forbiddenCanonicalKeys);
  const remainingSet = args.remainingCandidateKeys
    ? new Set(args.remainingCandidateKeys)
    : null;
  const seenKeys = new Set<string>();

  for (const selectedName of selectedNames) {
    if (!selectedName) {
      return {
        ok: false,
        details: `selected_names contains an empty value for ${args.entityType}.`,
      };
    }

    const selectedKey = canonicalKeyFromString(selectedName, args.bucket);
    if (!selectedKey) {
      return {
        ok: false,
        details: `selected_names contains an empty canonical key for ${args.entityType}.`,
      };
    }

    if (seenKeys.has(selectedKey)) {
      return {
        ok: false,
        details: `Duplicate canonical key detected for ${args.entityType}.`,
      };
    }

    if (forbiddenSet.has(selectedKey)) {
      return {
        ok: false,
        details: `selected_names contains a forbidden canonical key for ${args.entityType}.`,
      };
    }

    if (remainingSet && !remainingSet.has(selectedKey)) {
      return {
        ok: false,
        details: `selected_names contains a name outside remaining county candidates.`,
      };
    }

    seenKeys.add(selectedKey);
  }

  if (args.remainingCandidates) {
    const expectedPrefix = args.remainingCandidates.slice(
      0,
      selectedNames.length,
    );
    for (const [index] of expectedPrefix.entries()) {
      if (selectedNames[index] !== expectedPrefix[index]) {
        return {
          ok: false,
          details:
            "County selected_names must be an exact prefix of remaining_candidates.",
        };
      }
    }
  }

  return {
    ok: true,
    data: {
      selected_names: selectedNames,
    },
  };
};

const validateBuildingTypeIds = (args: {
  data: BuildingsModelOutput;
  allowedBuildingTypeIds: string[];
}): string | null => {
  const allowedIds = new Set(args.allowedBuildingTypeIds);

  for (const [index, building] of args.data.buildings.entries()) {
    const buildingTypeId = building?.buildingTypeId?.trim();
    if (!buildingTypeId || !allowedIds.has(buildingTypeId)) {
      return `Entity ${index + 1} uses a buildingTypeId outside building_types.`;
    }
  }

  return null;
};

const validateDescriptionModelOutput = <
  T extends Record<string, unknown>,
>(args: {
  bucket: OutputBucket;
  data: T;
  entityType: StructuredEntityType;
  forbiddenCanonicalKeys: string[];
  hasMissingLocalizedFields: (data: T) => boolean;
  semanticValidator?: (data: T) => string | null;
  selectedNames: string[];
}): { ok: true; data: T } | { ok: false; details: string } => {
  const entityList = args.data[args.bucket];
  if (!Array.isArray(entityList)) {
    return {
      ok: false,
      details: `Missing top-level "${args.bucket}" array for ${args.entityType}.`,
    };
  }

  if (entityList.length !== args.selectedNames.length) {
    return {
      ok: false,
      details: `Returned ${args.bucket} count does not match selected_names for ${args.entityType}.`,
    };
  }

  const forbiddenSet = new Set(args.forbiddenCanonicalKeys);
  const seenKeys = new Set<string>();

  for (const [index, item] of entityList.entries()) {
    const typedItem = item as { name?: LocalizedAIText };
    const selectedName = args.selectedNames[index]?.trim() ?? "";
    const selectedKey = canonicalKeyFromString(selectedName, args.bucket);
    const nameEn = typedItem?.name?.en?.trim() ?? "";
    const nameKey = canonicalKeyFromString(nameEn, args.bucket);

    if (!selectedKey) {
      return {
        ok: false,
        details: `selected_names contains an empty canonical key for ${args.entityType}.`,
      };
    }

    // Run 2 stays locked to the selected names from run 1.
    if (nameEn !== selectedName || nameKey !== selectedKey) {
      return {
        ok: false,
        details: `Entity ${index + 1} name.en does not exactly match selected_names for ${args.entityType}.`,
      };
    }

    if (seenKeys.has(nameKey)) {
      return {
        ok: false,
        details: `Duplicate canonical key detected for ${args.entityType}.`,
      };
    }

    if (forbiddenSet.has(nameKey)) {
      return {
        ok: false,
        details: `Entity ${index + 1} uses a forbidden canonical key for ${args.entityType}.`,
      };
    }

    for (const key of canonicalKeysFromName(
      typedItem.name ?? { hu: "", en: "" },
      args.bucket,
    )) {
      if (forbiddenSet.has(key)) {
        return {
          ok: false,
          details: `Entity ${index + 1} includes a forbidden canonical key in its localized names.`,
        };
      }
    }

    seenKeys.add(nameKey);
  }

  if (args.hasMissingLocalizedFields(args.data)) {
    return {
      ok: false,
      details: `Missing localized text detected for ${args.entityType}.`,
    };
  }

  const semanticValidationError = args.semanticValidator?.(args.data);
  if (semanticValidationError) {
    return {
      ok: false,
      details: semanticValidationError,
    };
  }

  return { ok: true, data: args.data };
};

// Split selection from localized writing so name validation happens first.
const runSelectionAIRequest = async (args: {
  bucket: OutputBucket;
  entityType: StructuredEntityType;
  forbiddenCanonicalKeys: string[];
  inputPayload: Record<string, unknown>;
  outputSchema: string;
  remainingCandidateKeys?: string[];
  remainingCandidates?: string[];
  responseFormat: {
    type: "json";
    name: string;
    description?: string;
    schema: Record<string, unknown>;
  };
  schema: {
    parse: (value: unknown) => SelectionModelOutput;
    safeParse: (
      value: unknown,
    ) =>
      | { success: true; data: SelectionModelOutput }
      | { success: false; error?: { issues?: unknown } };
  };
  targetCount: number;
  userPrompt: string;
}) => {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const timeoutMs = Math.max(env.AI_TIMEOUT_MS, MIN_AI_TIMEOUT_MS);
  const parseAndValidate = (
    rawText: string,
  ):
    | { ok: true; data: SelectionModelOutput }
    | { ok: false; details: string } => {
    const parsed = parseModelOutput({
      bucket: args.bucket,
      rawText,
      schema: args.schema,
    });

    if (!parsed.ok) return parsed;

    return validateSelectionModelOutput({
      bucket: args.bucket,
      data: parsed.data,
      entityType: args.entityType,
      forbiddenCanonicalKeys: args.forbiddenCanonicalKeys,
      remainingCandidateKeys: args.remainingCandidateKeys,
      remainingCandidates: args.remainingCandidates,
      targetCount: args.targetCount,
    });
  };

  const providerResult = await callProvider("openai", {
    apiKey,
    model: DEFAULT_OPENAI_MODEL,
    messages: [
      { role: "system", content: LOCATIONS_SYSTEM_PROMPT },
      { role: "user", content: args.userPrompt },
    ],
    maxOutputTokens: SELECTION_MAX_OUTPUT_TOKENS,
    responseFormat: args.responseFormat,
    timeoutMs,
  });

  let repairModelOutput = "";
  let modelOutput = parseAndValidate(providerResult.text);

  if (!modelOutput.ok) {
    const repairResult = await callProvider("openai", {
      apiKey,
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: buildSelectionRepairSystemPrompt(args.outputSchema),
        },
        {
          role: "user",
          content: buildSelectionRepairPrompt({
            details: modelOutput.details,
            entityType: args.entityType,
            inputPayload: args.inputPayload,
            invalidOutput: providerResult.text,
            outputSchema: args.outputSchema,
          }),
        },
      ],
      maxOutputTokens: REPAIR_MAX_OUTPUT_TOKENS,
      responseFormat: args.responseFormat,
      timeoutMs,
    });

    repairModelOutput = repairResult.text;
    modelOutput = parseAndValidate(repairResult.text);
  }

  return {
    modelOutput,
    rawModelOutput: providerResult.text,
    repairModelOutput,
  };
};

const runDescriptionAIRequest = async <
  T extends Record<string, unknown>,
>(args: {
  bucket: OutputBucket;
  entityType: StructuredEntityType;
  forbiddenCanonicalKeys: string[];
  hasMissingLocalizedFields: (data: T) => boolean;
  outputSchema: string;
  semanticValidator?: (data: T) => string | null;
  responseFormat: {
    type: "json";
    name: string;
    description?: string;
    schema: Record<string, unknown>;
  };
  schema: {
    parse: (value: unknown) => T;
    safeParse: (
      value: unknown,
    ) =>
      | { success: true; data: T }
      | { success: false; error?: { issues?: unknown } };
  };
  selectedNames: string[];
  userPrompt: string;
}) => {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const timeoutMs = Math.max(env.AI_TIMEOUT_MS, MIN_AI_TIMEOUT_MS);
  const parseAndValidate = (
    rawText: string,
  ): { ok: true; data: T } | { ok: false; details: string } => {
    const parsed = parseModelOutput({
      bucket: args.bucket,
      rawText,
      schema: args.schema,
    });

    if (!parsed.ok) return parsed;

    return validateDescriptionModelOutput({
      bucket: args.bucket,
      data: parsed.data,
      entityType: args.entityType,
      forbiddenCanonicalKeys: args.forbiddenCanonicalKeys,
      hasMissingLocalizedFields: args.hasMissingLocalizedFields,
      semanticValidator: args.semanticValidator,
      selectedNames: args.selectedNames,
    });
  };

  const providerResult = await callProvider("openai", {
    apiKey,
    model: DEFAULT_OPENAI_MODEL,
    messages: [
      { role: "system", content: LOCATIONS_SYSTEM_PROMPT },
      { role: "user", content: args.userPrompt },
    ],
    maxOutputTokens: DESCRIPTION_MAX_OUTPUT_TOKENS,
    responseFormat: args.responseFormat,
    timeoutMs,
  });

  let repairModelOutput = "";
  let modelOutput = parseAndValidate(providerResult.text);

  if (!modelOutput.ok) {
    const repairResult = await callProvider("openai", {
      apiKey,
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: buildDescriptionRepairSystemPrompt(args.outputSchema),
        },
        {
          role: "user",
          content: buildDescriptionRepairPrompt({
            details: modelOutput.details,
            entityType: args.entityType,
            invalidOutput: providerResult.text,
            outputSchema: args.outputSchema,
            selectedNames: args.selectedNames,
          }),
        },
      ],
      maxOutputTokens: REPAIR_MAX_OUTPUT_TOKENS,
      responseFormat: args.responseFormat,
      timeoutMs,
    });

    repairModelOutput = repairResult.text;
    modelOutput = parseAndValidate(repairResult.text);
  }

  return {
    modelOutput,
    rawModelOutput: providerResult.text,
    repairModelOutput,
  };
};

const previewCountiesFromModelOutput = (args: {
  context: CountryContext;
  count: number;
  modelOutput: CountiesModelOutput;
}): { proposals: MissingCountyProposal[]; skipped: SkipItem[] } => {
  const skipped: SkipItem[] = [];
  const proposals: MissingCountyProposal[] = [];
  const seen = new Set<string>();

  for (const county of args.modelOutput.counties) {
    const proposal: MissingCountyProposal = {
      kind: "county",
      name: trimLocalized(county.name),
      description: trimLocalized(county.description),
    };

    if (!proposal.description.hu || !proposal.description.en) {
      skipped.push({ reason: "county_missing_description", proposal: county });
      continue;
    }

    if (!proposal.name.hu || !proposal.name.en) {
      skipped.push({ reason: "county_invalid_name", proposal: county });
      continue;
    }

    if (
      hasExistingName(args.context.countyNameIndex, proposal.name, "counties")
    ) {
      skipped.push({ reason: "county_already_exists", proposal: county });
      continue;
    }

    if (hasSeenName(seen, proposal.name, "counties")) {
      skipped.push({ reason: "county_duplicate_in_preview", proposal: county });
      continue;
    }

    markSeenName(seen, proposal.name, "counties");
    proposals.push(proposal);
  }

  return { proposals: proposals.slice(0, args.count), skipped };
};

const previewCitiesFromModelOutput = (args: {
  context: CountyContext;
  count: number;
  modelOutput: CitiesModelOutput;
}): { proposals: MissingCityProposal[]; skipped: SkipItem[] } => {
  const skipped: SkipItem[] = [];
  const proposals: MissingCityProposal[] = [];
  const seen = new Set<string>();

  for (const city of args.modelOutput.cities) {
    const proposal: MissingCityProposal = {
      kind: "city",
      name: trimLocalized(city.name),
      description: trimLocalized(city.description),
    };

    if (!proposal.description.hu || !proposal.description.en) {
      skipped.push({ reason: "city_missing_description", proposal: city });
      continue;
    }

    if (!proposal.name.hu || !proposal.name.en) {
      skipped.push({ reason: "city_invalid_name", proposal: city });
      continue;
    }

    if (hasExistingName(args.context.cityNameIndex, proposal.name, "cities")) {
      skipped.push({ reason: "city_already_exists", proposal: city });
      continue;
    }

    if (hasSeenName(seen, proposal.name, "cities")) {
      skipped.push({ reason: "city_duplicate_in_preview", proposal: city });
      continue;
    }

    markSeenName(seen, proposal.name, "cities");
    proposals.push(proposal);
  }

  return { proposals: proposals.slice(0, args.count), skipped };
};

const previewBuildingsFromModelOutput = (args: {
  context: CityContext;
  count: number;
  modelOutput: BuildingsModelOutput;
}): { proposals: MissingBuildingProposal[]; skipped: SkipItem[] } => {
  const skipped: SkipItem[] = [];
  const proposals: MissingBuildingProposal[] = [];
  const seen = new Set<string>();

  for (const building of args.modelOutput.buildings) {
    const proposal: MissingBuildingProposal = {
      kind: "building",
      name: trimLocalized(building.name),
      buildingTypeId: building.buildingTypeId.trim(),
      summary: trimLocalized(building.summary),
      history: trimLocalized(building.history),
      style: trimLocalized(building.style),
      presentDay: trimLocalized(building.presentDay),
    };

    const hasAllText =
      proposal.summary.hu &&
      proposal.summary.en &&
      proposal.history.hu &&
      proposal.history.en &&
      proposal.style.hu &&
      proposal.style.en &&
      proposal.presentDay.hu &&
      proposal.presentDay.en;

    if (!proposal.name.hu || !proposal.name.en) {
      skipped.push({ reason: "building_invalid_name", proposal: building });
      continue;
    }

    if (!hasAllText) {
      skipped.push({ reason: "building_missing_text", proposal: building });
      continue;
    }

    if (
      !proposal.buildingTypeId ||
      !args.context.buildingTypes.some(
        (buildingType) => buildingType.id === proposal.buildingTypeId,
      )
    ) {
      skipped.push({ reason: "building_invalid_type", proposal: building });
      continue;
    }

    if (
      hasExistingName(
        args.context.buildingNameIndex,
        proposal.name,
        "buildings",
      )
    ) {
      skipped.push({ reason: "building_already_exists", proposal: building });
      continue;
    }

    if (hasSeenName(seen, proposal.name, "buildings")) {
      skipped.push({
        reason: "building_duplicate_in_preview",
        proposal: building,
      });
      continue;
    }

    markSeenName(seen, proposal.name, "buildings");
    proposals.push(proposal);
  }

  return { proposals: proposals.slice(0, args.count), skipped };
};

const createCountyDraft = async (args: {
  req: PayloadRequest;
  countryId: string;
  proposal: MissingCountyProposal;
}): Promise<{ id: string; name: LocalizedAIText }> => {
  const huData: Record<string, unknown> = {
    name: args.proposal.name.hu,
    country: args.countryId,
  };

  const huDescription = buildLexicalStateFromText(args.proposal.description.hu);
  if (huDescription) huData.description = huDescription;

  const created = await args.req.payload.create({
    collection: "counties",
    locale: "hu",
    draft: true,
    data: huData,
    req: args.req,
  });

  const createdId = getDocId(created);
  if (!createdId) {
    throw new Error("Failed to create county draft: missing id");
  }

  const enData: Record<string, unknown> = {
    name: args.proposal.name.en,
  };
  const enDescription = buildLexicalStateFromText(args.proposal.description.en);
  if (enDescription) enData.description = enDescription;

  await args.req.payload.update({
    collection: "counties",
    id: createdId,
    locale: "en",
    draft: true,
    data: enData,
    req: args.req,
  });

  return { id: createdId, name: args.proposal.name };
};

const createCityDraft = async (args: {
  req: PayloadRequest;
  countryId: string;
  countyId: string;
  proposal: MissingCityProposal;
}): Promise<{ id: string; name: LocalizedAIText }> => {
  const huData: Record<string, unknown> = {
    name: args.proposal.name.hu,
    country: args.countryId,
    county: args.countyId,
  };

  const huDescription = buildLexicalStateFromText(args.proposal.description.hu);
  if (huDescription) huData.description = huDescription;

  const created = await args.req.payload.create({
    collection: "cities",
    locale: "hu",
    draft: true,
    data: huData,
    req: args.req,
  });

  const createdId = getDocId(created);
  if (!createdId) {
    throw new Error("Failed to create city draft: missing id");
  }

  const enData: Record<string, unknown> = {
    name: args.proposal.name.en,
  };
  const enDescription = buildLexicalStateFromText(args.proposal.description.en);
  if (enDescription) enData.description = enDescription;

  await args.req.payload.update({
    collection: "cities",
    id: createdId,
    locale: "en",
    draft: true,
    data: enData,
    req: args.req,
  });

  return { id: createdId, name: args.proposal.name };
};

const createBuildingDraft = async (args: {
  req: PayloadRequest;
  countryId: string;
  countyId: string;
  cityId: string;
  proposal: MissingBuildingProposal;
}): Promise<{ id: string; name: LocalizedAIText }> => {
  const huData: Record<string, unknown> = {
    name: args.proposal.name.hu,
    summary: args.proposal.summary.hu,
    history: args.proposal.history.hu,
    style: args.proposal.style.hu,
    presentDay: args.proposal.presentDay.hu,
    buildingType: args.proposal.buildingTypeId,
    country: args.countryId,
    county: args.countyId,
    city: args.cityId,
  };

  const created = await args.req.payload.create({
    collection: "buildings",
    locale: "hu",
    draft: true,
    data: huData,
    req: args.req,
  });

  const createdId = getDocId(created);
  if (!createdId) {
    throw new Error("Failed to create building draft: missing id");
  }

  await args.req.payload.update({
    collection: "buildings",
    id: createdId,
    locale: "en",
    draft: true,
    data: {
      name: args.proposal.name.en,
      summary: args.proposal.summary.en,
      history: args.proposal.history.en,
      style: args.proposal.style.en,
      presentDay: args.proposal.presentDay.en,
    },
    req: args.req,
  });

  return { id: createdId, name: args.proposal.name };
};

const buildPreviewErrorResponse = (args: {
  debug: Record<string, unknown>;
  details: string;
  status: number;
}) =>
  jsonResponse(
    {
      error:
        args.status === 500
          ? "AI provider error. Please try again."
          : "AI returned invalid structured data.",
      details: args.details,
      ...(SHOULD_EXPOSE_AI_DEBUG ? { debug: args.debug } : {}),
    },
    { status: args.status },
  );

const withBrowserAIDebug = (
  debug: Record<string, unknown>,
): Record<string, unknown> => (SHOULD_EXPOSE_AI_DEBUG ? { debug } : {});

export const aiGenerateMissingCountiesHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const authError = ensureAIRequestAllowed(req);
  if (authError) return authError;

  const body =
    typeof req.json === "function" ? await req.json().catch(() => null) : null;
  const parsed = aiGenerateMissingCountiesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let context: CountryContext;
  try {
    context = await loadCountryContext({
      req,
      countryId: parsed.data.countryId,
    });
  } catch {
    return jsonResponse({ error: "Country not found." }, { status: 404 });
  }

  if (parsed.data.mode === "preview") {
    const forbiddenCanonicalKeys = getForbiddenCanonicalKeys(
      context.counties,
      "counties",
    );
    const { remainingCandidates, remainingCandidateKeys } =
      getRemainingCountyCandidateInputs({
        countryCode: context.countryCode,
        forbiddenCanonicalKeys,
      });
    const selectionInputPayload = withAdditionalInstructions(
      {
        entity_type: "county",
        parent_region:
          context.countryName.en ||
          context.countryName.hu ||
          "(unknown country)",
        target_count: parsed.data.count,
        remaining_candidates: remainingCandidates,
        remaining_candidate_keys: remainingCandidateKeys,
      },
      parsed.data.additionalInstructions,
    );
    const selectionPrompt = buildCountySelectionPrompt({
      context,
      count: parsed.data.count,
      remainingCandidates,
      remainingCandidateKeys,
      additionalInstructions: parsed.data.additionalInstructions,
    });

    try {
      const {
        modelOutput: selectionModelOutput,
        rawModelOutput: selectionRawModelOutput,
        repairModelOutput: selectionRepairModelOutput,
      } = await runSelectionAIRequest({
        bucket: "counties",
        entityType: "county",
        forbiddenCanonicalKeys,
        inputPayload: selectionInputPayload,
        outputSchema: '{"selected_names":["..."]}',
        remainingCandidateKeys,
        remainingCandidates,
        responseFormat: {
          type: "json",
          name: "county_selection",
          schema: aiMissingCountiesSelectionResponseJsonSchema,
        },
        schema: aiMissingCountiesSelectionModelOutputSchema,
        targetCount: parsed.data.count,
        userPrompt: selectionPrompt,
      });

      if (!selectionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
          },
          details: selectionModelOutput.details,
          status: 422,
        });
      }

      const descriptionPrompt = buildCountyDescriptionPrompt({
        context,
        selectedNames: selectionModelOutput.data.selected_names,
        additionalInstructions: parsed.data.additionalInstructions,
      });
      const {
        modelOutput: descriptionModelOutput,
        rawModelOutput: descriptionRawModelOutput,
        repairModelOutput: descriptionRepairModelOutput,
      } = await runDescriptionAIRequest({
        bucket: "counties",
        entityType: "county",
        forbiddenCanonicalKeys,
        hasMissingLocalizedFields: hasMissingLocalizedCountyFields,
        outputSchema:
          '{"counties":[{"name":{"hu":"...","en":"..."},"description":{"hu":"...","en":"..."}}]}',
        responseFormat: {
          type: "json",
          name: "county_description",
          schema: aiMissingCountiesResponseJsonSchema,
        },
        schema: aiMissingCountiesModelOutputSchema,
        selectedNames: selectionModelOutput.data.selected_names,
        userPrompt: descriptionPrompt,
      });

      if (!descriptionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
            selectedNames: selectionModelOutput.data.selected_names,
            descriptionPrompt,
            descriptionRawModelOutput,
            descriptionRepairModelOutput,
          },
          details: descriptionModelOutput.details,
          status: 422,
        });
      }

      const { proposals, skipped } = previewCountiesFromModelOutput({
        context,
        count: Math.min(parsed.data.count, MAX_PROPOSALS_PER_RUN),
        modelOutput: descriptionModelOutput.data,
      });

      return jsonResponse({
        mode: "preview",
        target: "counties",
        proposals,
        skipped,
        existingSummary: {
          countyCount: context.counties.length,
        },
        warnings: [
          "AI may be inaccurate; verify facts before creating drafts.",
        ],
        ...withBrowserAIDebug({
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
          selectionRawModelOutput,
          selectionRepairModelOutput,
          selectedNames: selectionModelOutput.data.selected_names,
          descriptionPrompt,
          descriptionRawModelOutput,
          descriptionRepairModelOutput,
        }),
      });
    } catch (error) {
      return buildPreviewErrorResponse({
        debug: {
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
        },
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      });
    }
  }

  const skipped: SkipItem[] = [];
  const createdCounties: Array<{ id: string; name: LocalizedAIText }> = [];

  for (const proposal of parsed.data.proposals) {
    if (hasExistingName(context.countyNameIndex, proposal.name, "counties")) {
      skipped.push({
        reason: "county_already_exists",
        proposal: { county: proposal.name },
      });
      continue;
    }

    try {
      const createdCounty = await createCountyDraft({
        req,
        countryId: context.countryId,
        proposal,
      });
      createdCounties.push(createdCounty);
      addNameToIndex(
        context.countyNameIndex,
        createdCounty.name,
        createdCounty.id,
        "counties",
      );
    } catch (error) {
      skipped.push({
        reason: "county_create_failed",
        proposal: {
          county: proposal.name,
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return jsonResponse({
    mode: "create",
    target: "counties",
    createdCounties,
    createdCities: [],
    createdBuildings: [],
    skipped,
    warnings: ["AI may be inaccurate; verify facts before publishing drafts."],
  });
};

export const aiGenerateMissingCitiesHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const authError = ensureAIRequestAllowed(req);
  if (authError) return authError;

  const body =
    typeof req.json === "function" ? await req.json().catch(() => null) : null;
  const parsed = aiGenerateMissingCitiesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let context: CountyContext;
  try {
    context = await loadCountyContext({
      req,
      countyId: parsed.data.countyId,
    });
  } catch {
    return jsonResponse({ error: "County not found." }, { status: 404 });
  }

  if (parsed.data.mode === "preview") {
    const forbiddenCanonicalKeys = getForbiddenCanonicalKeys(
      context.cities,
      "cities",
    );
    const selectionInputPayload = withAdditionalInstructions(
      {
        entity_type: "city",
        parent_region: [
          context.countyName.en || context.countyName.hu || "(unknown county)",
          context.countryName.en ||
            context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        target_count: parsed.data.count,
        existing_entities: toPromptExistingEntities(context.cities),
        forbidden_canonical_keys: forbiddenCanonicalKeys,
      },
      parsed.data.additionalInstructions,
    );
    const selectionPrompt = buildCitySelectionPrompt({
      context,
      count: parsed.data.count,
      forbiddenCanonicalKeys,
      additionalInstructions: parsed.data.additionalInstructions,
    });

    try {
      const {
        modelOutput: selectionModelOutput,
        rawModelOutput: selectionRawModelOutput,
        repairModelOutput: selectionRepairModelOutput,
      } = await runSelectionAIRequest({
        bucket: "cities",
        entityType: "city",
        forbiddenCanonicalKeys,
        inputPayload: selectionInputPayload,
        outputSchema: '{"selected_names":["..."]}',
        responseFormat: {
          type: "json",
          name: "city_selection",
          schema: aiMissingCitiesSelectionResponseJsonSchema,
        },
        schema: aiMissingCitiesSelectionModelOutputSchema,
        targetCount: parsed.data.count,
        userPrompt: selectionPrompt,
      });

      if (!selectionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
          },
          details: selectionModelOutput.details,
          status: 422,
        });
      }

      const descriptionPrompt = buildCityDescriptionPrompt({
        context,
        selectedNames: selectionModelOutput.data.selected_names,
        additionalInstructions: parsed.data.additionalInstructions,
      });
      const {
        modelOutput: descriptionModelOutput,
        rawModelOutput: descriptionRawModelOutput,
        repairModelOutput: descriptionRepairModelOutput,
      } = await runDescriptionAIRequest({
        bucket: "cities",
        entityType: "city",
        forbiddenCanonicalKeys,
        hasMissingLocalizedFields: hasMissingLocalizedCityFields,
        outputSchema:
          '{"cities":[{"name":{"hu":"...","en":"..."},"description":{"hu":"...","en":"..."}}]}',
        responseFormat: {
          type: "json",
          name: "city_description",
          schema: aiMissingCitiesResponseJsonSchema,
        },
        schema: aiMissingCitiesModelOutputSchema,
        selectedNames: selectionModelOutput.data.selected_names,
        userPrompt: descriptionPrompt,
      });

      if (!descriptionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
            selectedNames: selectionModelOutput.data.selected_names,
            descriptionPrompt,
            descriptionRawModelOutput,
            descriptionRepairModelOutput,
          },
          details: descriptionModelOutput.details,
          status: 422,
        });
      }

      const { proposals, skipped } = previewCitiesFromModelOutput({
        context,
        count: Math.min(parsed.data.count, MAX_PROPOSALS_PER_RUN),
        modelOutput: descriptionModelOutput.data,
      });

      return jsonResponse({
        mode: "preview",
        target: "cities",
        proposals,
        skipped,
        existingSummary: {
          cityCount: context.cities.length,
        },
        warnings: [
          "AI may be inaccurate; verify facts before creating drafts.",
        ],
        ...withBrowserAIDebug({
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
          selectionRawModelOutput,
          selectionRepairModelOutput,
          selectedNames: selectionModelOutput.data.selected_names,
          descriptionPrompt,
          descriptionRawModelOutput,
          descriptionRepairModelOutput,
        }),
      });
    } catch (error) {
      return buildPreviewErrorResponse({
        debug: {
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
        },
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      });
    }
  }

  const skipped: SkipItem[] = [];
  const createdCities: Array<{ id: string; name: LocalizedAIText }> = [];

  for (const proposal of parsed.data.proposals) {
    if (hasExistingName(context.cityNameIndex, proposal.name, "cities")) {
      skipped.push({
        reason: "city_already_exists",
        proposal: { city: proposal.name },
      });
      continue;
    }

    try {
      const createdCity = await createCityDraft({
        req,
        countryId: context.countryId,
        countyId: context.countyId,
        proposal,
      });
      createdCities.push(createdCity);
      addNameToIndex(
        context.cityNameIndex,
        createdCity.name,
        createdCity.id,
        "cities",
      );
    } catch (error) {
      skipped.push({
        reason: "city_create_failed",
        proposal: {
          city: proposal.name,
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return jsonResponse({
    mode: "create",
    target: "cities",
    createdCounties: [],
    createdCities,
    createdBuildings: [],
    skipped,
    warnings: ["AI may be inaccurate; verify facts before publishing drafts."],
  });
};

export const aiGenerateMissingBuildingsHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const authError = ensureAIRequestAllowed(req);
  if (authError) return authError;

  const body =
    typeof req.json === "function" ? await req.json().catch(() => null) : null;
  const parsed = aiGenerateMissingBuildingsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let context: CityContext;
  try {
    context = await loadCityContext({
      req,
      cityId: parsed.data.cityId,
    });
  } catch {
    return jsonResponse({ error: "City not found." }, { status: 404 });
  }

  if (parsed.data.mode === "preview") {
    const forbiddenCanonicalKeys = getForbiddenCanonicalKeys(
      context.buildings,
      "buildings",
    );
    const selectionInputPayload = withAdditionalInstructions(
      {
        entity_type: "building",
        parent_region: [
          context.cityName.en || context.cityName.hu || "(unknown city)",
          context.countyName.en || context.countyName.hu || "(unknown county)",
          context.countryName.en ||
            context.countryName.hu ||
            "(unknown country)",
        ].join(", "),
        target_count: parsed.data.count,
        existing_entities: toPromptExistingEntities(context.buildings),
        forbidden_canonical_keys: forbiddenCanonicalKeys,
      },
      parsed.data.additionalInstructions,
    );
    const selectionPrompt = buildBuildingSelectionPrompt({
      context,
      count: parsed.data.count,
      forbiddenCanonicalKeys,
      additionalInstructions: parsed.data.additionalInstructions,
    });

    try {
      const {
        modelOutput: selectionModelOutput,
        rawModelOutput: selectionRawModelOutput,
        repairModelOutput: selectionRepairModelOutput,
      } = await runSelectionAIRequest({
        bucket: "buildings",
        entityType: "building",
        forbiddenCanonicalKeys,
        inputPayload: selectionInputPayload,
        outputSchema: '{"selected_names":["..."]}',
        responseFormat: {
          type: "json",
          name: "building_selection",
          schema: aiMissingBuildingsSelectionResponseJsonSchema,
        },
        schema: aiMissingBuildingsSelectionModelOutputSchema,
        targetCount: parsed.data.count,
        userPrompt: selectionPrompt,
      });

      if (!selectionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
          },
          details: selectionModelOutput.details,
          status: 422,
        });
      }

      const descriptionPrompt = buildBuildingDescriptionPrompt({
        context,
        selectedNames: selectionModelOutput.data.selected_names,
        additionalInstructions: parsed.data.additionalInstructions,
      });
      const {
        modelOutput: descriptionModelOutput,
        rawModelOutput: descriptionRawModelOutput,
        repairModelOutput: descriptionRepairModelOutput,
      } = await runDescriptionAIRequest({
        bucket: "buildings",
        entityType: "building",
        forbiddenCanonicalKeys,
        hasMissingLocalizedFields: hasMissingLocalizedBuildingFields,
        outputSchema:
          '{"buildings":[{"name":{"hu":"...","en":"..."},"buildingTypeId":"...","summary":{"hu":"...","en":"..."},"history":{"hu":"...","en":"..."},"style":{"hu":"...","en":"..."},"presentDay":{"hu":"...","en":"..."}}]}',
        responseFormat: {
          type: "json",
          name: "building_description",
          schema: aiMissingBuildingsResponseJsonSchema,
        },
        schema: aiMissingBuildingsModelOutputSchema,
        semanticValidator: (data) =>
          validateBuildingTypeIds({
            data,
            allowedBuildingTypeIds: context.buildingTypes.map(
              (buildingType) => buildingType.id,
            ),
          }),
        selectedNames: selectionModelOutput.data.selected_names,
        userPrompt: descriptionPrompt,
      });

      if (!descriptionModelOutput.ok) {
        return buildPreviewErrorResponse({
          debug: {
            model: DEFAULT_OPENAI_MODEL,
            selectionPrompt,
            selectionRawModelOutput,
            selectionRepairModelOutput,
            selectedNames: selectionModelOutput.data.selected_names,
            descriptionPrompt,
            descriptionRawModelOutput,
            descriptionRepairModelOutput,
          },
          details: descriptionModelOutput.details,
          status: 422,
        });
      }

      const { proposals, skipped } = previewBuildingsFromModelOutput({
        context,
        count: Math.min(parsed.data.count, MAX_PROPOSALS_PER_RUN),
        modelOutput: descriptionModelOutput.data,
      });

      return jsonResponse({
        mode: "preview",
        target: "buildings",
        proposals,
        skipped,
        existingSummary: {
          buildingCount: context.buildings.length,
        },
        warnings: [
          "AI may be inaccurate; verify facts before creating drafts.",
        ],
        ...withBrowserAIDebug({
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
          selectionRawModelOutput,
          selectionRepairModelOutput,
          selectedNames: selectionModelOutput.data.selected_names,
          descriptionPrompt,
          descriptionRawModelOutput,
          descriptionRepairModelOutput,
        }),
      });
    } catch (error) {
      return buildPreviewErrorResponse({
        debug: {
          model: DEFAULT_OPENAI_MODEL,
          selectionPrompt,
        },
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      });
    }
  }

  const skipped: SkipItem[] = [];
  const createdBuildings: Array<{ id: string; name: LocalizedAIText }> = [];

  for (const proposal of parsed.data.proposals) {
    if (
      hasExistingName(context.buildingNameIndex, proposal.name, "buildings")
    ) {
      skipped.push({
        reason: "building_already_exists",
        proposal: { building: proposal.name },
      });
      continue;
    }

    try {
      const createdBuilding = await createBuildingDraft({
        req,
        countryId: context.countryId,
        countyId: context.countyId,
        cityId: context.cityId,
        proposal,
      });
      createdBuildings.push(createdBuilding);
      addNameToIndex(
        context.buildingNameIndex,
        createdBuilding.name,
        createdBuilding.id,
        "buildings",
      );
    } catch (error) {
      skipped.push({
        reason: "building_create_failed",
        proposal: {
          building: proposal.name,
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return jsonResponse({
    mode: "create",
    target: "buildings",
    createdCounties: [],
    createdCities: [],
    createdBuildings,
    skipped,
    warnings: ["AI may be inaccurate; verify facts before publishing drafts."],
  });
};

export const aiGenerateMissingCountiesEndpoint: Endpoint = {
  path: "/ai/generate-missing-counties",
  method: "post",
  handler: aiGenerateMissingCountiesHandler,
};

export const aiGenerateMissingCitiesEndpoint: Endpoint = {
  path: "/ai/generate-missing-cities",
  method: "post",
  handler: aiGenerateMissingCitiesHandler,
};

export const aiGenerateMissingBuildingsEndpoint: Endpoint = {
  path: "/ai/generate-missing-buildings",
  method: "post",
  handler: aiGenerateMissingBuildingsHandler,
};
