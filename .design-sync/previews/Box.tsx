import { Box, Body } from "@gorlium/design-system";

export const Padded = () => (
  <Box padding={24} style={{ border: "2px solid var(--g-border)", background: "var(--g-surface)" }}>
    <Body size="medium">A padded box on the surface color.</Body>
  </Box>
);

export const Sized = () => (
  <Box width={240} height={120} padding={16} style={{ background: "var(--g-accent)", color: "#0b0b0b" }}>
    <Body size="small">240 × 120 box with acid-lime fill.</Body>
  </Box>
);

export const FullWidth = () => (
  <Box width="full" padding={16} style={{ border: "2px solid var(--g-accent)" }}>
    <Body size="medium">Full-width box.</Body>
  </Box>
);
