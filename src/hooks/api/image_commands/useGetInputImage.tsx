// src/hooks/api/ai_commands/useGetInputImage.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

export function useGetInputImage(): UseQueryResult<string, string> {
  return useQuery<string, string>({
    queryKey: ["get_input_image"], // Unique query key
    queryFn: async () => {
      // Invoke the backend command without any arguments
      const base64Image: string = await invoke("get_input_image");
      return base64Image;
    },
    enabled: true, // Automatically run the query
    retry: 1, // Retry once on failure
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  });
}
