import { Columns, Column, Box, Body } from "@gorlium/design-system";

const cell = (label: string, bg: string) => (
  <Box padding={16} style={{ background: bg, color: "#0b0b0b", height: "100%" }}>
    <Body size="small">{label}</Body>
  </Box>
);

export const Even = () => (
  <Columns space={16}>
    <Column>{cell("Left", "var(--g-accent)")}</Column>
    <Column>{cell("Right", "var(--g-accent-2)")}</Column>
  </Columns>
);

export const FixedAndFluid = () => (
  <Columns space={16}>
    <Column width="content">{cell("content", "var(--g-accent)")}</Column>
    <Column>{cell("fills remaining space", "var(--g-surface-2)")}</Column>
  </Columns>
);

export const HalfHalf = () => (
  <Columns space={16}>
    <Column width="1/2">{cell("1/2", "var(--g-accent)")}</Column>
    <Column width="1/2">{cell("1/2", "var(--g-accent-2)")}</Column>
  </Columns>
);
