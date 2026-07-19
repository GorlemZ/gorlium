// Fixed palette for person avatars/colors (US-05). Cycles for any N.

export const PERSON_COLORS = [
  "#cc7a4f",
  "#8faa57",
  "#8aa0c8",
  "#cda64e",
  "#9b8cc4",
  "#5fb3c6",
  "#c65f8f",
  "#6cae8f",
];

export function pickColor(index: number): string {
  return PERSON_COLORS[((index % PERSON_COLORS.length) + PERSON_COLORS.length) % PERSON_COLORS.length];
}
