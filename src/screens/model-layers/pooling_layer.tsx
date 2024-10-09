import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessedImage from "@/components/processed_image";

export default function PoolingLayer() {
  const [processedImage, setProcessedImage] = useState<string>("");
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        const base64Data: string = await invoke("apply_pooling_filter");
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing pooling layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  }, []);

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Pooling Layer</CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <p className="mb-4">
          The pooling layer follows the convolutional layer and serves to reduce
          the spatial dimensions of the feature maps. This reduction helps to
          decrease the computational load, memory usage, and number of
          parameters, thus controlling overfitting.
        </p>
        <p className="mb-4">
          The most common type of pooling is max pooling, where we take the
          maximum value in each pooling window. For example, in 2x2 max pooling,
          we divide the input into 2x2 windows and keep only the maximum value
          from each window.
        </p>
        <ProcessedImage
          processedImage={processedImage}
          errorOccurred={errorOccurred}
        />
      </CardContent>
    </Card>
  );
}
