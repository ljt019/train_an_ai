// src/components/CollectData.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSaveDrawing } from "@/hooks/api/backend_hooks";

const symbols = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "-",
  "×",
  "÷",
  "=",
];

export default function CollectData() {
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const navigate = useNavigate();

  // Initialize the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [currentSymbol]);

  // Initialize the saveDrawing mutation
  const saveDrawingMutation = useSaveDrawing();

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

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      const symbol = symbols[currentSymbol];

      try {
        await saveDrawingMutation.mutateAsync({ imageData, symbol });

        // Clear the canvas
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (currentSymbol === symbols.length - 1) {
          // If it's the last symbol, navigate to the model layers page
          navigate("/model_layers");
        } else {
          // Move to the next symbol
          setCurrentSymbol((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to save drawing:", error);
        // Optionally, you can show an error message to the user here
      }
    }
  };

  const isLastDrawing = currentSymbol === symbols.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Draw {symbols[currentSymbol]}</h1>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        className="border-2 border-gray-300 rounded-lg shadow-md"
        aria-label={`Drawing canvas for symbol ${symbols[currentSymbol]}`}
      />
      <button
        onClick={saveDrawing}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label={
          isLastDrawing
            ? "Save and begin training"
            : "Save and go to next symbol"
        }
        disabled={saveDrawingMutation.isPending}
      >
        {saveDrawingMutation.isPending
          ? "Saving..."
          : isLastDrawing
          ? "Save and Begin Training"
          : "Save and Next"}
      </button>
      <p className="mt-4 text-sm text-gray-600">
        {isLastDrawing
          ? "This is the last symbol. After saving, you'll proceed to training."
          : `Symbol ${currentSymbol + 1} of ${symbols.length}`}
      </p>
      {saveDrawingMutation.isError && (
        <p className="mt-2 text-red-500">
          Error saving drawing. Please try again.
        </p>
      )}
    </div>
  );
}
