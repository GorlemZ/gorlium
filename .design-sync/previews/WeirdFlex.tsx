import { WeirdFlex, Box, Body } from "@gorlium/design-system";

const item = (label: string) => (
  <Box padding={16} style={{ background: "var(--g-surface)", border: "2px solid var(--g-border)", width: 200 }}>
    <Body size="small">{label}</Body>
  </Box>
);

// Centered column flex that collapses to a row on narrow screens.
export const Stacked = () => (
  <WeirdFlex gap={16}>
    {item("First")}
    {item("Second")}
    {item("Third")}
  </WeirdFlex>
);
