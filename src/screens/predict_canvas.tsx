import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMakeDataPrediction } from "@/hooks/api/backend_hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Pencil, Trash2, Home } from "lucide-react";

export default function PredictCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
      }
    }
  }, []);

  const makeDataPredictionMutation = useMakeDataPrediction();

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
    setPrediction(null);
    setError(null);
  };

  const predictDrawing = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      const base64Data = imageData.split(",").pop() || "";

      try {
        const pred = await makeDataPredictionMutation.mutateAsync({
          imageData: base64Data,
        });
        setPrediction(pred);
        setError(null);
      } catch (err) {
        console.error("Prediction failed:", err);
        setError("Failed to get prediction.");
        setPrediction(null);
      }
    }
  };

  return (
    <div className="mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white justify-center items-center h-screen flex">
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Draw a Symbol for Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            className="border-2 border-white rounded-lg shadow-md"
            aria-label="Drawing canvas for prediction"
          />
          {prediction !== null && (
            <p className="text-2xl font-bold animate-fade-in">
              Prediction: {prediction}
            </p>
          )}
          {error && <p className="text-red-300 animate-fade-in">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            onClick={predictDrawing}
            disabled={makeDataPredictionMutation.isPending}
            className="bg-green-500 hover:bg-green-600"
          >
            {makeDataPredictionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Predict
              </>
            )}
          </Button>
          <Button onClick={clearCanvas} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
