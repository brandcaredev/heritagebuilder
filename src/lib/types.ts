import { type IBuilding } from "@/server/db/zodSchemaTypes";

export type BuildingPreviewData = Pick<
  IBuilding,
  | "name"
  | "images"
  | "featuredImage"
  | "history"
  | "style"
  | "famousresidents"
  | "renovation"
  | "presentday"
>;
