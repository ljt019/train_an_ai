import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import InputLayer from "@/screens/model-layers/input_layer";
import ConvolutionalLayer from "@/screens/model-layers/convolutional_layer";
import PoolingLayer from "@/screens/model-layers/pooling_layer";
import FullyConnectedLayer from "@/screens/model-layers/fully_connected_layer";
import { useTrain } from "@/hooks/api/ai_commands/useTrain";

const LAYERS = [
  { component: InputLayer, title: "Input Layer" },
  { component: ConvolutionalLayer, title: "Convolutional Layer" },
  { component: PoolingLayer, title: "Pooling Layer" },
  { component: FullyConnectedLayer, title: "Fully Connected Layer" },
];

export default function ModelLayersAndTraining() {
  const [currentLayer, setCurrentLayer] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const navigate = useNavigate();

  const {
    mutate: train,
    isPending: isTraining,
    isComplete,
    error,
  } = useTrain();

  const hasTrainedRef = useRef(false);

  useEffect(() => {
    if (!hasTrainedRef.current) {
      hasTrainedRef.current = true;
      train();
    }
  }, [train]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTraining && !isComplete) {
      interval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev < 99) {
            const increment = Math.random() * 0.1 + 0.05;
            return Math.min(prev + increment, 99);
          }
          return prev;
        });
      }, 100);
    } else if (isComplete) {
      setTrainingProgress(100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTraining, isComplete]);

  const nextLayer = () =>
    setCurrentLayer((prev) => Math.min(prev + 1, LAYERS.length - 1));
  const prevLayer = () => setCurrentLayer((prev) => Math.max(prev - 1, 0));

  const CurrentLayerComponent = LAYERS[currentLayer].component;

  const allLayersViewed = currentLayer === LAYERS.length - 1;

  return (
    <div className="mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in-down">
        CNN Model Layers and Training
      </h1>

      <div className="space-y-8">
        <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">
              {LAYERS[currentLayer].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <CurrentLayerComponent />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={prevLayer}
              disabled={currentLayer === 0}
              className="bg-white text-black border-none hover:bg-gray-200"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Layer
            </Button>
            <Button
              onClick={nextLayer}
              disabled={currentLayer === LAYERS.length - 1}
              className="bg-white text-black border-none hover:bg-gray-200"
            >
              Next Layer <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Training Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                {isTraining && !isComplete ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="h-5 w-5" />
                )}
                <span>
                  {isComplete
                    ? "Training complete!"
                    : isTraining
                    ? "Training in progress..."
                    : "Training not started"}
                </span>
                <span>{trainingProgress.toFixed(2)}%</span>
              </div>
              <Progress
                className="w-full rounded-full h-2.5"
                value={trainingProgress}
              />
            </div>
            {error && (
              <div className="p-4 bg-red-500/20 text-red-100 rounded w-full text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => navigate("/predict_canvas")}
              disabled={!allLayersViewed || !isComplete}
              className="w-full max-w-xs bg-white text-black border-none hover:bg-gray-200"
            >
              {!isComplete
                ? "Training in Progress..."
                : !allLayersViewed
                ? "View All Layers to Continue"
                : !isComplete
                ? "Waiting for Training to Complete"
                : "Start Predicting"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
