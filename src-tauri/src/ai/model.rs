use candle_core::{DType, Device, IndexOp, Tensor};
use candle_datasets::vision::mnist::load;
use candle_nn::Optimizer;
use candle_nn::{Conv2d, Linear, Module, VarBuilder, VarMap};
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
struct Model {
    conv_layer1: Conv2d,
    conv_layer2: Conv2d,
    fc_layer1: Linear,
    fc_layer2: Linear,
    varmap: VarMap,
    optimizer: candle_nn::SGD,
    device: Device,
}

impl Model {
    /// Initialize a new Model instance with randomly initialized weights
    pub fn new(device: Device) -> candle_core::Result<Self> {
        // Create a VarMap
        let varmap = VarMap::new();

        // Create a VarBuilder from the VarMap
        let vb = VarBuilder::from_varmap(&varmap, DType::F32, &device);

        // Initialize layers
        let conv1_weight = vb.clone().get((8, 1, 5, 5), "conv1_weight")?;
        let conv1_bias = vb.clone().get(8, "conv1_bias")?;
        let conv_layer1 = Conv2d::new(conv1_weight, Some(conv1_bias), Default::default());

        let conv2_weight = vb.clone().get((16, 8, 5, 5), "conv2_weight")?;
        let conv2_bias = vb.clone().get(16, "conv2_bias")?;
        let conv_layer2 = Conv2d::new(conv2_weight, Some(conv2_bias), Default::default());

        let fc1_weight = vb.clone().get((64, 256), "fc1_weight")?;
        let fc1_bias = vb.clone().get(64, "fc1_bias")?;
        let fc_layer1 = Linear::new(fc1_weight, Some(fc1_bias));

        let fc2_weight = vb.clone().get((10, 64), "fc2_weight")?;
        let fc2_bias = vb.clone().get(10, "fc2_bias")?;
        let fc_layer2 = Linear::new(fc2_weight, Some(fc2_bias));

        // Initialize optimizer
        let optimizer = candle_nn::SGD::new(varmap.all_vars(), 0.01)?;

        Ok(Self {
            conv_layer1,
            conv_layer2,
            fc_layer1,
            fc_layer2,
            varmap,
            optimizer,
            device,
        })
    }

    /// Load a pre-trained model from a safetensors file
    pub fn load<P: AsRef<Path>>(device: Device, path: P) -> candle_core::Result<Self> {
        // Create a VarMap
        let mut varmap = VarMap::new();

        // Load the model parameters from the safetensors file
        varmap.load(path).expect("Failed to load model parameters");

        // Create a VarBuilder from the loaded VarMap
        let vb = VarBuilder::from_varmap(&varmap, DType::F32, &device);

        // Initialize layers with loaded weights
        let conv1_weight = vb.clone().get((8, 1, 5, 5), "conv1_weight")?;
        let conv1_bias = vb.clone().get(8, "conv1_bias")?;
        let conv_layer1 = Conv2d::new(conv1_weight, Some(conv1_bias), Default::default());

        let conv2_weight = vb.clone().get((16, 8, 5, 5), "conv2_weight")?;
        let conv2_bias = vb.clone().get(16, "conv2_bias")?;
        let conv_layer2 = Conv2d::new(conv2_weight, Some(conv2_bias), Default::default());

        let fc1_weight = vb.clone().get((64, 256), "fc1_weight")?;
        let fc1_bias = vb.clone().get(64, "fc1_bias")?;
        let fc_layer1 = Linear::new(fc1_weight, Some(fc1_bias));

        let fc2_weight = vb.clone().get((10, 64), "fc2_weight")?;
        let fc2_bias = vb.clone().get(10, "fc2_bias")?;
        let fc_layer2 = Linear::new(fc2_weight, Some(fc2_bias));

        // Initialize optimizer
        let optimizer = candle_nn::SGD::new(varmap.all_vars(), 0.01)?;

        Ok(Self {
            conv_layer1,
            conv_layer2,
            fc_layer1,
            fc_layer2,
            varmap,
            optimizer,
            device,
        })
    }

    /// Forward pass through the model
    pub fn forward(&self, xs: &Tensor) -> candle_core::Result<Tensor> {
        let xs = self.conv_layer1.forward(xs)?.relu()?.max_pool2d(2)?;
        let xs = self.conv_layer2.forward(&xs)?.relu()?.max_pool2d(2)?;
        let xs = xs.flatten_from(1)?; // Flatten starting from dimension 1
        let xs = self.fc_layer1.forward(&xs)?.relu()?;
        let xs = self.fc_layer2.forward(&xs)?;
        Ok(xs)
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
            let num_batches = dataset.train_images.dims()[0] / batch_size;

            for batch in 0..num_batches {
                // Extract batch
                let start = batch * batch_size;
                let end = start + batch_size;
                let batch_images = dataset.train_images.i((start..end, ..))?;
                let batch_labels = dataset.train_labels.i(start..end)?;

                let batch_images = batch_images.to_dtype(DType::F32)?;

                // Reshape and prepare input
                let images_reshaped = batch_images.reshape((batch_size, 28, 28))?;

                let input = images_reshaped.unsqueeze(1)?;

                // Forward pass
                let logits = self.forward(&input)?;

                // Compute loss (Cross-Entropy)
                let loss = candle_nn::loss::cross_entropy(&logits, &batch_labels)?;

                // Backward pass and optimization step
                self.optimizer.backward_step(&loss)?;

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

    /// Save the model parameters to a safetensors file
    pub fn save<P: AsRef<Path>>(&self, path: P) -> candle_core::Result<()> {
        self.varmap.save(&path)?;
        println!("Model saved to {:?}", path.as_ref());
        Ok(())
    }

    /// Predict the label of a single image
    pub fn predict<P: AsRef<Path>>(&self, image_path: P) -> candle_core::Result<()> {
        // Get image to test with
        let image = image::open(image_path).expect("Failed to open image");

        // Convert the image to grayscale and resize to 28x28
        let image = image
            .grayscale()
            .resize_exact(28, 28, image::imageops::FilterType::Nearest);

        // Convert the image to a flat array of f32 values normalized between 0.0 and 1.0
        let image_buffer = image.to_luma8();
        let image_data: Vec<f32> = image_buffer
            .pixels()
            .map(|&pixel| pixel[0] as f32 / 255.0)
            .collect();

        // Create a Tensor from the image data
        // The shape should be [batch_size, channels, height, width] => [1, 1, 28, 28]
        let image_tensor = Tensor::from_slice(&image_data, (1, 1, 28, 28), &self.device)?;

        // Perform inference
        let output = self.forward(&image_tensor)?;

        println!("Output shape: {:?}", output.dims());

        // Get the predicted label
        let predicted_label_tensor = output.argmax(1)?; // Use dimension 1
        println!(
            "Predicted label tensor dtype: {:?}",
            predicted_label_tensor.dtype()
        );
        let predicted_label = predicted_label_tensor.get(0)?.to_scalar::<u32>()? as i64;

        println!("Predicted Label: {}", predicted_label);

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
