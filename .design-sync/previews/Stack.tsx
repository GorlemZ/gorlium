import { Stack, Title, Body } from "@gorlium/design-system";

export const Spaced = () => (
  <Stack space={16}>
    <Title size="small">The tiny world</Title>
    <Body size="medium">Those tiny jars of greenery are like a whole world in miniature.</Body>
    <Body size="medium">They're always a hit as gifts.</Body>
  </Stack>
);

export const WithDividers = () => (
  <Stack space={24} dividers>
    <Body size="medium">Attempt One lasted three weeks.</Body>
    <Body size="medium">Attempt Two failed almost immediately.</Body>
    <Body size="medium">Attempt Three thrived for five years.</Body>
  </Stack>
);

export const Centered = () => (
  <Stack space={12} align="center">
    <Title size="medium">GORLIUM</Title>
    <Body size="small">A tiny self-contained ecosystem.</Body>
  </Stack>
);
