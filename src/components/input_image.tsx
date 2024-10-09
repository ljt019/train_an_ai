import { Loader2 } from "lucide-react";
import ExpandableImage from "@/components/expandable_image";

interface InputImageProps {
  data: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export default function InputImage({
  data,
  isLoading,
  isError,
  error,
}: InputImageProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          An error occurred while fetching the input image. Error: {error}
        </p>
      </div>
    );
  }

  const imageSrc = `data:image/png;base64,${data}`;

  return (
    <>
      <img
        src={imageSrc}
        alt="Input Layer"
        className="rounded-lg mx-auto mb-4 w-64 h-64 object-cover"
      />
      <ExpandableImage src={data} alt="Input Layer" />
    </>
  );
}
