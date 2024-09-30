// src/components/layers.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export function InputLayer({ image_path }: LayerProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-4">
          The input layer takes in the original image that we want to analyze.
          Imagine you're showing a picture to a friend - this layer is the AI
          looking at that picture for the first time. Here's an example of what
          an input image might look like:
        </p>
        <img
          src={image_path}
          alt="Input Layer"
          className="rounded-lg mx-auto"
        />
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
        // Invoke the backend command to apply convolution filter
        const convFilename: string = await invoke("apply_conv_filter", {
          imagePath: image_path,
        });

        // Use the absolute path returned by the backend directly
        const absolutePath = convFilename;

        // Read the processed image as binary data
        const binaryData = await readBinaryFile(absolutePath);

        // Convert binary data to Base64
        const base64Data = convertToBase64(binaryData);

        // Set the processed image as a data URL
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing convolutional layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  });

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-4">
          The convolutional layer scans the image for important features, such
          as edges, corners, or simple shapes. Think of it as the AI learning to
          recognize the basic building blocks of the image. After this layer
          processes the image, it might look something like this:
        </p>
        {processedImage ? (
          <img
            src={processedImage}
            alt="Convolutional Layer"
            className="rounded-lg mx-auto"
          />
        ) : (
          <p>
            {errorOccurred
              ? "An error occurred while processing the image."
              : "Processing convolutional layer..."}
          </p>
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
        // Invoke the backend command to apply pooling filter
        const poolFilename: string = await invoke("apply_pooling_filter", {
          image_path,
        });

        // Use the absolute path returned by the backend directly
        const absolutePath = poolFilename;

        // Read the processed image as binary data
        const binaryData = await readBinaryFile(absolutePath);

        // Convert binary data to Base64
        const base64Data = convertToBase64(binaryData);

        // Set the processed image as a data URL
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing pooling layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  }, [image_path]);

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-4">
          The pooling layer is like a summarizer. It takes the information from
          the convolutional layer and simplifies it, keeping the most important
          parts while making the image smaller. This is similar to describing a
          picture to someone without mentioning every tiny detail—just the
          important parts. After pooling, the image might look like this:
        </p>
        {processedImage ? (
          <img
            src={processedImage}
            alt="Pooling Layer"
            className="rounded-lg mx-auto"
          />
        ) : (
          <p>
            {errorOccurred
              ? "An error occurred while processing the image."
              : "Processing pooling layer..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
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
      },
      title: {
        display: true,
        text: "CNN Output Probabilities",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: "Probability",
        },
      },
      x: {
        title: {
          display: true,
          text: "Digit",
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Fully Connected Layer Output
        </h2>
        <p className="mb-4">
          This visualization represents the output of the fully connected layer
          in our Convolutional Neural Network (CNN). Each bar shows the
          probability that the input image belongs to a particular digit class
          (0-9). Since we haven't trained our model yet, this is just a
          demonstration.
        </p>
        <div className="h-64">
          <Bar options={options} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
