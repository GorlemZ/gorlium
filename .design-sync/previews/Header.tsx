import { Header } from "@gorlium/design-system";

const noop = () => {};

export const Navigation = () => (
  <Header
    initialLanguage="it"
    onToggleLanguage={noop}
    list={[
      ["HOME", "/"],
      ["TERRARIUMS", "/terrariums"],
      ["HOW-TO", "/instructions"],
      ["CONTACTS", "/contacts"],
      ["GitHub", "/dev"],
    ]}
  />
);
