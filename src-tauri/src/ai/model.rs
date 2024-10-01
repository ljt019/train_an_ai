use candle_core::{DType, Device, IndexOp, Tensor};
use candle_datasets::vision::mnist::load;
use candle_nn::Optimizer;
use candle_nn::{
    batch_norm, BatchNorm, BatchNormConfig, Conv2d, Linear, Module, VarBuilder, VarMap,
};
use image;
use std::path::Path;

#[derive(Clone)]
pub struct DatasetStruct {
    pub train_images: Tensor,
    pub train_labels: Tensor,
    pub test_images: Tensor,
    pub test_labels: Tensor,
}

/// Define the CNN Model
pub struct Model {
    conv_layer1: Conv2d,
    bn1: BatchNorm,
    conv_layer2: Conv2d,
    bn2: BatchNorm,
    conv_layer3: Conv2d,
    bn3: BatchNorm,
    conv_layer4: Conv2d,
    bn4: BatchNorm,
    conv_layer5: Conv2d,
    bn5: BatchNorm,
    conv_layer6: Conv2d,
    bn6: BatchNorm,
    fc_layer1: Linear,
    bn_fc1: BatchNorm,
    fc_layer2: Linear,
    varmap: VarMap,
    optimizer: candle_nn::AdamW,
    device: Device,
}

