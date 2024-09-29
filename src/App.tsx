import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./screens/index";
import CollectData from "./screens/collect_data";
import Training from "./screens/training";
import ModelLayers from "./screens/model-layers/model_layers";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collect_data" element={<CollectData />} />
          <Route path="/model_layers" element={<ModelLayers />} />
          <Route path="/training" element={<Training />} />
        </Routes>
      </QueryClientProvider>
    </Router>
  );
}
