import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri"; // Correct import path
import { useNavigate } from "react-router-dom";

export default function Training() {
  const navigate = useNavigate();

  const handleTrain = async () => {
    try {
      await invoke("train");
      console.log("Training started");
      navigate("/predict_canvas");
    } catch (error) {
      console.error("Error starting training:", error);
    }
  };

  return (
    <div className="h-screen justify-center items-center flex">
      <Button onClick={handleTrain}>Train</Button>
    </div>
  );
}
