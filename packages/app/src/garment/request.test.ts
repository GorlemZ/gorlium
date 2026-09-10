import { describe, expect, it } from "vitest";

import { parseTeePreviewRequest } from "./request";

describe("parseTeePreviewRequest", () => {
  it("parses a JSON object", () => {
    expect(parseTeePreviewRequest('{"body":{},"design":{}}')).toEqual({ body: {}, design: {} });
  });

  it("rejects malformed JSON and non-object JSON", () => {
    expect(() => parseTeePreviewRequest("not json")).toThrow("valid JSON object");
    expect(() => parseTeePreviewRequest("[]")).toThrow("valid JSON object");
    expect(() => parseTeePreviewRequest("null")).toThrow("valid JSON object");
  });
});
