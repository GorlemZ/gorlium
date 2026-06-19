import { Tiles, Box, Body } from "@gorlium/design-system";

const tile = (n: number) => (
  <Box padding={20} style={{ background: "var(--g-surface)", border: "2px solid var(--g-border)" }}>
    <Body size="small">Tile {n}</Body>
  </Box>
);

export const ThreeColumns = () => (
  <Tiles space={16} columns={3}>
    {tile(1)}
    {tile(2)}
    {tile(3)}
    {tile(4)}
    {tile(5)}
    {tile(6)}
  </Tiles>
);

export const TwoColumns = () => (
  <Tiles space={12} columns={2}>
    {tile(1)}
    {tile(2)}
    {tile(3)}
    {tile(4)}
  </Tiles>
);
