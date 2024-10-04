use candle_core::Tensor;

pub fn image_path_to_formatted_tensor(
    path: &str,
    device: &candle_core::Device,
) -> candle_core::Result<Tensor> {
    let image = image::open(path).expect("Failed to open image");
    let image = image.resize_exact(28, 28, image::imageops::FilterType::Nearest);
    let image = image.to_luma8().into_raw();
    let image = image
        .into_iter()
        .map(|p: u8| p as f32 / 255.0)
        .collect::<Vec<f32>>();
    let image = Tensor::from_vec(image, &[784], device)?;

    Ok(image)
}

pub fn image_to_formatted_tensor(image: image::DynamicImage) -> candle_core::Result<Tensor> {
    // Get the device
    let dev = candle_core::Device::cuda_if_available(0).unwrap_or(candle_core::Device::Cpu);

    // format the image
    let image = format_image(image);

    // Turn the image into a tensor
    let image = Tensor::from_vec(image, &[784], &dev).expect("Failed to create tensor");

    // Return the image tensor
    Ok(image)
}

pub fn format_image(image: image::DynamicImage) -> Vec<f32> {
    let image = image.resize_exact(28, 28, image::imageops::FilterType::Nearest);
    let image = image.to_luma8().into_raw();
    let image = image
        .into_iter()
        .map(|p: u8| p as f32 / 255.0)
        .collect::<Vec<f32>>();
    image
}

/// Creates a `Dataset` with training images from `drawings` and test images from MNIST.
pub fn create_dataset() -> candle_core::Result<candle_datasets::vision::Dataset> {
    // Get the device
    let dev = candle_core::Device::cuda_if_available(0).unwrap_or(candle_core::Device::Cpu);

    let drawings_dir = "drawings";

    // Read all image files from the drawings directory
    let entries = std::fs::read_dir(drawings_dir)
        .map_err(|e| {
            format!(
                "Failed to read drawings directory '{}': {}",
                drawings_dir, e
            )
        })
        .expect("Failed to read drawings directory");

    let mut train_images = Vec::new();
    let mut train_labels = Vec::new();

    for entry in entries {
        let entry = entry
            .map_err(|e| format!("Failed to read directory entry: {}", e))
            .expect("Failed to read directory entry");
        let path = entry.path();

        if path.is_file() {
            if let Some(ext) = path.extension() {
                let ext_lower = ext.to_str().map(|s| s.to_lowercase()).unwrap_or_default();
                if ext_lower == "png" || ext_lower == "jpg" || ext_lower == "jpeg" {
                    // Extract label from filename, assuming filename is like "3.png"
                    if let Some(stem) = path.file_stem() {
                        if let Some(stem_str) = stem.to_str() {
                            // Attempt to parse the label as a u32
                            if let Ok(label) = stem_str.parse::<u32>() {
                                // Load and process the image
                                let image = image::open(&path)
                                    .map_err(|e| {
                                        format!("Failed to open image '{:?}': {}", path, e)
                                    })
                                    .expect("Failed to open image");

                                let tensor = image_to_formatted_tensor(image)?;

                                train_images.push(tensor);
                                train_labels.push(label as f32); // Assuming labels are u32, convert to f32
                            } else {
                                panic!("Invalid label in filename: {:?}", path);
                            }
                        }
                    }
                }
            }
        }
    }

    if train_images.is_empty() {
        panic!("No images found in drawings directory: {:?}", drawings_dir);
    }

    // Load MNIST dataset for testing
    let mnist_dataset = get_mnist_dataset()?;

    // Assuming mnist_dataset has train and test sets; we'll use test set for our testing
    let test_images = mnist_dataset.test_images;
    let test_labels = mnist_dataset.test_labels;

    // Determine the number of unique labels
    let unique_labels = 10; // Since it's digits 0-9

    let train_labels_length = train_labels.len();

    // Concatenate all training images into a single tensor
    let concatenated_train_images = concatenate_tensors(&train_images, 0)?; // Shape: [num_train_samples,784]

    // Convert training labels into a single tensor
    let train_labels_tensor =
        candle_core::Tensor::from_vec(train_labels, &[train_labels_length], &dev)?; // Shape: [num_train_samples]

    // **Add Logging Here**
    println!(
        "Concatenated train_images shape: {:?}",
        concatenated_train_images.shape().dims()
    );
    println!(
        "train_labels_tensor shape: {:?}",
        train_labels_tensor.shape().dims()
    );

    Ok(candle_datasets::vision::Dataset {
        train_images: concatenated_train_images, // Shape: [num_train_samples,784]
        train_labels: train_labels_tensor,       // Shape: [num_train_samples]
        test_images,
        test_labels,
        labels: unique_labels,
    })
}

// Concatenates a list of tensors along the specified dimension.
fn concatenate_tensors(tensors: &[Tensor], dim: usize) -> candle_core::Result<Tensor> {
    // Get the device
    let dev = candle_core::Device::cuda_if_available(0).unwrap_or(candle_core::Device::Cpu);

    if tensors.is_empty() {
        panic!("No Tensors");
    }

    let first_shape = tensors[0].shape();

    // Ensure all tensors have the same shape except for the concatenation dimension
    for tensor in tensors.iter().skip(1) {
        for (i, dim_size) in tensor.shape().dims().iter().enumerate() {
            if i != dim && dim_size != &first_shape.dims()[i] {
                panic!("No Tensors");
            }
        }
    }

    // Compute the new shape
    let mut new_shape = first_shape.dims().to_vec();
    new_shape[dim] = tensors.iter().map(|t| t.shape().dims()[dim]).sum();

    // Initialize a new tensor to hold the concatenated data
    let mut concatenated_data = Vec::with_capacity(new_shape.iter().product());

    for tensor in tensors {
        concatenated_data.extend(tensor.to_vec1::<f32>()?);
    }

    candle_core::Tensor::from_vec(concatenated_data, new_shape, &dev)
}

pub fn get_mnist_dataset() -> candle_core::Result<candle_datasets::vision::Dataset> {
    let dataset = candle_datasets::vision::mnist::load();

    return dataset;
}
