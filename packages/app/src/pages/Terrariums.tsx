import { useEffect } from "react";
import {
  Box,
  Column,
  Columns,
  PostSection,
  Stack,
} from "@gorlium/design-system";
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
    <Columns space={0}>
      <Column width="content">
        <Box width={40}></Box>
      </Column>
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
      <Column width="content">
        <Box width={40}></Box>
      </Column>
    </Columns>
  );
}

export default Terrariums;
