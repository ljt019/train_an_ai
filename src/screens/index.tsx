import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    invoke("reset_temp_assets_directory").then((data) => {
      console.log(data);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <Button onClick={() => navigate("/collect_data")}>
          Start Training
        </Button>
      </div>
    </div>
  );
}
