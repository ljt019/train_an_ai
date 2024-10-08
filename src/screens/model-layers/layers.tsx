import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ZoomIn } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function convertToBase64(buffer: Uint8Array): string {
  let binary = "";
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return window.btoa(binary);
}

interface LayerProps {
  image_path: string;
}

function ExpandableImage({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-white text-black border-none hover:bg-white/80 hover:text-black"
        >
          <ZoomIn className="mr-2 h-4 w-4" /> Expand Image
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl">
        <img src={src} alt={alt} className="w-full h-auto" />
      </DialogContent>
    </Dialog>
  );
}

export function InputLayer({ image_path }: LayerProps) {
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
        <img
          src={image_path}
          alt="Input Layer"
          className="rounded-lg mx-auto mb-4 w-64 h-64 object-cover"
        />
        <ExpandableImage src={image_path} alt="Input Layer" />
      </CardContent>
    </Card>
  );
}

export function ConvolutionalLayer({ image_path }: LayerProps) {
  const [processedImage, setProcessedImage] = useState<string>("");
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        const convFilename: string = await invoke("apply_conv_filter", {
          imagePath: image_path,
        });
        const absolutePath = convFilename;
        const binaryData = await readBinaryFile(absolutePath);
        const base64Data = convertToBase64(binaryData);
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing convolutional layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  }, [image_path]);

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
      </CardContent>
    </Card>
  );
}

export function PoolingLayer({ image_path }: LayerProps) {
  const [processedImage, setProcessedImage] = useState<string>("");
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        const poolFilename: string = await invoke("apply_pooling_filter", {
          image_path,
        });
        const absolutePath = poolFilename;
        const binaryData = await readBinaryFile(absolutePath);
        const base64Data = convertToBase64(binaryData);
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing pooling layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  }, [image_path]);

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
        {processedImage ? (
          <>
            <img
              src={processedImage}
              alt="Pooling Layer"
              className="rounded-lg mx-auto mb-4 w-64 h-64 object-cover"
            />
            <ExpandableImage src={processedImage} alt="Pooling Layer" />
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
      </CardContent>
    </Card>
  );
}

export function FullyConnectedLayer() {
  const [chartData, setChartData] = useState<
    ChartData<"bar", number[], string>
  >({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    const labels = Array.from({ length: 10 }, (_, i) => i.toString());
    const data = labels.map((label) =>
      label === "3" ? 0.9 : Math.random() * 0.1
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Probability",
          data,
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderColor: "rgba(129, 140, 248, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "CNN Output Probabilities",
        color: "white",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: "Probability",
          color: "white",
        },
        ticks: {
          color: "white",
        },
      },
      x: {
        title: {
          display: true,
          text: "Digit",
          color: "white",
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          Fully Connected Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <p className="mb-4">
          The fully connected layer is the final layer in our CNN. It takes the
          high-level features learned by the convolutional and pooling layers
          and uses them to classify the input image into one of the possible
          digit classes (0-9).
        </p>
        <p className="mb-4">
          In this layer, every neuron is connected to every neuron from the
          previous layer, hence the name "fully connected". The output of this
          layer is a probability distribution over the 10 possible digit
          classes.
        </p>
        <div className="h-64 mb-4">
          <Bar options={options} data={chartData} />
        </div>
        <p className="text-sm text-gray-300">
          Note: This chart shows a simulated output. In a trained model, you
          would see higher probabilities for the correct digit and lower
          probabilities for others.
        </p>
      </CardContent>
    </Card>
  );
}
