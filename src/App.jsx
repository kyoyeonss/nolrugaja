import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Mappage from "./pages/Mappage";
import DetailPage from "./pages/DetailPage";
import RankingPage from "./pages/RankingPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/map" element={<Mappage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
