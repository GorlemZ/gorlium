import type { TeePreviewRequest } from "./api";

export function parseTeePreviewRequest(value: string): TeePreviewRequest {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed as TeePreviewRequest;
  } catch {
    throw new Error("Enter a valid JSON object");
  }
}
