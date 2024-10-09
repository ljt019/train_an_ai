import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useTrain() {
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<void, string, void>({
    mutationFn: async () => {
      await invoke("train");
    },
  });

  useEffect(() => {
    const trainingCompleteUnlisten = listen("training_complete", () => {
      setIsComplete(true);
    });

    const trainingErrorUnlisten = listen(
      "training_error",
      (event: { payload: string }) => {
        setError(event.payload);
      }
    );

    return () => {
      trainingCompleteUnlisten.then((fn) => fn());
      trainingErrorUnlisten.then((fn) => fn());
    };
  }, []);

  return {
    ...mutation,
    isComplete,
    error,
  };
}
