import { Button, Inline } from "@gorlium/design-system";

const noop = () => {};

export const Solid = () => <Button label="SEND" kind="solid" onPress={noop} />;

export const Transparent = () => (
  <Button label="This website GitHub repo" kind="transparent" hierarchy="primary" onPress={noop} />
);

export const Large = () => <Button label="GET A TERRARIUM" kind="solid" size="large" onPress={noop} />;

export const WithIcon = () => (
  <Button
    label="STAR ON GITHUB"
    kind="solid"
    size="large"
    icon={({ size }) => (
      <span style={{ fontSize: size, lineHeight: 1 }}>★</span>
    )}
    onPress={noop}
  />
);

export const Kinds = () => (
  <Inline space={16} alignY="center">
    <Button label="SOLID" kind="solid" onPress={noop} />
    <Button label="TRANSPARENT" kind="transparent" onPress={noop} />
  </Inline>
);
