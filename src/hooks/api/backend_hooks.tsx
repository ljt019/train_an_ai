import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

interface SaveDrawingPayload {
  imageData: string;
  symbol: string;
}

export function useSaveDrawing() {
  return useMutation<void, Error, SaveDrawingPayload>({
    mutationFn: async ({ imageData, symbol }) => {
      await invoke("save_drawing", { imageData, symbol });
    },
  });
}

interface MakeDataPredictionPayload {
  imageData: string;
}

export function useMakeDataPrediction() {
  return useMutation<number, Error, MakeDataPredictionPayload>({
    mutationFn: async ({ imageData }) => {
      return await invoke("predict_from_data", { imageData });
    },
  });
}

interface MakePathPredictionPayload {
  path: string;
}

export function useMakePathPrediction() {
  return useMutation<string, Error, MakePathPredictionPayload>({
    mutationFn: async ({ path }) => {
      return await invoke("predict_from_path", { path });
    },
  });
}
