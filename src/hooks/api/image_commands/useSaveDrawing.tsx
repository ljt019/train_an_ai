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
