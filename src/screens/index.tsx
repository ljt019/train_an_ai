import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Cpu, Network } from "lucide-react";
import { useResetTempAssetsDirectory } from "@/hooks/api/file_commands/useResetTempAssetsDirectory";

export default function Index() {
  const navigate = useNavigate();

  const { mutate: resetTempAssetsDirectory } = useResetTempAssetsDirectory();

  useEffect(() => {
    resetTempAssetsDirectory();
  }, [resetTempAssetsDirectory]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-500 text-white">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
          AI Learning Experience
        </h1>
        <div className="flex justify-center space-x-8 animate-fade-in">
          <Brain className="w-16 h-16" />
          <Cpu className="w-16 h-16" />
          <Network className="w-16 h-16" />
        </div>
        <p className="text-xl mb-8 animate-fade-in">
          Dive into the world of Artificial Intelligence. Draw, train, and
          witness machine learning in action!
        </p>
        <Button
          onClick={() => navigate("/base-info")}
          className="text-lg px-8 py-4 bg-white text-purple-700 hover:bg-purple-100 transition-all duration-800 animate-slow-bounce"
        >
          Begin Training Your AI
        </Button>
      </div>
    </div>
  );
}
