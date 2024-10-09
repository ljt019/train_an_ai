import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessedImage from "@/components/processed_image";
import { useApplyConvFilter } from "@/hooks/api/image_commands/useApplyConvFilter";

export default function ConvolutionalLayer() {
  const { mutateAsync, isPending, isError, error } = useApplyConvFilter();

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          Convolutional Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <p className="mb-4">
          The convolutional layer is where the magic begins. It uses filters
          (also called kernels) to scan across the image, detecting features
          like edges, curves, and textures. Each filter is a small matrix (e.g.,
          3x3 or 5x5) that slides over the input image, performing element-wise
          multiplication and summing the results.
        </p>
        <p className="mb-4">
          This process creates a feature map that highlights where certain
          features appear in the image. Multiple filters are used, each
          potentially detecting different features, resulting in multiple
          feature maps.
        </p>
        <ProcessedImage
          mutationFn={mutateAsync}
          isPending={isPending}
          isError={isError}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
