import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";

interface PredictFromDataPayload {
  imageData: string;
}

export function useGetPredictionFromData({
  imageData,
}: PredictFromDataPayload) {
  return useQuery<number, Error>({
    queryKey: ["predict_from_data", imageData], // Unique query key including imageData
    queryFn: async () => {
      // Invoke the backend command with the provided imageData
      const prediction: number = await invoke("predict_from_data", {
        imageData,
      });
      return prediction;
    },
    enabled: !!imageData, // Only run the query if imageData is provided
    retry: 1,
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  });
}
