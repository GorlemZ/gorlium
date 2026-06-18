import {
  Box,
  Button,
  Column,
  Columns,
  IconProps,
  Inline,
  PostSection,
  Stack,
} from "@gorlium/design-system";
import githublogo from "../assets/github-mark-white.png";
import { useTranslation } from "react-i18next";

function Dev() {
  const iconP = (props: IconProps) => {
    return <img src={githublogo} alt="github logo" width={props.size * 2} />;
  };
  const { t } = useTranslation();
  return (
    <Columns space={0}>
      <Column width="content">
        <Box width={40}></Box>
      </Column>
      <Stack space={24} dividers={true}>
        <PostSection title={t("dev.dev1.title")} text={t("dev.dev1.content")}>
          <Inline space={8} alignY={"center"}>
            👉
            <Button
              icon={iconP}
              label={t("dev.dev1.linkText")}
              kind="transparent"
              hierarchy="primary"
              size="large"
              onPress={() =>
                window.open(
                  "https://github.com/GorlemZ/gorlium",
                  "_blank"
                )
              }
            ></Button>
          </Inline>
        </PostSection>
      </Stack>
      <Column width="content">
        <Box width={40}></Box>
      </Column>
    </Columns>
  );
}

export default Dev;
