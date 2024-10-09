// PredictCanvas.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePredictFromData } from "@/hooks/api/ai_commands/usePredictFromData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Pencil, Trash2, Home } from "lucide-react";

export default function PredictCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const {
    mutateAsync: predictDrawing,
    data: prediction,
    error,
    isPending,
    reset,
  } = usePredictFromData();

  const [isDrawing, setIsDrawing] = useState(false);

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
      reset();
    }
  };

  const handlePredictDrawing = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageDataURL = canvas.toDataURL("image/png");
      const base64Data = imageDataURL.split(",").pop() || "";
      try {
        await predictDrawing({ imageData: base64Data });
      } catch (err) {
        console.error("Prediction failed:", err);
      }
    }
  };

  return (
    <div className="mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white justify-center items-center h-screen flex">
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Get A Prediction!
          </CardTitle>
          <CardDescription className="text-white/60 text-center text-[1rem]">
            Draw a number between 0 and 9 on the canvas below and click the
            predict button to get the prediction from the model you just
            trained!
          </CardDescription>
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
          {prediction !== undefined && (
            <p className="text-2xl font-bold animate-fade-in">
              Prediction: {prediction}
            </p>
          )}
          {error && (
            <p className="text-red-300 animate-fade-in">
              {error.message || "Failed to get prediction."}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            onClick={handlePredictDrawing}
            disabled={isPending}
            className="bg-green-500 hover:bg-green-600"
          >
            {isPending ? (
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
