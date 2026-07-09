import { Body, Box, GorliumImage, Stack, Title } from "@gorlium/design-system";

import { useTranslation } from "react-i18next";
import styles from "./Instructions.module.css";
import instruction1 from "../assets/instruction1.png";
import full from "../assets/full.png";
import half from "../assets/half.png";
import empty from "../assets/empty.png";

function SingleInstruction({
  imgPath,
  index,
  title,
  content,
}: {
  imgPath?: string;
  index: number;
  title: string;
  content: string[];
}) {
  function contentChild(content: string[]) {
    if (content.length > 1) {
      return content.map((paragraph: string, idx: number) => (
        <p key={idx}>{paragraph}</p>
      ));
    } else {
      return <p key={0}>{content[0]}</p>;
    }
  }
  return (
    <>
      <Box style={{ marginTop: "3vh" }}>
        <Title align={"left"} size="medium">
          {`${index}. ${title}`}
        </Title>
      </Box>
      <Stack space={16} align={"center"}>
        {imgPath && (
          <Box
            style={{
              minWidth: "30vw",
              width: "30vh",
              maxWidth: "100vw",
              height: "auto",
            }}
            className="responsive-image"
          >
            <GorliumImage path={imgPath} />
          </Box>
        )}
        <Box>
          <Body size="medium" align="left">
            {contentChild(content)}
          </Body>
        </Box>
      </Stack>
    </>
  );
}

function CondensationInstructions({ index }: { index: number }) {
  function CondensationCard({
    imgPath,
    content,
  }: {
    imgPath: string;
    content: string;
  }) {
    return (
      <div className={styles["responsive-flex-container"]}>
        <Box className={styles["instruction-image"]}>
          <GorliumImage path={imgPath} />
        </Box>
        <Box className={styles["condensation-text-container"]}>
          <Body size="medium" align="left">
            {content}
          </Body>
        </Box>
      </div>
    );
  }
  const { t } = useTranslation();
  return (
    <>
      <Box style={{ marginTop: "3vh" }}>
        <Title align={"left"} size="medium">
          {`${index}. ${t("instructions.condensation.title")}`}
        </Title>
      </Box>
      <Box
        style={{
          minWidth: "50vw",
          width: "100%",
          maxWidth: "100vw",
          marginBottom: "5vh",
          marginTop: "2vh",
        }}
      >
        <Body size="medium" align="left">
          {t("instructions.condensation.content", { returnObjects: true })[0]}
        </Body>
      </Box>
      <div className={styles["three-columns-container"]}>
        <CondensationCard
          imgPath={half}
          content={t("instructions.condensation.content", { returnObjects: true })[1]}
        />
        <CondensationCard
          imgPath={empty}
          content={t("instructions.condensation.content", { returnObjects: true })[2]}
        />
        <CondensationCard
          imgPath={full}
          content={t("instructions.condensation.content", { returnObjects: true })[3]}
        />
      </div>
    </>
  );
}

export function Instructions() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: "100%",
        margin: "2vh 3vw",
        display: "flex",
        flexDirection: "column",
        alignContent: "flex-start",
      }}
    >
      <SingleInstruction
        index={1}
        title={t("instructions.maintenance.title")}
        content={t("instructions.maintenance.content", { returnObjects: true })}
      />
      <CondensationInstructions index={2} />
      <SingleInstruction
        imgPath={instruction1}
        index={3}
        title={t("instructions.placement.title")}
        content={t("instructions.placement.content", { returnObjects: true })}
      />
    </div>
  );
}
