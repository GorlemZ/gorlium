import type { GeometryDocument } from "./geometry";

export type TeePreviewRequest = Record<string, unknown>;

export class TeePreviewApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TeePreviewApiError";
    this.status = status;
  }
}

export async function requestTeePreview(
  request: TeePreviewRequest,
  endpoint = "/api/v1/tee/preview",
  fetcher: typeof fetch = fetch,
): Promise<GeometryDocument> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(request),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new TeePreviewApiError(response.status, "Invalid JSON response");
  }
  if (!response.ok) {
    const message = isErrorPayload(payload) ? payload.message : "Tee preview request failed";
    throw new TeePreviewApiError(response.status, message);
  }
  if (!isGeometryDocument(payload)) {
    throw new TeePreviewApiError(response.status, "Invalid geometry response");
  }
  return payload;
}

function isErrorPayload(value: unknown): value is { message: string } {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string";
}

function isGeometryDocument(value: unknown): value is GeometryDocument {
  const candidate = value as {
    version?: unknown;
    units?: unknown;
    pieces?: unknown;
    stitches?: unknown;
    bounds?: unknown;
    diagnostics?: unknown;
  };
  return (
    typeof value === "object" &&
    value !== null &&
    candidate.version === "geometry.v1" &&
    candidate.units === "cm" &&
    Array.isArray(candidate.pieces) &&
    candidate.pieces.every(isGeometryPiece) &&
    Array.isArray(candidate.stitches) &&
    isBounds(candidate.bounds) &&
    Array.isArray(candidate.diagnostics) &&
    candidate.diagnostics.every((diagnostic) => typeof diagnostic === "string")
  );
}

function isGeometryPiece(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const piece = value as { name?: unknown; vertices?: unknown; translation?: unknown; rotation?: unknown };
  return (
    typeof piece.name === "string" &&
    Array.isArray(piece.vertices) &&
    piece.vertices.every(isPoint) &&
    isPoint(piece.translation) &&
    Array.isArray(piece.rotation) &&
    piece.rotation.length === 3 &&
    piece.rotation.every(isFiniteNumber)
  );
}

function isBounds(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const bounds = value as { minimum?: unknown; maximum?: unknown };
  if (!isPoint(bounds.minimum) || !isPoint(bounds.maximum)) return false;
  return bounds.minimum.x <= bounds.maximum.x && bounds.minimum.y <= bounds.maximum.y;
}

function isPoint(value: unknown): value is { x: number; y: number } {
  if (typeof value !== "object" || value === null) return false;
  const point = value as { x?: unknown; y?: unknown };
  return isFiniteNumber(point.x) && isFiniteNumber(point.y);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
