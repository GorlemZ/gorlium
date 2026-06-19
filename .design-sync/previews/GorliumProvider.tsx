import { GorliumProvider, Stack, Title, Body, Button } from "@gorlium/design-system";

const noop = () => {};

// The root wrapper. It applies the dark brutalist scope (.g-root): background,
// ink color, monospace font. Every screen should be wrapped in it.
export const Scope = () => (
  <GorliumProvider>
    <Stack space={16} align="center">
      <Title size="large">GORLIUM</Title>
      <Body size="medium">Everything inside renders on the dark canvas with the mono font.</Body>
      <Button label="GET A TERRARIUM" kind="solid" size="large" onPress={noop} />
    </Stack>
  </GorliumProvider>
);
