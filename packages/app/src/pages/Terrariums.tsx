import { useEffect } from "react";
import { Box, Inline, PostSection, Stack } from "@gorlium/design-system";
import terrario2 from "../assets/Terrario1.png";
import fila1 from "../assets/Fila1cropped.png";
import patrick from "../assets/Patrizio.png";
import { useTranslation } from "react-i18next";

function preloadImage(url: string) {
  const img = new Image();
  img.src = url;
}

function Terrariums() {
  const { t } = useTranslation();
  useEffect(() => {
    preloadImage(terrario2);
    preloadImage(fila1);
    preloadImage(patrick);
  }, []);

  return (
    <Inline space={0}>
      <Box width={40}></Box>
      <Box width="fill">
        <Stack space={24} dividers={true}>
          <PostSection
            imgPath={terrario2}
            imgSize={"1/2"}
            title={t("terrariums.terrarium1.title")}
            text={t("terrariums.terrarium1.content")}
          ></PostSection>
          <PostSection
            imgAlignRight={true}
            imgPath={fila1}
            imgSize={"1/2"}
            title={t("terrariums.terrarium2.title")}
            text={t("terrariums.terrarium2.content")}
          ></PostSection>
          <PostSection
            imgAlignRight={false}
            imgPath={patrick}
            imgSize={"1/2"}
            title={t("terrariums.terrarium3.title")}
            text={t("terrariums.terrarium3.content")}
          ></PostSection>
        </Stack>
      </Box>
      <Box width={40}></Box>
    </Inline>
  );
}

export default Terrariums;
