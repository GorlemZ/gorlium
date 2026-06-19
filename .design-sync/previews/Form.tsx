import { Form, FormSection, TextField, TextArea } from "@gorlium/design-system";

const noop = () => {};

export const ContactForm = () => (
  <Form
    title="Do you want a terrarium?"
    description="Write me a message 💌 and remember to leave your contact info"
    submitButton={{ label: "SEND", onPress: noop }}
  >
    <FormSection>
      <TextField name="name" label="Name" placeholder="Type your name here..." value="" onChange={noop} />
      <TextArea name="message" label="Message" placeholder="Type your message here..." rows={6} value="" onChange={noop} />
    </FormSection>
  </Form>
);

export const WithError = () => (
  <Form
    title="Do you want a terrarium?"
    error="Please fill in all the fields 🥲"
    errorBannerWidth="fill"
    submitButton={{ label: "SEND", onPress: noop }}
  >
    <FormSection>
      <TextField name="name" label="Name" value="" onChange={noop} />
    </FormSection>
  </Form>
);
