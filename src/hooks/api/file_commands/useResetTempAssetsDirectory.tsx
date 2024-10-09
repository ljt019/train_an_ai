// src/hooks/api/ai_commands/useResetTempAssetsDirectory.ts
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

export function useResetTempAssetsDirectory(): UseMutationResult<
  void,
  string,
  void,
  unknown
> {
  return useMutation<void, string, void, unknown>({
    mutationFn: async () => {
      try {
        // Invoke the backend command without any arguments
        await invoke<void>("reset_temp_assets_directory");
      } catch (error) {
        // Handle and format the error
        if (typeof error === "string") {
          throw new Error(error);
        } else if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error("An unknown error occurred.");
        }
      }
    },
    onError: (error) => {
      console.error("Error resetting temp-assets directory:", error);
    },
    onSuccess: () => {
      console.log("Successfully reset temp-assets directory.");
    },
  });
}
