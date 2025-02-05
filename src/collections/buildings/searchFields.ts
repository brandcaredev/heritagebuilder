import { Field } from "payload";

export const searchFields: Field[] = [
  {
    name: "name",
    type: "text",
    required: true,
    localized: true,
    index: true,
  },
  {
    name: "summary",
    type: "text",
    localized: true,
    index: true,
  },
  {
    name: "slug",
    type: "text",
    required: true,
    localized: true,
  },
  {
    name: "buildingType",
    type: "relationship",
    relationTo: "building-types",
    required: true,
    index: true,
  },
  {
    name: "featuredImage",
    type: "upload",
    required: true,
    relationTo: "buildings-media",
  },
  {
    name: "city",
    type: "text",
    index: true,
    localized: true,
  },
  {
    name: "country",
    type: "text",
    index: true,
    localized: true,
  },
];
