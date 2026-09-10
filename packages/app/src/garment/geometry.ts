export interface GeometryPoint {
  x: number;
  y: number;
}

export interface GeometryPiece {
  name: string;
  label: string | null;
  vertices: readonly GeometryPoint[];
  edges: readonly unknown[];
  translation: GeometryPoint;
  rotation: readonly [number, number, number];
}

export interface GeometryDocument {
  version: "geometry.v1";
  units: "cm";
  pieces: readonly GeometryPiece[];
  stitches: readonly unknown[];
  bounds: { minimum: GeometryPoint; maximum: GeometryPoint };
  diagnostics: readonly string[];
}

export interface SvgPiece {
  name: string;
  points: string;
  transform: string;
}

export interface SvgModel {
  viewBox: string;
  pieces: SvgPiece[];
}

export function geometryToSvgModel(geometry: GeometryDocument): SvgModel {
  if (geometry.version !== "geometry.v1") {
    throw new Error(`Unsupported geometry version: ${geometry.version}`);
  }
  if (geometry.units !== "cm") {
    throw new Error(`Unsupported geometry units: ${geometry.units}`);
  }

  const { minimum, maximum } = geometry.bounds;
  return {
    viewBox: `${minimum.x} ${minimum.y} ${maximum.x - minimum.x} ${maximum.y - minimum.y}`,
    pieces: geometry.pieces.map((piece) => ({
      name: piece.name,
      points: piece.vertices.map(({ x, y }) => `${x},${y}`).join(" "),
      transform: `translate(${piece.translation.x} ${piece.translation.y}) rotate(${piece.rotation[2]})`,
    })),
  };
}
