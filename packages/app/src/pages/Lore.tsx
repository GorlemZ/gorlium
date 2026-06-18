import {
  Box,
  Column,
  Columns,
  PostSection,
  Stack,
} from "@gorlium/design-system";

import { useTranslation } from "react-i18next";
function Lore() {
  const { t } = useTranslation();
  return (
    <Columns space={0}>
      <Column width="content">
        <Box width={40}></Box>
      </Column>
      <Stack space={24} dividers={true}>
        <PostSection
          title={t("lore.lore1.title")}
          text={t("lore.lore1.content")}
        />
        <PostSection
          title={t("lore.lore2.title")}
          text={t("lore.lore2.content")}
        />
        <PostSection
          title={t("lore.lore3.title")}
          text={t("lore.lore3.content")}
        />
      </Stack>
      <Column width="content">
        <Box width={40}></Box>
      </Column>
    </Columns>
  );
}

export default Lore;
