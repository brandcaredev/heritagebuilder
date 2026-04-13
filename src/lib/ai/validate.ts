import { z } from "zod";

export const aiGenerateRequestSchema = z.object({
  collection: z.string().min(1),
  docId: z.union([z.string().min(1), z.number()]).transform(String),
  locale: z.string().min(1),
  fieldPath: z.string().min(1),
  additionalInstructions: z.string().max(4000).optional(),
});

export type AIGenerateRequestInput = z.infer<typeof aiGenerateRequestSchema>;

const localizedNameSchema = z.object({
  hu: z.string().trim().min(1).max(180),
  en: z.string().trim().min(1).max(180),
});

const localizedDescriptionSchema = z.object({
  hu: z.string().trim().min(1).max(4000),
  en: z.string().trim().min(1).max(4000),
});

const localizedDescriptionModelSchema = z.object({
  hu: z.string().max(4000).default(""),
  en: z.string().max(4000).default(""),
});

const localizedNameModelSchema = z.object({
  hu: z.string().max(180).default(""),
  en: z.string().max(180).default(""),
});

const selectedNamesModelSchema = z
  .array(z.string().trim().min(1).max(180))
  .default([]);

export const missingCountyProposalSchema = z.object({
  kind: z.literal("county"),
  name: localizedNameSchema,
  description: localizedDescriptionSchema,
});

export const missingCityProposalSchema = z.object({
  kind: z.literal("city"),
  name: localizedNameSchema,
  description: localizedDescriptionSchema,
});

export const missingBuildingProposalSchema = z.object({
  kind: z.literal("building"),
  name: localizedNameSchema,
  buildingTypeId: z.string().trim().min(1).max(120),
  summary: localizedDescriptionSchema,
  history: localizedDescriptionSchema,
  style: localizedDescriptionSchema,
  presentDay: localizedDescriptionSchema,
});

export const missingLocationProposalSchema = z.discriminatedUnion("kind", [
  missingCountyProposalSchema,
  missingCityProposalSchema,
  missingBuildingProposalSchema,
]);

const previewCommonFields = {
  mode: z.literal("preview"),
  count: z.number().int().min(1).max(5),
  additionalInstructions: z.string().max(4000).optional(),
};

export const aiGenerateMissingCountiesRequestSchema = z.discriminatedUnion(
  "mode",
  [
    z.object({
      ...previewCommonFields,
      countryId: z.union([z.string().min(1), z.number()]).transform(String),
    }),
    z.object({
      mode: z.literal("create"),
      countryId: z.union([z.string().min(1), z.number()]).transform(String),
      proposals: z.array(missingCountyProposalSchema).min(1).max(20),
    }),
  ],
);

export const aiGenerateMissingCitiesRequestSchema = z.discriminatedUnion(
  "mode",
  [
    z.object({
      ...previewCommonFields,
      countyId: z.union([z.string().min(1), z.number()]).transform(String),
    }),
    z.object({
      mode: z.literal("create"),
      countyId: z.union([z.string().min(1), z.number()]).transform(String),
      proposals: z.array(missingCityProposalSchema).min(1).max(20),
    }),
  ],
);

export const aiGenerateMissingBuildingsRequestSchema = z.discriminatedUnion(
  "mode",
  [
    z.object({
      ...previewCommonFields,
      cityId: z.union([z.string().min(1), z.number()]).transform(String),
    }),
    z.object({
      mode: z.literal("create"),
      cityId: z.union([z.string().min(1), z.number()]).transform(String),
      proposals: z.array(missingBuildingProposalSchema).min(1).max(20),
    }),
  ],
);

export const aiMissingCountiesSelectionModelOutputSchema = z
  .object({
    selected_names: selectedNamesModelSchema,
  })
  .strict();

export const aiMissingCitiesSelectionModelOutputSchema = z
  .object({
    selected_names: selectedNamesModelSchema,
  })
  .strict();

export const aiMissingBuildingsSelectionModelOutputSchema = z
  .object({
    selected_names: selectedNamesModelSchema,
  })
  .strict();

export const aiMissingCountiesModelOutputSchema = z
  .object({
    counties: z
      .array(
        z.object({
          name: localizedNameModelSchema,
          description: localizedDescriptionModelSchema,
        }),
      )
      .default([]),
  })
  .strict();

