import type { ReactNode } from "react";
import { Title, Body } from "../primitives/Text";
import { Button } from "../primitives/Button";

export interface FormProps {
  title?: string;
  description?: string;
  error?: string;
  errorBannerWidth?: "fill" | string;
  submitButton: { label: string; onPress: () => void };
  children?: ReactNode;
}

export function Form({
  title,
  description,
  error,
  errorBannerWidth,
  submitButton,
  children,
}: FormProps) {
  return (
    <form
      className="g-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitButton.onPress();
      }}
    >
      {title ? (
        <Title size="medium" align="left">
          {title}
        </Title>
      ) : null}
      {description ? (
        <Body size="medium" align="left">
          <span className="g-form__desc">{description}</span>
        </Body>
      ) : null}
      {error ? (
        <div
          className={
            "g-form__error" +
            (errorBannerWidth === "fill" ? " g-form__error--fill" : "")
          }
        >
          {error}
        </div>
      ) : null}
      {children}
      <div>
        <Button label={submitButton.label} kind="solid" onPress={submitButton.onPress} />
      </div>
    </form>
  );
}

export default Form;
