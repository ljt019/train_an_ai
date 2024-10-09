import { Loader2 } from "lucide-react";
import ExpandableImage from "@/components/expandable_image";
import { useEffect, useState } from "react";

interface ProcessedImageProps {
  mutationFn: () => Promise<string>;
  isPending: boolean;
  isError: boolean;
  error: string | null;
}

export default function ProcessedImage({
  mutationFn,
  isPending,
  isError,
  error,
}: ProcessedImageProps) {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // Trigger mutation on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await mutationFn();
      setProcessedImage(data);
    };
    fetchData();
  }, [mutationFn]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !processedImage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          An error occurred while processing the image. Error: {error}
        </p>
      </div>
    );
  }

  return (
    <>
      <img
        src={processedImage}
        alt="Convolutional Layer"
        className="rounded-lg mx-auto mb-4 w-64 h-64 object-cover"
      />
      <ExpandableImage src={processedImage} alt="Convolutional Layer" />
    </>
  );
}
