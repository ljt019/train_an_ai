// src/components/layers.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs";

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

export function FullyConnectedLayer({ image_path }: LayerProps) {
  const [processedImage, setProcessedImage] = useState<string>("");
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        // Invoke the backend command to apply fully connected filter
        const fcFilename: string = await invoke(
          "apply_fully_connected_filter",
          { image_path }
        );

        // Use the absolute path returned by the backend directly
        const absolutePath = fcFilename;

        // Read the processed image as binary data
        const binaryData = await readBinaryFile(absolutePath);

        // Convert binary data to Base64
        const base64Data = convertToBase64(binaryData);

        // Set the processed image as a data URL
        setProcessedImage(`data:image/png;base64,${base64Data}`);
      } catch (error) {
        console.error("Error processing fully connected layer:", error);
        setErrorOccurred(true);
      }
    };

    processImage();
  }, [image_path]);

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-4">
          The fully connected layer is like the brain making a final decision.
          It takes the information processed from the previous layers and uses
          it to decide what the image represents. The convolutional layers
          simplified the images to important shapes and information, and the
          pooling layers reduced the image size. This is crucial for AI models
          trained on larger datasets, as smaller images reduce both the
          resources needed for training and the training time.
        </p>
        {processedImage ? (
          <img
            src={processedImage}
            alt="Fully Connected Layer"
            className="rounded-lg mx-auto"
          />
        ) : (
          <p>
            {errorOccurred
              ? "An error occurred while processing the image."
              : "Processing fully connected layer..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