impl Model {
    /// Initialize a new Model instance with randomly initialized weights
    pub fn new(device: Device) -> candle_core::Result<Self> {
        // Create a VarMap (holds the model parameters - weights and biases)
        let varmap = VarMap::new();

        // Create a VarBuilder from the VarMap (used to create Tensors from the VarMap)
        let vb = VarBuilder::from_varmap(&varmap, DType::F32, &device);

        /*
        initial input
        1 channel (grayscale), 28x28 image
        */

        /*
        Convolutional Layer 1
        Input: 1 channel, 28x28 image
        Output: 8 channels, 24x24 image
        */
        let conv1_weight: Tensor = vb.clone().get((8, 1, 5, 5), "conv1_weight")?;
        let conv1_bias: Tensor = vb.clone().get(8, "conv1_bias")?;
        let conv_layer1: Conv2d = Conv2d::new(conv1_weight, Some(conv1_bias), Default::default());

        let bn1 = batch_norm(8, BatchNormConfig::default(), vb.clone().pp("bn1"))?;

        /*
        Pooling Layer 1 (Max Pooling)
        Input: 8 channels, 24x24 image
        Output: 8 channels, 12x12 image
        */

        /*
        Convolutional Layer 2
        Input: 8 channels, 12x12 image
        Output: 16 channels, 8x8 image
        */
        let conv2_weight: Tensor = vb.clone().get((16, 8, 5, 5), "conv2_weight")?;
        let conv2_bias: Tensor = vb.clone().get(16, "conv2_bias")?;
        let conv_layer2: Conv2d = Conv2d::new(conv2_weight, Some(conv2_bias), Default::default());

        let bn2 = batch_norm(16, BatchNormConfig::default(), vb.clone().pp("bn2"))?;

        /*
        Pooling Layer 2 (Max Pooling)
        Input: 16 channels, 8x8 image
        Output: 16 channels, 4x4 image
        */

        /*
        Convolutional Layer 3
        Input: 16 channels, 4x4 image
        Output: 32 channels, 2x2 image
        */
        let conv3_weight: Tensor = vb.clone().get((32, 16, 3, 3), "conv3_weight")?;
        let conv3_bias: Tensor = vb.clone().get(32, "conv3_bias")?;
        let conv_layer3: Conv2d = Conv2d::new(conv3_weight, Some(conv3_bias), Default::default());

        let bn3 = batch_norm(32, BatchNormConfig::default(), vb.clone().pp("bn3"))?;

        /*
        Convolutional Layer 4
        Input: 32 channels, 2x2 image
        Output: 64 channels, 1x1 image
        */
        let conv4_weight: Tensor = vb.clone().get((64, 32, 1, 1), "conv4_weight")?;
        let conv4_bias: Tensor = vb.clone().get(64, "conv4_bias")?;
        let conv_layer4: Conv2d = Conv2d::new(conv4_weight, Some(conv4_bias), Default::default());

        let bn4 = batch_norm(64, BatchNormConfig::default(), vb.clone().pp("bn4"))?;

        /*
        Convolutional Layer 5
        Input: 64 channels, 1x1 image
        Output: 128 channels, 1x1 image
        */
        let conv5_weight: Tensor = vb.clone().get((128, 64, 1, 1), "conv5_weight")?;
        let conv5_bias: Tensor = vb.clone().get(128, "conv5_bias")?;
        let conv_layer5: Conv2d = Conv2d::new(conv5_weight, Some(conv5_bias), Default::default());

        let bn5 = batch_norm(128, BatchNormConfig::default(), vb.clone().pp("bn5"))?;

        /*
        Convolutional Layer 6
        Input: 128 channels, 1x1 image
        Output: 256 channels, 1x1 image
        */
        let conv6_weight: Tensor = vb.clone().get((256, 128, 1, 1), "conv6_weight")?;
        let conv6_bias: Tensor = vb.clone().get(256, "conv6_bias")?;
        let conv_layer6: Conv2d = Conv2d::new(conv6_weight, Some(conv6_bias), Default::default());

        let bn6 = batch_norm(256, BatchNormConfig::default(), vb.clone().pp("bn6"))?;

        /*
        Fully Connected Layer 1
        Input: 256 * 2 * 2 = 1024
        Output: 64
        */
        let fc1_weight: Tensor = vb.clone().get((64, 1024), "fc1_weight")?;
        let fc1_bias: Tensor = vb.clone().get(64, "fc1_bias")?;
        let fc_layer1: Linear = Linear::new(fc1_weight, Some(fc1_bias));

        let bn_fc1 = batch_norm(64, BatchNormConfig::default(), vb.clone().pp("bn_fc1"))?;

        /*
        Fully Connected Layer 2
        Input: 64
        Output: 10
        */
        let fc2_weight: Tensor = vb.clone().get((10, 64), "fc2_weight")?;
        let fc2_bias: Tensor = vb.clone().get(10, "fc2_bias")?;
        let fc_layer2: Linear = Linear::new(fc2_weight, Some(fc2_bias));

        // Initialize optimizer, this is used to update the weights and biases during training (backpropagation)
        let adam_params = candle_nn::ParamsAdamW {
            lr: 1e-3,
            weight_decay: 1e-4,

            ..Default::default()
        };
        let optimizer = candle_nn::AdamW::new(varmap.all_vars(), adam_params)?;

        Ok(Self {
            conv_layer1,
            bn1,
            conv_layer2,
            bn2,
            conv_layer3,
            bn3,
            conv_layer4,
            bn4,
            conv_layer5,
            bn5,
            conv_layer6,
            bn6,
            fc_layer1,
            bn_fc1,
            fc_layer2,
            varmap,
            optimizer,
            device,
        })
    }

