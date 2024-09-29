import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri"; // Correct import path

export default function Training() {
  const handleTrain = async () => {
    try {
      await invoke("train");
      console.log("Training started");
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
