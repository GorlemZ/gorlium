import { describe, expect, it } from "vitest";

import { geometryToSvgModel } from "./geometry";

const geometry = {
  version: "geometry.v1",
  units: "cm",
  pieces: [
    {
      name: "front",
      label: null,
      vertices: [{ x: 1, y: 2 }, { x: 11, y: 2 }, { x: 11, y: 22 }],
      edges: [],
      translation: { x: 4, y: 5 },
      rotation: [0, 0, 90],
    },
  ],
  stitches: [],
  bounds: { minimum: { x: 0, y: 0 }, maximum: { x: 20, y: 30 } },
  diagnostics: [],
} as const;

describe("geometryToSvgModel", () => {
  it("uses the versioned bounds as an SVG viewBox", () => {
    expect(geometryToSvgModel(geometry).viewBox).toBe("0 0 20 30");
  });

  it("preserves piece geometry and transform without exposing internal fields", () => {
    expect(geometryToSvgModel(geometry).pieces).toEqual([
      {
        name: "front",
        points: "1,2 11,2 11,22",
        transform: "translate(4 5) rotate(90)",
      },
    ]);
  });

  it("rejects unsupported geometry versions", () => {
    expect(() => geometryToSvgModel({ ...geometry, version: "geometry.v2" } as never)).toThrow(
      "Unsupported geometry version",
    );
  });
});
