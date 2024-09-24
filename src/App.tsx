import { Button } from "@/components/ui/button";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [count, setCount] = useState(0);

  async function increment(currentCount: number) {
    setCount(await invoke("count_increment", { currentCount }));
  }

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <Button onClick={() => increment(count)}>Click me!</Button>
      <h1>{count}</h1>
    </div>
  );
}

export default App;
