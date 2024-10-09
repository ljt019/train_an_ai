import { invoke } from "@tauri-apps/api/tauri";
import { useMutation } from "@tanstack/react-query";

export function useTrain() {
  return useMutation<void, string, void>({
    mutationFn: async () => {
      return await invoke("train");
    },
  });
}
