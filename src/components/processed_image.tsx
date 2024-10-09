import { Loader2 } from "lucide-react";
import ExpandableImage from "@/components/expandable_image";

export default function ProcessedImage({
  processedImage,
  errorOccurred,
}: {
  processedImage: string;
  errorOccurred: boolean;
}) {
  return (
    <>
      {processedImage ? (
        <>
          <img
            src={processedImage}
            alt="Convolutional Layer"
            className="rounded-lg mx-auto mb-4 w-64 h-64 object-cover"
          />
          <ExpandableImage src={processedImage} alt="Convolutional Layer" />
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          {errorOccurred ? (
            <p className="text-red-500">
              An error occurred while processing the image.
            </p>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin" />
          )}
        </div>
      )}
    </>
  );
}
