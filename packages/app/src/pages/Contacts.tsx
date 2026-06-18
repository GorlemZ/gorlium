import {
  Form,
  Stack,
  FormSection,
  TextField,
  TextArea,
  Title,
} from "@gorlium/design-system";
import React from "react";
import { useTranslation } from "react-i18next";

const sendMessageToTelegram = async (message: string) => {
  const telegramToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
    message
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

function Contacts() {
  const { t } = useTranslation();
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async () => {
    if (name !== "" && message !== "") {
      setIsSent(true);
      sendMessageToTelegram(`FROM: ${name}\nMESSAGE:\n ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMessage("");
      setName("");
      setIsSent(false);
    } else {
      setError(t("contacts.errorMessage"));
    }
  };
  return (
    <Stack space={0} dividers={true} align={"center"}>
      <Form
        title={t("contacts.formTitle")}
        description={t("contacts.formDescription")}
        errorBannerWidth="fill"
        error={error}
        submitButton={{
          label: t("contacts.sendButton"),
          onPress: () => {
            onSubmit();
          },
        }}
      >
        {isSent && <Title size="medium">{t("contacts.successMessage")}</Title>}

        <FormSection>
          <TextField
            name="name"
            placeholder={t("contacts.placeholderName")}
            label={t("contacts.formName")}
            value={name}
            onChange={setName}
          />
          <TextArea
            name="message"
            placeholder={t("contacts.placeholderMessage")}
            label={t("contacts.formMessage")}
            value={message}
            onChange={setMessage}
            rows={10}
          />
        </FormSection>
      </Form>
    </Stack>
  );
}

export default Contacts;
