import {
  Header,
  Banner,
  Title,
  Inline,
  Stack,
} from "@gorlium/design-system";
import Homepage from "./pages/Homepage";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Lore from "./pages/Lore";
import Terrariums from "./pages/Terrariums";
import Dev from "./pages/Dev";
import Contacts from "./pages/Contacts";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Instructions } from "./pages/Instructions";

function App() {
  // const [isEng, setIsEng] = useState(() => {
  //   const savedLang = localStorage.getItem("language");
  //   return savedLang ? savedLang === "en" : false;
  // });

  const handleLanguageChange = () => {
    // Temporarily disable language switching
    console.log("Language switching is disabled.");
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <div style={{ maxWidth: "1400px", margin: "0 auto", overflow: "hidden" }}>
        <Stack
          space={16}
          align={{
            mobile: "center",
            tablet: "center",
            desktop: "center",
            wide: "center",
          }}
        >
          <Header
            onToggleLanguage={handleLanguageChange}
            initialLanguage={"it"}
            list={[
              [t("header.home"), "/"],
              [t("header.terrariums"), "terrariums"],
              [t("header.instructions"), "instructions"],
              [t("header.contacts"), "contacts"],
              [t("header.dev"), "dev"],
            ]}
          />
          <div
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/terrariums" element={<Terrariums />} />
              <Route path="/dev" element={<Dev />} />
              <Route path="/contacts" element={<Contacts />} />
            </Routes>
          </div>
          <Banner>
            <Title size={"medium"}>{t("bannerWelcome")}</Title>
          </Banner>
        </Stack>
      </div>
    </BrowserRouter>
  );
}
export default App;
