import { FormSection, TextField, TextArea } from "@gorlium/design-system";

const noop = () => {};

// FormSection groups related fields with consistent spacing; shown inside its
// natural container.
export const TwoFields = () => (
  <div className="g-form" style={{ maxWidth: 480 }}>
    <FormSection>
      <TextField name="name" label="Name" placeholder="Type your name here..." value="" onChange={noop} />
      <TextArea name="message" label="Message" placeholder="Type your message here..." rows={4} value="" onChange={noop} />
    </FormSection>
  </div>
);
