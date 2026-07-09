import { Route, BrowserRouter, Routes } from "react-router-dom";
import Hub from "./pages/Hub";
import TerrariumLayout from "./layouts/TerrariumLayout";
import TerrariumHome from "./pages/TerrariumHome";
import Terrariums from "./pages/Terrariums";
import Dev from "./pages/Dev";
import Contacts from "./pages/Contacts";
import { Instructions } from "./pages/Instructions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/terrariums" element={<TerrariumLayout />}>
          <Route index element={<TerrariumHome />} />
          <Route path="gallery" element={<Terrariums />} />
          <Route path="how-to" element={<Instructions />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="dev" element={<Dev />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
