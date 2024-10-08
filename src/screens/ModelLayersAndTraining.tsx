import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
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
import {
  ConvolutionalLayer,
  FullyConnectedLayer,
  InputLayer,
  PoolingLayer,
} from "./model-layers/layers";

const IMAGE_PATH = "../../../src-tauri/drawings/3.png";
const LAYERS = [
  { component: InputLayer, title: "Input Layer" },
  { component: ConvolutionalLayer, title: "Convolutional Layer" },
  { component: PoolingLayer, title: "Pooling Layer" },
  { component: FullyConnectedLayer, title: "Fully Connected Layer" },
];

export default function ModelLayersAndTraining() {
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isTraining, setIsTraining] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const navigate = useNavigate();

  // Use a ref to track if training has started
  const trainingStarted = useRef(false);

  useEffect(() => {
    if (trainingStarted.current) {
      return;
    }
    trainingStarted.current = true;

    let unlistenComplete: UnlistenFn | null = null;
    let unlistenError: UnlistenFn | null = null;
    let unlistenProgress: UnlistenFn | null = null;

    const startTraining = async () => {
      try {
        await invoke("train");
        console.log("Training started");
      } catch (error) {
        console.error("Error starting training:", error);
        setIsTraining(false);
        setErrorMessage("Failed to start training. Please try again.");
      }
    };

    listen("training_complete", () => {
      setIsTraining(false);
      setTrainingComplete(true);
      setSuccessMessage("Training completed successfully!");
    }).then((fn) => {
      unlistenComplete = fn;
    });

    listen("training_error", (event) => {
      setIsTraining(false);
      setErrorMessage(`Training failed: ${event.payload}`);
    }).then((fn) => {
      unlistenError = fn;
    });

    listen("training_progress", (event) => {
      setTrainingProgress(event.payload as number);
    }).then((fn) => {
      unlistenProgress = fn;
    });

    startTraining();

    return () => {
      if (unlistenComplete) unlistenComplete();
      if (unlistenError) unlistenError();
      if (unlistenProgress) unlistenProgress();
    };
  }, []);

  // New useEffect to handle the training progress interval with varying increments
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev < 95) {
            // Generate a random increment between 0.05 and 0.15
            const increment = Math.random() * 0.1 + 0.05;
            const newProgress = prev + increment;
            // Ensure the progress does not exceed 95%
            return newProgress > 95 ? 95 : newProgress;
          }
          return prev;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isTraining]);

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
            <CardTitle className="text-2xl"></CardTitle>
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
            {isTraining && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Training in progress...</span>
                  <span>{trainingProgress.toFixed(2)}%</span>
                </div>
                <Progress
                  className="w-full rounded-full h-2.5"
                  value={trainingProgress}
                />
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-500/20 text-green-100 rounded w-full text-center">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-4 bg-red-500/20 text-red-100 rounded w-full text-center">
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => navigate("/predict_canvas")}
              disabled={!trainingComplete || !allLayersViewed}
              className="w-full max-w-xs bg-white text-black border-none hover:bg-gray-200"
            >
              {trainingComplete && allLayersViewed
                ? "Start Predicting"
                : trainingComplete
                ? "View All Layers to Continue"
                : "Training in Progress..."}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
