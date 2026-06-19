import { Title, Stack } from "@gorlium/design-system";

export const Sizes = () => (
  <Stack space={16}>
    <Title size="large">GORLIUM</Title>
    <Title size="medium">The right mixture</Title>
    <Title size="small">22 Jan 2025 — Deployin</Title>
  </Stack>
);

export const Large = () => <Title size="large">WELCOME TO THE GORLIUM</Title>;

export const Centered = () => (
  <Title size="medium" align="center">
    A tiny world
  </Title>
);
