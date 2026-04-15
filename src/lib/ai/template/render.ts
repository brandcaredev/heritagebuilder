type UnknownRecord = Record<string, unknown>;

const isPlainObject = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getByPath = (root: unknown, path: string): unknown => {
  if (!path) return undefined;
  const parts = path.split(".").filter(Boolean);
  let current: unknown = root;
  for (const part of parts) {
    if (current == null) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as UnknownRecord)[part];
  }
  return current;
};

const toTemplateString = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((v) => toTemplateString(v)).filter(Boolean).join("\n");
  }
  if (isPlainObject(value)) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }
  return "";
};

export const renderTemplate = (
  template: string,
  variables: UnknownRecord,
): { rendered: string; missing: string[] } => {
  const missing = new Set<string>();

  const rendered = template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => {
    const value = getByPath(variables, key);
    if (value == null || value === "") {
      missing.add(String(key));
      return "";
    }
    return toTemplateString(value);
  });

  return { rendered, missing: Array.from(missing).sort() };
};

