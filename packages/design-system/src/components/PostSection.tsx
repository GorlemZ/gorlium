import type { ComponentProps } from "react";
import { Body, Title } from "../primitives/Text";
import { Box, type BoxWidth } from "../primitives/Box";
import { Inline } from "../primitives/Inline";
import GorliumImage from "./GorliumImage";

interface PostSectionProps {
  imgPath?: string;
  title: string;
  text: string[];
  imgSize?: BoxWidth;
  imgAlignRight?: boolean;
  children?: ComponentProps<typeof Body>["children"];
}

function PostSection({
  imgPath,
  text,
  title,
  imgSize,
  imgAlignRight,
  children,
}: PostSectionProps) {
  return (
    <>
      <Title align={"left"} size="small">
        {title}
      </Title>
      <Inline space={16} collapseBelow="desktop" reverse={imgAlignRight ?? false}>
        {imgPath && (
          <Box width={imgSize ? imgSize : "1/5"}>
            <Box padding={8}></Box>
            <GorliumImage path={imgPath} />
          </Box>
        )}
        <Box width="fill">
          <Body size="medium" align="left">
            {text.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {children}
          </Body>
        </Box>
      </Inline>
    </>
  );
}

export default PostSection;
