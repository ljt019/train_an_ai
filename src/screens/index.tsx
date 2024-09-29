import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <Button onClick={() => navigate("/collect_data")}>Start Training</Button>
    </div>
  );
}
