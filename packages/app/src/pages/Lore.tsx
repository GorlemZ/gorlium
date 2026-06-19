import { Box, Inline, PostSection, Stack } from "@gorlium/design-system";

import { useTranslation } from "react-i18next";
function Lore() {
  const { t } = useTranslation();
  return (
    <Inline space={0}>
      <Box width={40}></Box>
      <Box width="fill">
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
      </Box>
      <Box width={40}></Box>
    </Inline>
  );
}

export default Lore;
