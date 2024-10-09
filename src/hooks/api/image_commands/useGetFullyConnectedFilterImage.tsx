import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

export function useApplyFullyConnectedFilter(): UseMutationResult<
  string,
  Error,
  void,
  unknown
> {
  return useMutation<string, Error, void, unknown>({
    mutationFn: async () => {
      try {
        // Invoke the backend command without any arguments
        const base64Image: string = await invoke(
          "apply_fully_connected_filter"
        );
        return base64Image;
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
      console.error("Error applying fully connected filter:", error);
    },
    onSuccess: () => {
      console.log("Fully connected filter applied successfully.");
    },
  });
}
