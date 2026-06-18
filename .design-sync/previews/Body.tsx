import { Body, Stack } from "@gorlium/design-system";

export const Sizes = () => (
  <Stack space={16}>
    <Body size="large">Those tiny jars of greenery are like a whole world in miniature.</Body>
    <Body size="medium">Terrariums are about balance — and soil is at the heart of that.</Body>
    <Body size="small">PS. This fucker and his brother eat all my plants.</Body>
  </Stack>
);

export const Paragraphs = () => (
  <Body size="medium" align="left">
    <p>The first time I made a terrarium, I failed spectacularly.</p>
    <p>I thought I could just throw some plants into a jar, and they'd thrive. Spoiler: they didn't.</p>
  </Body>
);
