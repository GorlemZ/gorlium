import { Route, BrowserRouter, Routes } from "react-router-dom";
import Hub from "./pages/Hub";
import TerrariumLayout from "./layouts/TerrariumLayout";
import TerrariumHome from "./pages/TerrariumHome";
import Terrariums from "./pages/Terrariums";
import Dev from "./pages/Dev";
import Contacts from "./pages/Contacts";
import { Instructions } from "./pages/Instructions";
import BalticiLayout from "./layouts/BalticiLayout";
import BalticiHome from "./pages/baltici/BalticiHome";
import BalticiExpenses from "./pages/baltici/BalticiExpenses";
import BalticiAddExpense from "./pages/baltici/BalticiAddExpense";
import BalticiSettleUp from "./pages/baltici/BalticiSettleUp";
import BalticiSettledDebts from "./pages/baltici/BalticiSettledDebts";
import BalticiPeople from "./pages/baltici/BalticiPeople";

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
        <Route path="/secret-baltici" element={<BalticiLayout />}>
          <Route index element={<BalticiHome />} />
          <Route path="expenses" element={<BalticiExpenses />} />
          <Route path="expenses/new" element={<BalticiAddExpense />} />
          <Route path="expenses/:id/edit" element={<BalticiAddExpense />} />
          <Route path="who-owes" element={<BalticiSettleUp />} />
          <Route path="settled" element={<BalticiSettledDebts />} />
          <Route path="people" element={<BalticiPeople />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
