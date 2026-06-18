import { Inline, Button, Body } from "@gorlium/design-system";

const noop = () => {};

export const Buttons = () => (
  <Inline space={16} alignY="center">
    <Button label="SEND" kind="solid" onPress={noop} />
    <Button label="CANCEL" kind="transparent" onPress={noop} />
  </Inline>
);

export const Centered = () => (
  <Inline space={8} alignY="center" align="center">
    <Body size="medium">👉</Body>
    <Button label="This website GitHub repo" kind="transparent" size="large" onPress={noop} />
  </Inline>
);
