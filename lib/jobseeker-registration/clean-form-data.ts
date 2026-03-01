/**
 * Normalizes form payload: empty strings to undefined, fixes training.entries[].certificates array → object.
 * Used by createJobseeker and updateJobseeker before Zod parse.
 */
export function cleanFormData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(cleanFormData);
  }

  if (typeof data === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === "") {
        cleaned[key] = undefined;
      } else if (key === "certificates" && Array.isArray(value)) {
        cleaned[key] = {
          NC_I: false,
          NC_II: false,
          NC_III: false,
          NC_IV: false,
          COC: false,
        };
      } else if (typeof value === "object") {
        cleaned[key] = cleanFormData(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return data;
}
