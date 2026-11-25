import type { BuildingType } from "payload-types";

export const getPopulatedBuildingTypes = (value: unknown): BuildingType[] => {
  const relations = Array.isArray(value) ? value : value == null ? [] : [value];

  return relations.filter(
    (relation): relation is BuildingType =>
      typeof relation === "object" && relation !== null && "id" in relation,
  );
};
