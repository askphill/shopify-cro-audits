import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuditPage } from "./pages/AuditPage";
import { NotFound } from "./components/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:id" element={<AuditPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
