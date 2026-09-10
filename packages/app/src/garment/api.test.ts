import { describe, expect, it, vi } from "vitest";

import { requestTeePreview, TeePreviewApiError } from "./api";

const responseGeometry = {
  version: "geometry.v1",
  units: "cm",
  pieces: [],
  stitches: [],
  bounds: { minimum: { x: 0, y: 0 }, maximum: { x: 1, y: 1 } },
  diagnostics: [],
};

describe("requestTeePreview", () => {
  it("posts JSON and returns the versioned geometry document", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(responseGeometry), { status: 200 }),
    );
    const request = { body: { bust: 90 }, design: {} };

    await expect(requestTeePreview(request, "/preview", fetcher)).resolves.toEqual(responseGeometry);
    expect(fetcher).toHaveBeenCalledWith(
      "/preview",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(request),
      }),
    );
  });

  it("raises a typed error for an HTTP error response", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: "invalid request" }), { status: 400 }),
    );

    await expect(requestTeePreview({}, "/preview", fetcher)).rejects.toEqual(
      new TeePreviewApiError(400, "invalid request"),
    );
  });

  it("rejects a successful response with an unsupported payload", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ version: "geometry.v2" }), { status: 200 }),
    );

    await expect(requestTeePreview({}, "/preview", fetcher)).rejects.toThrow("Invalid geometry response");
  });

  it("rejects a successful response with malformed bounds", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ...responseGeometry, bounds: null }), { status: 200 }),
    );

    await expect(requestTeePreview({}, "/preview", fetcher)).rejects.toThrow("Invalid geometry response");
  });

  it("turns a non-JSON response into a typed API error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("not json", { status: 502 }));

    await expect(requestTeePreview({}, "/preview", fetcher)).rejects.toEqual(
      new TeePreviewApiError(502, "Invalid JSON response"),
    );
  });
});
