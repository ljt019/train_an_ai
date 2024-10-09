import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

export function useApplyConvFilter(): UseMutationResult<
  string,
  string,
  void,
  unknown
> {
  return useMutation<string, string, void, unknown>({
    mutationFn: async () => {
      // Invoke the backend command without any arguments
      const base64Image: string = await invoke("apply_conv_filter");
      return base64Image;
    },
    onError: (error) => {
      console.error("Error applying convolution filter:", error);
    },
    onSuccess: () => {
      console.log("Convolution filter applied successfully.");
    },
  });
}
