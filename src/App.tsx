import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./screens/index";
import CollectData from "./screens/collect_data";
import PredictCanvas from "./screens/predict-canvas";
import BaseInfo from "./screens/base_info";
import ModelLayersAndTraining from "./screens/ModelLayersAndTraining";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/base-info" element={<BaseInfo />} />
          <Route path="/collect-training-data" element={<CollectData />} />
          <Route
            path="/training-and-info"
            element={<ModelLayersAndTraining />}
          />
          <Route path="/predict_canvas" element={<PredictCanvas />} />
        </Routes>
      </QueryClientProvider>
    </Router>
  );
}

/*
Planning:

Routes
 - / (Index)
 - /base-info
 - /collect-training-data
 - /training-and-info 
 - /prediction-canvas

*/
