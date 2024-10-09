import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

export function useApplyPoolingFilter(): UseMutationResult<
  string,
  string,
  void,
  unknown
> {
  return useMutation<string, string, void, unknown>({
    mutationFn: async () => {
      // Invoke the backend command without any arguments
      const base64Image: string = await invoke("apply_pooling_filter");
      return base64Image;
    },
    onError: (error) => {
      console.error("Error applying pooling filter:", error);
    },
    onSuccess: () => {
      console.log("Pooling filter applied successfully.");
    },
  });
}
