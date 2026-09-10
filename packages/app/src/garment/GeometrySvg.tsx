import type { GeometryDocument } from "./geometry";
import { geometryToSvgModel } from "./geometry";

interface GeometrySvgProps {
  geometry: GeometryDocument;
  className?: string;
}

export function GeometrySvg({ geometry, className }: GeometrySvgProps) {
  const model = geometryToSvgModel(geometry);
  return (
    <svg
      aria-label="Garment pattern preview"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox={model.viewBox}
    >
      {model.pieces.map((piece) => (
        <polygon
          key={piece.name}
          data-piece={piece.name}
          fill="none"
          points={piece.points}
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="0.08"
          transform={piece.transform}
        />
      ))}
    </svg>
  );
}
