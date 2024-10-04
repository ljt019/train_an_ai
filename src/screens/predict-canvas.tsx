// src/components/PredictCanvas.tsx
import React, { useState, useRef, useEffect } from "react";
import { useMakeDataPrediction } from "@/hooks/api/backend_hooks";
import { useNavigate } from "react-router-dom";

export default function PredictCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize the canvas with black background and white drawing color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set background to black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Set drawing color to white
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
      }
    }
  }, []);

  // Initialize the makeDataPrediction mutation
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
        // Refill with black background
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

      // Remove the "data:image/png;base64," prefix
      const base64Data = imageData.split(",").pop() || "";

      try {
        // **IMPORTANT:** Ensure the parameter name matches the backend expectation.
        // If the backend expects 'image_data', use that instead of 'imageData'.
        const pred = await makeDataPredictionMutation.mutateAsync({
          imageData: base64Data, // Changed from imageData to image_data
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

  const handleDoneDrawing = () => {
    // Navigate to the home page ("/") or index route
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Draw a Symbol for Prediction</h1>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        className="border-2 border-gray-300 rounded-lg shadow-md"
        aria-label="Drawing canvas for prediction"
      />
      <div className="mt-4 flex space-x-4">
        <button
          onClick={predictDrawing}
          className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          disabled={makeDataPredictionMutation.isPending}
          aria-label="Predict drawing"
        >
          {makeDataPredictionMutation.isPending ? "Predicting..." : "Predict"}
        </button>
        <button
          onClick={clearCanvas}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Clear canvas"
        >
          Clear
        </button>
        {/* New "Done Drawing" Button */}
        <button
          onClick={handleDoneDrawing}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Done Drawing"
        >
          Done Drawing
        </button>
      </div>
      {prediction !== null && (
        <p className="mt-4 text-xl">
          <strong>Prediction:</strong> {prediction}
        </p>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
