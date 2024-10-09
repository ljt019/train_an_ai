// usePredictFromData.ts
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

interface PredictFromDataPayload {
  imageData: string;
}

export function usePredictFromData() {
  return useMutation<number, Error, PredictFromDataPayload>({
    mutationFn: async ({ imageData }) => {
      // Invoke the backend command with the provided imageData
      const prediction: number = await invoke("predict_from_data", {
        imageData,
      });
      return prediction;
    },
  });
}
