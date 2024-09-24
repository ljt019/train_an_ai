import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Index } from "./pages/index";
import { CollectData } from "./pages/collect_data";
import { Training } from "./pages/training";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/collect_data" element={<CollectData />} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </Router>
  );
}
