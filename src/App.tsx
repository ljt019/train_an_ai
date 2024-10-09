import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./screens/index";
import CollectData from "./screens/collect_data";
import PredictCanvas from "./screens/predict_canvas";
import BaseInfo from "./screens/base_info";
import ModelLayersAndTraining from "./screens/model_layers_and_training";

interface RouteConfig {
  path: string;
  screen: React.ComponentType;
}

const routesConfig: RouteConfig[] = [
  {
    path: "/",
    screen: Index,
  },
  {
    path: "/base-info",
    screen: BaseInfo,
  },
  {
    path: "/collect-training-data",
    screen: CollectData,
  },
  {
    path: "/training-and-info",
    screen: ModelLayersAndTraining,
  },
  {
    path: "/predict_canvas",
    screen: PredictCanvas,
  },
];

function AppScreens() {
  return (
    <Routes>
      {routesConfig.map((route, index) => (
        <Route key={index} path={route.path} element={<route.screen />} />
      ))}
    </Routes>
  );
}

export default function App() {
  const queryClient = new QueryClient();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AppScreens />
      </QueryClientProvider>
    </Router>
  );
}
