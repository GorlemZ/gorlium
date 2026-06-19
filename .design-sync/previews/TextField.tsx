import { TextField } from "@gorlium/design-system";

const noop = () => {};

export const Filled = () => (
  <TextField name="name" label="Name" value="Patrizio" onChange={noop} />
);

export const WithPlaceholder = () => (
  <TextField name="name" label="Name" placeholder="Type your name here..." value="" onChange={noop} />
);
