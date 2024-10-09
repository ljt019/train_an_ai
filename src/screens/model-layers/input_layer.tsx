import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessedImage from "@/components/processed_image";

export default function InputLayer() {
  const [inputImage, setInputImage] = useState<string>("");
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const fetchInputImage = async () => {
      try {
        const base64Data: string = await invoke("get_input_image");
        setInputImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error fetching input image:", error);
        setErrorOccurred(true);
      }
    };

    fetchInputImage();
  }, []);

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Input Layer</CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <p className="mb-4">
          The input layer is the gateway for our CNN. It takes in the raw image
          data, which in our case is a 28x28 pixel grayscale image of a
          handwritten digit. This layer doesn't perform any processing; its job
          is to pass the pixel values to the next layer.
        </p>
        <p className="mb-4">
          Each pixel in the image becomes a neuron in this layer, so we have 784
          (28 * 28) input neurons. The brightness of each pixel is represented
          as a number between 0 (black) and 255 (white).
        </p>
        <ProcessedImage
          processedImage={inputImage}
          errorOccurred={errorOccurred}
        />
      </CardContent>
    </Card>
  );
}
