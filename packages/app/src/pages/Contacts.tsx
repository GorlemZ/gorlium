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

const sendMessageToTelegram = async (message: string): Promise<boolean> => {
  const telegramToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!telegramToken || !chatId) {
    console.error(
      "Telegram is not configured: set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID at build time."
    );
    return false;
  }

  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
    message
  )}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      console.error("Telegram API error:", response.status, data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

function Contacts() {
  const { t } = useTranslation();
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async () => {
    setError("");

    if (name === "" || message === "") {
      setError(t("contacts.errorMessage"));
      return;
    }

    const delivered = await sendMessageToTelegram(
      `FROM: ${name}\nMESSAGE:\n ${message}`
    );

    if (!delivered) {
      setError(t("contacts.sendError"));
      return;
    }

    setIsSent(true);
    setMessage("");
    setName("");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSent(false);
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
            rows={4}
          />
        </FormSection>
      </Form>
    </Stack>
  );
}

export default Contacts;
