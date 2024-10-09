import { useEffect, useState } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FullyConnectedLayer() {
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
        <div className="h-64 mb-4 flex justify-center">
          <Bar options={options} data={chartData} />
        </div>
        <p className="text-sm text-gray-300">
          Note: This chart shows a simulated output because our model isn't
          trained yet. In a trained model, you would see higher probabilities
          for the correct digit and lower probabilities for others.
        </p>
      </CardContent>
    </Card>
  );
}
