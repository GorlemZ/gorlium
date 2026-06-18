import { Box } from "../../primitives/Box";
import { Button } from "../../primitives/Button";
import { Inline } from "../../primitives/Inline";

interface LanguageSwitchProps {
  onChange: () => void;
  initialLanguage: "en" | "it";
}

function LanguageSwitch({ onChange, initialLanguage }: LanguageSwitchProps) {
  return (
    <Inline
      alignY="stretch"
      collapseBelow="desktop"
      space={0}
      align={{
        mobile: "center",
        tablet: "center",
        desktop: "center",
      }}
      reverse={{
        mobile: true,
        tablet: true,
        desktop: false,
      }}
    >
      <Box padding={24}></Box>
      {/* Temporarily disable the button to prevent language switching */}
      <Button
        label={initialLanguage}
        kind="solid"
        hierarchy="primary"
        onPress={onChange}
      ></Button>
    </Inline>
  );
}

export default LanguageSwitch;
