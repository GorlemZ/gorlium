import { Columns, Column, Box, Body } from "@gorlium/design-system";

const cell = (label: string, bg: string) => (
  <Box padding={16} style={{ background: bg, color: "#0b0b0b", height: "100%" }}>
    <Body size="small">{label}</Body>
  </Box>
);

// Column only renders meaningfully inside Columns — each story is the full parent.
export const Content = () => (
  <Columns space={16}>
    <Column width="content">{cell('width="content"', "var(--g-accent)")}</Column>
    <Column>{cell("default (fluid)", "var(--g-surface-2)")}</Column>
  </Columns>
);

export const Fraction = () => (
  <Columns space={16}>
    <Column width="1/3">{cell('1/3', "var(--g-accent)")}</Column>
    <Column width="2/3">{cell('2/3', "var(--g-accent-2)")}</Column>
  </Columns>
);
