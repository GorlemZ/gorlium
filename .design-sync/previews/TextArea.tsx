import { TextArea } from "@gorlium/design-system";

const noop = () => {};

export const Filled = () => (
  <TextArea
    name="message"
    label="Message"
    rows={5}
    value={"Hi! I'd love a terrarium for my office window.\nDo you ship?"}
    onChange={noop}
  />
);

export const WithPlaceholder = () => (
  <TextArea name="message" label="Message" placeholder="Type your message here..." rows={5} value="" onChange={noop} />
);