    /// Load a pre-trained model from an existing safetensors file
    pub fn load<P: AsRef<Path>>(device: Device, path: P) -> candle_core::Result<Self> {
        // Create a VarMap
        let mut varmap = VarMap::new();

        // Load the weights and biases from the safetensors file
        varmap.load(path).expect("Failed to load model parameters");

        // Create a VarBuilder from the loaded VarMap
        let vb = VarBuilder::from_varmap(&varmap, DType::F32, &device);

        // Initialize layers with loaded weights from safetensors file
        let conv1_weight = vb.clone().get((8, 1, 5, 5), "conv1_weight")?;
        let conv1_bias = vb.clone().get(8, "conv1_bias")?;
        let conv_layer1 = Conv2d::new(conv1_weight, Some(conv1_bias), Default::default());

        let bn1 = batch_norm(8, BatchNormConfig::default(), vb.clone().pp("bn1"))?;

        let conv2_weight = vb.clone().get((16, 8, 5, 5), "conv2_weight")?;
        let conv2_bias = vb.clone().get(16, "conv2_bias")?;
        let conv_layer2 = Conv2d::new(conv2_weight, Some(conv2_bias), Default::default());

        let bn2 = batch_norm(16, BatchNormConfig::default(), vb.clone().pp("bn2"))?;

        let conv3_weight = vb.clone().get((32, 16, 3, 3), "conv3_weight")?;
        let conv3_bias = vb.clone().get(32, "conv3_bias")?;
        let conv_layer3 = Conv2d::new(conv3_weight, Some(conv3_bias), Default::default());

        let bn3 = batch_norm(32, BatchNormConfig::default(), vb.clone().pp("bn3"))?;

        let conv4_weight = vb.clone().get((64, 32, 1, 1), "conv4_weight")?;
        let conv4_bias = vb.clone().get(64, "conv4_bias")?;
        let conv_layer4 = Conv2d::new(conv4_weight, Some(conv4_bias), Default::default());

        let bn4 = batch_norm(64, BatchNormConfig::default(), vb.clone().pp("bn4"))?;

        let conv5_weight = vb.clone().get((128, 64, 1, 1), "conv5_weight")?;
        let conv5_bias = vb.clone().get(128, "conv5_bias")?;
        let conv_layer5 = Conv2d::new(conv5_weight, Some(conv5_bias), Default::default());

        let bn5 = batch_norm(128, BatchNormConfig::default(), vb.clone().pp("bn5"))?;

        let conv6_weight = vb.clone().get((256, 128, 1, 1), "conv6_weight")?;
        let conv6_bias = vb.clone().get(256, "conv6_bias")?;
        let conv_layer6 = Conv2d::new(conv6_weight, Some(conv6_bias), Default::default());

        let bn6 = batch_norm(256, BatchNormConfig::default(), vb.clone().pp("bn6"))?;

        let fc1_weight = vb.clone().get((64, 1024), "fc1_weight")?;
        let fc1_bias = vb.clone().get(64, "fc1_bias")?;
        let fc_layer1 = Linear::new(fc1_weight, Some(fc1_bias));

        let bn_fc1 = batch_norm(64, BatchNormConfig::default(), vb.clone().pp("bn_fc1"))?;

        let fc2_weight = vb.clone().get((10, 64), "fc2_weight")?;
        let fc2_bias = vb.clone().get(10, "fc2_bias")?;
        let fc_layer2 = Linear::new(fc2_weight, Some(fc2_bias));

        // Initialize optimizer used for training (not needed for inference)
        let adam_params = candle_nn::ParamsAdamW::default();
        let optimizer = candle_nn::AdamW::new(varmap.all_vars(), adam_params)?;

        Ok(Self {
            conv_layer1,
            bn1,
            conv_layer2,
            bn2,
            conv_layer3,
            bn3,
            conv_layer4,
            bn4,
            conv_layer5,
            bn5,
            conv_layer6,
            bn6,
            fc_layer1,
            bn_fc1,
            fc_layer2,
            varmap,
            optimizer,
            device,
        })
    }

