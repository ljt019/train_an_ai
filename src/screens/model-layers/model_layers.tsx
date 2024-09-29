import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  ConvolutionalLayer,
  FullyConnectedLayer,
  InputLayer,
  PoolingLayer,
} from "./layers";

const IMAGE_PATH = "../../../src-tauri/drawings/3.png";
const LAYERS = [
  { component: InputLayer, title: "Input Layer" },
  { component: ConvolutionalLayer, title: "Convolutional Layer" },
  { component: PoolingLayer, title: "Pooling Layer" },
  { component: FullyConnectedLayer, title: "Fully Connected Layer" },
];

export default function ModelLayers() {
  const [currentLayer, setCurrentLayer] = useState(0);
  const navigate = useNavigate();

  const nextLayer = () =>
    setCurrentLayer((prev) => Math.min(prev + 1, LAYERS.length - 1));
  const prevLayer = () => setCurrentLayer((prev) => Math.max(prev - 1, 0));

  const CurrentLayerComponent = LAYERS[currentLayer].component;

  const isLastLayer = currentLayer === LAYERS.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        CNN Layer Visualization
      </h1>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {LAYERS[currentLayer].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <CurrentLayerComponent image_path={IMAGE_PATH} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={prevLayer}
            disabled={currentLayer === 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous Layer
          </Button>
          {isLastLayer ? (
            <Button onClick={() => navigate("/training")} variant="outline">
              Continue to Training <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={nextLayer} variant="outline">
              Next Layer <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
