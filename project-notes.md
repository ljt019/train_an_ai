## Layers of a CNN

### Input

Individual pixels of the image

Images on a computer are stored as a matrix of pixel values, (a channel) a certain component of an image.
A typical digital camera image will have 3 channels red, green, and blue. Which can be imagined as 3 2d matrices stacked on top of one another.

In this case only trying to classify numbers, only one channel is needed luminence. This can be done with only 8 bits, representing each pixel with a value between 0-255.

### Convolutional

The dot product of two functions, that produce a third function.

Implemented as a Kernel, a mini-matrix, it moves across the image taking the dot product between the mini-matrix and the matrix that represents the full image. This new image created with the dot products in the last-step is called the _Feature Map_.

_Feature Maps_ are good at figuring out patterns in an image, think corners, edges, basic shapes like circles.

Since you are taking a group of pixels (the kernal) and doing math to create one pixel, the image gets much smaller in the process.

###### _Note: This same concept is used to apply things like blur to images_

In the context of a CNN for recognizing numbers, the convelutional layer could have 6 kernals each producing a slightly different _Feature Map_ to get a variety of information for image recognition.

###### _Note: A non-linearity function should also be applied, a ReLU for instance. Non-linearity is important for neural networks to be adaptable to real-world data_

###### _Note: This is a good example of why using only 1 channel is ideal, if you had 3 channels (RGB) you would need 6 Feature Maps for each channel!_

The second convolutional layer in the CNN outputs 16 _Feature Maps_, and leverages the _Feature Maps_ from the previous Pooling layer, and Convolutional layer to identify more complex shapes in the input image.

###### _Note: For example it can combine vertical and horizontal edge *Feature Maps*._

### Pool

Pooling layers are used to downsample our _Feature Maps_ keeping the most important parts, and discarding the rest. This is important to reduce overfitting in the final model.

The specific type of pooling used in a CNN to recognize numbers is Max Pooling. This is done with yet another kernel. This kernal slides over the image's matrix and takes the largest pixel discarding the rest (0-255).

Since you have 6 _Feature Maps_ from the first convelutional layer you need 6 more _Feature Maps_ (once for each input _feature map_) for the pooling layer.

###### _Note: There is also the added benefit of faster training times at later stages, as the process drastically reduces the size of the image_

After the second convolutional layer there is a second pooling layer to yet again reduce overfitting and reduce the size of the image for the two upcoming Fully Connected layers.

Think about an input image that is 32x32, that would be 1024 pixels. After the first convelutional layers you would get 4704 pixels, then after pooling you would get 1176 pixels. After the final pooling layer you would end up with a 400 pixel image.

That's what the first 4 layers are about, taking an input image that is quite large and squeezing that information, only taking the important parts and features into as small an image as possible.

### Fully Connected

The two fully connected layers act as the classifier in this neural network.

In an image classifier, the first fully connected layer is comprised of 120 neurons, and the second has 100 neurons. These layers take the high-level features extracted by the convolutional and pooling layers and use them to classify the input image into one of the predefined categories.

Each neuron in the fully connected layers is connected to every neuron in the previous layer. This setup allows the network to learn complex patterns and relationships in the input data. The output of these layers is typically passed through a non-linear activation function, such as ReLU, which helps the network to learn more complex patterns by introducing non-linearity.

The final fully connected layer outputs a vector of probabilities, one for each class. This is achieved by applying a softmax function, which converts the raw scores into probabilities that sum to 1. The one with the highest probability is chosen as the predicted class for the input image.

### Output

The output layer of the CNN provides the final classification result. For a digit recognition task, this layer would have 10 neurons, one for each digit from 0 to 9. The neuron with the highest activation represents the predicted digit. (if you were to include math symbols you would need 15 neurons).

## Full Structure of the Neural Network

1. **Input Layer**

   - The initial layer that takes in the raw input data (e.g., an image).

2. **Convolutional Layer**

   - Applies convolution operations to extract features from the input data.

3. **Pooling Layer**

   - Reduces the dimensionality of the feature maps while retaining important information.

4. **Convolutional Layer**

   - Further extracts features from the pooled feature maps.

5. **Pooling Layer**

   - Again reduces the dimensionality of the feature maps.

6. **Fully Connected Layer**

   - Each neuron is connected to every neuron in the previous layer, allowing the network to learn complex patterns.

7. **Fully Connected Layer**

   - Another layer of fully connected neurons to further refine the learned patterns.

8. **Output Layer**
   - Produces the final classification result, typically using a softmax function to output probabilities for each class.