    /// Forward pass through the model (used for training and inference)
    pub fn forward(&self, xs: &Tensor) -> candle_core::Result<Tensor> {
        /*
        Forward pass through the model

        Conv1 -> ReLU -> MaxPool -> Conv2 -> ReLU -> MaxPool -> Conv3 -> ReLU -> Conv4 -> ReLU -> Conv5 -> ReLU -> Conv6 -> ReLU -> Flatten -> FC1 -> ReLU -> FC2
        */
        let xs = self.conv_layer1.forward(xs)?.relu()?.max_pool2d(2)?;
        let xs = self.bn1.forward_train(&xs)?;
        let xs = self.conv_layer2.forward(&xs)?.relu()?.max_pool2d(2)?;
        let xs = self.bn2.forward_train(&xs)?;
        let xs = self.conv_layer3.forward(&xs)?.relu()?;
        let xs = self.bn3.forward_train(&xs)?;
        let xs = self.conv_layer4.forward(&xs)?.relu()?;
        let xs = self.bn4.forward_train(&xs)?;
        let xs = self.conv_layer5.forward(&xs)?.relu()?;
        let xs = self.bn5.forward_train(&xs)?;
        let xs = self.conv_layer6.forward(&xs)?.relu()?;
        let xs = self.bn6.forward_train(&xs)?;
        let xs = xs.flatten_from(1)?;
        let xs = self.fc_layer1.forward(&xs)?.relu()?;
        let xs = self.bn_fc1.forward_train(&xs)?;
        let xs = self.fc_layer2.forward(&xs)?;
        Ok(xs) // Return the ouput tensor (logits: unnormalized probabilities)
    }

    /// Train the model on the provided dataset
    pub fn train(
        &mut self,
        dataset: &DatasetStruct,
        epochs: usize,
        batch_size: usize,
    ) -> candle_core::Result<()> {
        for epoch in 1..=epochs {
            println!("Epoch {}/{}", epoch, epochs);
            let num_batches = dataset.train_images.dims()[0] / batch_size; // set num batches to the number of training images divided by the batch size

            // Loop through each batch
            for batch in 0..num_batches {
                // Get the current batch of images and labels
                let start = batch * batch_size;
                let end = start + batch_size;
                let batch_images = dataset.train_images.i((start..end, ..))?;
                let batch_labels = dataset.train_labels.i(start..end)?;

                // Convert the batch images to f32 (required for the model)
                let batch_images = (batch_images.to_dtype(DType::F32)? / 255.0)?;

                let images_reshaped = batch_images.reshape((batch_size, 28, 28))?;

                // Add a channel dimension to the images
                let input = images_reshaped.unsqueeze(1)?;

                // Forward pass (remember forward returns the logits)
                let logits = self.forward(&input)?;

                // Compute loss (Cross-Entropy) between the logits and the labels
                let loss = candle_nn::loss::cross_entropy(&logits, &batch_labels)?;

                // Backward pass and optimization step, this updates the weights based on the loss
                self.optimizer.backward_step(&loss)?;

                // get the loss value as a scalar(from tensor) so it can be printed
                let loss_val = loss.to_scalar::<f32>()?;

                println!(
                    "Finished batch {}/{} - Loss: {:.4}",
                    batch, num_batches, loss_val
                );
            }

            // Evaluate on test set after each epoch (optional)
            println!("Completed Epoch {}", epoch);
        }

        Ok(())
    }

    /// Save the model's weights and biases to a safetensors file
    pub fn save<P: AsRef<Path>>(&self, path: P) -> candle_core::Result<()> {
        self.varmap.save(&path)?;
        println!("Model saved to {:?}", path.as_ref());
        Ok(())
    }

