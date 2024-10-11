import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Pencil, Layers } from "lucide-react";

export default function BaseInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in-down">
          Welcome to the AI Training Experience
        </h1>

        <Card className="bg-white/10 backdrop-blur-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Pencil className="mr-2" /> Your Role in Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              In the next step, you'll be asked to draw the numbers 1-9. These
              drawings will be used to train a Convolutional Neural Network
              (CNN) model. As your drawings pass through the layers of the CNN,
              the model will learn to recognize the numbers you draw and be able
              to identify similar numbers in the future. Once training is
              complete, you'll be able to draw more numbers and see the AI
              predict what you've drawn—all thanks to your drawings.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Brain className="mr-2" /> What is a CNN?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A Convolutional Neural Network (CNN) is a type of artificial
              intelligence that's particularly good at processing grid-like
              data, such as images. It's inspired by the human visual cortex and
              is excellent at tasks like image recognition and classification.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Layers className="mr-2" /> How a CNN Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              A CNN processes images through a series of layers:
            </p>
            <div className="flex justify-center items-center space-x-4 text-black">
              <div className="bg-blue-200 p-2 rounded">Input</div>
              <ArrowRight />
              <div className="bg-green-200 p-2 rounded">Convolutional</div>
              <ArrowRight />
              <div className="bg-yellow-200 p-2 rounded">Pooling</div>
              <ArrowRight />
              <div className="bg-red-200 p-2 rounded">Fully Connected</div>
              <ArrowRight />
              <div className="bg-purple-200 p-2 rounded">Output</div>
            </div>
            <p className="mt-4">
              Each layer learns to detect different features of an image, from
              simple edges to complex shapes. We will learn more about these
              while we wait for the ai model to train.
            </p>
            <p className="mt-4 text-sm text-gray-300">
              Note: The model we will be training has 3 convolutional layers, 3
              pooling layers, and 2 fully connected layers.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate("/collect-training-data")}
            className="text-lg px-6 py-3 bg-white text-purple-700 hover:bg-purple-100 transition-all duration-800 animate-slow-bounce"
          >
            Start Drawing <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
