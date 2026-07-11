// Flattens an object into dot-paths, treating arrays and primitives as leaves.
// e.g. { defaultAddress: { city } } -> ["defaultAddress.city"].
export function listPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(obj).flatMap(([key, value]) =>
    listPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

function getByPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

// Reads the requested paths out of the source object, skipping unknown ones.
export function pickPaths(
  obj: unknown,
  paths: string[],
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const path of paths) {
    const value = getByPath(obj, path);
    if (value !== undefined) {
      picked[path] = value;
    }
  }
  return picked;
}