    /// Test the model on the provided dataset and print the accuracy
    pub fn test(&self, dataset: &DatasetStruct, batch_size: usize) -> candle_core::Result<()> {
        let num_samples = dataset.test_images.dims()[0];
        let num_batches = (num_samples + batch_size - 1) / batch_size; // Ceiling division

        let mut correct = 0;
        let mut total = 0;

        for batch in 0..num_batches {
            let start = batch * batch_size;
            let end = usize::min(start + batch_size, num_samples);
            let current_batch_size = end - start;

            // Get the current batch of images and labels
            let batch_images = dataset.test_images.i((start..end, ..))?;
            let batch_labels = dataset.test_labels.i(start..end)?;

            // Convert the batch images to f32 (required for the model)
            let batch_images = (batch_images.to_dtype(DType::F32)? / 255.0)?;

            let images_reshaped = batch_images.reshape((current_batch_size, 28, 28))?;

            // Add a channel dimension to the images
            let input = images_reshaped.unsqueeze(1)?;

            // Forward pass (returns logits)
            let logits = self.forward(&input)?;

            // Get the predicted labels
            let predicted_label_tensor = logits.argmax(1)?; // Use dimension 1 to get the index of the maximum value

            // Convert predicted labels to a vector of integers
            let predicted_labels: Vec<i64> = (0..predicted_label_tensor.dims()[0])
                .map(|i| {
                    predicted_label_tensor
                        .get(i)
                        .expect("didn't work")
                        .to_scalar::<u32>()
                        .expect("didn't work") as i64
                })
                .collect();

            // Convert true labels to a vector of integers
            let true_labels: Vec<i64> = (0..batch_labels.dims()[0])
                .map(|i| {
                    batch_labels
                        .get(i)
                        .expect("didnt' work")
                        .to_scalar::<u32>()
                        .expect("didn't work") as i64
                })
                .collect();

            // Compare predictions with true labels
            for (pred, true_label) in predicted_labels.iter().zip(true_labels.iter()) {
                if pred == true_label {
                    correct += 1;
                }
                total += 1;
            }
        }

        // Calculate accuracy
        let accuracy = (correct as f64) / (total as f64) * 100.0;
        println!("Test Accuracy: {:.2}%", accuracy);

        Ok(())
    }

    /// Predict the label of a single image
    pub fn predict<P: AsRef<Path>>(&self, image_path: P) -> candle_core::Result<()> {
        let image = image::open(image_path).expect("Failed to open image"); // open the image

        // Convert the image to grayscale and resize to 28x28, so it's in line with the training data
        let image = image
            .grayscale()
            .resize_exact(28, 28, image::imageops::FilterType::Nearest);

        // Convert the image to a flat array of f32 values normalized between 0.0 and 1.0 (requred to make a Tensor)
        let image_buffer = image.to_luma8();
        let image_data: Vec<f32> = image_buffer
            .pixels()
            .map(|&pixel| pixel[0] as f32 / 255.0)
            .collect();

        // Create a Tensor from the image data
        // The shape should be [batch_size, channels (1 for grayscale), height, width] => [1, 1, 28, 28]
        let image_tensor = Tensor::from_slice(&image_data, (1, 1, 28, 28), &self.device)?;

        // Perform the inference (returns a logit)
        let output = self.forward(&image_tensor)?;

        println!("Output shape: {:?}", output.dims());

        // Get the predicted label
        let predicted_label_tensor = output.argmax(1)?; // Use dimension 1 to get the index of the maximum value
        println!(
            "Predicted label tensor dtype: {:?}",
            predicted_label_tensor.dtype()
        );

        let predicted_label = predicted_label_tensor.get(0)?.to_scalar::<u32>()? as i64; // Get the scalar value of the tensor

        // Match the predicted label and output guess
        match predicted_label {
            0 => println!("The image is a 0"),
            1 => println!("The image is a 1"),
            2 => println!("The image is a 2"),
            3 => println!("The image is a 3"),
            4 => println!("The image is a 4"),
            5 => println!("The image is a 5"),
            6 => println!("The image is a 6"),
            7 => println!("The image is a 7"),
            8 => println!("The image is a 8"),
            9 => println!("The image is a 9"),
            _ => println!("The image is not recognized"),
        }

        Ok(())
    }
}

// Implement the Module trait for the Model struct
impl Module for Model {
    fn forward(&self, xs: &Tensor) -> candle_core::Result<Tensor> {
        self.forward(xs)
    }
}

/// Load the entire MNIST dataset
pub fn load_dataset() -> DatasetStruct {
    let mnist = load().expect("Failed to load MNIST dataset");

    DatasetStruct {
        train_images: mnist.train_images,
        train_labels: mnist.train_labels,
        test_images: mnist.test_images,
        test_labels: mnist.test_labels,
    }
}
