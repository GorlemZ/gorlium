import { ComponentProps } from "react";
import { Body, Title } from "../primitives/Text";
import { Box } from "../primitives/Box";
import { Column, Columns } from "../primitives/Columns";
import GorliumImage from "./GorliumImage";

interface PostSectionProps {
  imgPath?: string;
  title: string;
  text: string[];
  imgSize?: ComponentProps<typeof Column>["width"];
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
      <Columns
        space={16}
        collapseBelow="desktop"
        reverse={{
          mobile: false,
          tablet: false,
          desktop: imgAlignRight ? imgAlignRight : false,
          wide: imgAlignRight ? imgAlignRight : false,
        }}
      >
        {imgPath && (
          <Column width={imgSize ? imgSize : "1/5"}>
            <Box padding={8}></Box>
            <GorliumImage path={imgPath} />
          </Column>
        )}
        <Column>
          <Body size="medium" align="left">
            {text.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {children}
          </Body>
        </Column>
      </Columns>
    </>
  );
}

export default PostSection;
