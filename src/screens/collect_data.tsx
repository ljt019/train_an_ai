import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSaveDrawing } from "@/hooks/api/backend_hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Pencil } from "lucide-react";

const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function CollectData() {
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
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
  }, [currentSymbol]);

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

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (currentSymbol === symbols.length - 1) {
          navigate("/training-and-info");
        } else {
          setCurrentSymbol((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to save drawing:", error);
      }
    }
  };

  const isLastDrawing = currentSymbol === symbols.length - 1;
  const progress = ((currentSymbol + 1) / symbols.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
            <Pencil className="mr-2" /> Draw {symbols[currentSymbol]}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            className="border-4 border-white rounded-lg shadow-lg"
            aria-label={`Drawing canvas for symbol ${symbols[currentSymbol]}`}
          />
          <Button
            onClick={saveDrawing}
            className="w-full max-w-xs text-lg px-6 py-3 bg-white text-purple-700 hover:bg-purple-100 transition-all duration-800 animate-slow-bounce"
            disabled={saveDrawingMutation.isPending}
          >
            {saveDrawingMutation.isPending ? (
              "Saving..."
            ) : isLastDrawing ? (
              <>
                Save and Begin Training <ArrowRight className="ml-2" />
              </>
            ) : (
              "Save and Next"
            )}
          </Button>
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-center">
              {isLastDrawing
                ? "This is the last symbol. After saving, you'll proceed to training."
                : `Symbol ${currentSymbol + 1} of ${symbols.length}`}
            </p>
          </div>
          {saveDrawingMutation.isError && (
            <p className="text-red-300 animate-fade-in">
              Error saving drawing. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