export const aiMissingCitiesModelOutputSchema = z
  .object({
    cities: z
      .array(
        z.object({
          name: localizedNameModelSchema,
          description: localizedDescriptionModelSchema,
        }),
      )
      .default([]),
  })
  .strict();

export const aiMissingBuildingsModelOutputSchema = z
  .object({
    buildings: z
      .array(
        z.object({
          name: localizedNameModelSchema,
          buildingTypeId: z.string().trim().min(1).max(120),
          summary: localizedDescriptionModelSchema,
          history: localizedDescriptionModelSchema,
          style: localizedDescriptionModelSchema,
          presentDay: localizedDescriptionModelSchema,
        }),
      )
      .default([]),
  })
  .strict();

const localizedNameJSONSchema = {
  type: "object",
  additionalProperties: false,
  required: ["hu", "en"],
  properties: {
    hu: { type: "string", maxLength: 180 },
    en: { type: "string", maxLength: 180 },
  },
} as const;

const localizedDescriptionJSONSchema = {
  type: "object",
  additionalProperties: false,
  required: ["hu", "en"],
  properties: {
    hu: { type: "string", maxLength: 4000 },
    en: { type: "string", maxLength: 4000 },
  },
} as const;

const selectedNamesJSONSchema = {
  type: "object",
  additionalProperties: false,
  required: ["selected_names"],
  properties: {
    selected_names: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 180 },
    },
  },
} as const;

export const aiMissingCountiesSelectionResponseJsonSchema =
  selectedNamesJSONSchema;

export const aiMissingCitiesSelectionResponseJsonSchema =
  selectedNamesJSONSchema;

export const aiMissingBuildingsSelectionResponseJsonSchema =
  selectedNamesJSONSchema;

export const aiMissingCountiesResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["counties"],
  properties: {
    counties: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description"],
        properties: {
          name: localizedNameJSONSchema,
          description: localizedDescriptionJSONSchema,
        },
      },
    },
  },
} as const;

export const aiMissingCitiesResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["cities"],
  properties: {
    cities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description"],
        properties: {
          name: localizedNameJSONSchema,
          description: localizedDescriptionJSONSchema,
        },
      },
    },
  },
} as const;

export const aiMissingBuildingsResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["buildings"],
  properties: {
    buildings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "buildingTypeId",
          "summary",
          "history",
          "style",
          "presentDay",
        ],
        properties: {
          name: localizedNameJSONSchema,
          buildingTypeId: { type: "string", minLength: 1, maxLength: 120 },
          summary: localizedDescriptionJSONSchema,
          history: localizedDescriptionJSONSchema,
          style: localizedDescriptionJSONSchema,
          presentDay: localizedDescriptionJSONSchema,
        },
      },
    },
  },
} as const;

export type MissingLocationProposalInput = z.infer<
  typeof missingLocationProposalSchema
>;

export type AIGenerateMissingCountiesRequestInput = z.infer<
  typeof aiGenerateMissingCountiesRequestSchema
>;

export type AIGenerateMissingCitiesRequestInput = z.infer<
  typeof aiGenerateMissingCitiesRequestSchema
>;

export type AIGenerateMissingBuildingsRequestInput = z.infer<
  typeof aiGenerateMissingBuildingsRequestSchema
>;

export type AIMissingCountiesModelOutput = z.infer<
  typeof aiMissingCountiesModelOutputSchema
>;

export type AIMissingCountiesSelectionModelOutput = z.infer<
  typeof aiMissingCountiesSelectionModelOutputSchema
>;

export type AIMissingCitiesModelOutput = z.infer<
  typeof aiMissingCitiesModelOutputSchema
>;

export type AIMissingCitiesSelectionModelOutput = z.infer<
  typeof aiMissingCitiesSelectionModelOutputSchema
>;

export type AIMissingBuildingsModelOutput = z.infer<
  typeof aiMissingBuildingsModelOutputSchema
>;

export type AIMissingBuildingsSelectionModelOutput = z.infer<
  typeof aiMissingBuildingsSelectionModelOutputSchema
>;
