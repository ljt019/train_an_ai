use base64;
use image::ImageFormat;
use image::{GrayImage, ImageBuffer, Luma};
use imageproc::filter;
use std::fs;
use tauri::api::path::data_dir;
use tauri::command;

#[command]
pub fn apply_conv_filter() -> Result<String, String> {
    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the input image path within data directory
    let image_path = data_directory.join("drawings").join("3.png");

    // Resolve the absolute path
    let absolute_image_path = fs::canonicalize(&image_path)
        .map_err(|e| format!("Failed to resolve absolute path: {}", e))?;
    println!("Absolute image path: {}", absolute_image_path.display());

    // Check if the file exists
    if !absolute_image_path.exists() {
        return Err(format!(
            "Image file does not exist: {}",
            absolute_image_path.display()
        ));
    }

    // Load the image
    let img =
        image::open(&absolute_image_path).map_err(|e| format!("Failed to open image: {}", e))?;

    // Convert to grayscale
    let gray_img: GrayImage = img.to_luma8();

    // Define a convolution kernel (e.g., edge detection)
    let kernel: [f32; 9] = [-1.0, -1.0, -1.0, -1.0, 8.0, -1.0, -1.0, -1.0, -1.0];

    // Apply convolution using imageproc's convolution function
    let conv_img: ImageBuffer<Luma<f32>, Vec<f32>> = filter::filter3x3(&gray_img, &kernel);

    // Convert back to u8
    let conv_img: GrayImage = ImageBuffer::from_fn(conv_img.width(), conv_img.height(), |x, y| {
        Luma([conv_img.get_pixel(x, y).0[0].clamp(0.0, 255.0) as u8])
    });

    // Encode the processed image to PNG format in memory using Cursor
    let mut buffer = std::io::Cursor::new(Vec::new());
    conv_img
        .write_to(&mut buffer, ImageFormat::Png)
        .map_err(|e| format!("Failed to write image to buffer: {}", e))?;

    // Encode the buffer to Base64
    let base64_image = base64::encode(&buffer.into_inner());

    // Return the Base64 string
    Ok(base64_image)
}

#[command]
pub fn apply_pooling_filter() -> Result<String, String> {
    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the input image path within processed_drawings
    let image_path = data_directory.join("processed_drawings").join("3_conv.png");

    // Check if the file exists
    if !image_path.exists() {
        return Err(format!(
            "Image file does not exist: {}",
            image_path.display()
        ));
    }

    // Load the image
    let img = image::open(&image_path).map_err(|e| format!("Failed to open image: {}", e))?;

    // Convert to grayscale
    let gray_img = img.to_luma8();

    // Define pooling parameters
    let pool_size = 2;
    let stride = 2;

    // Apply max pooling
    let pooled_img = max_pooling(&gray_img, pool_size, stride)?;

    // Encode the processed image to PNG format in memory
    let mut buffer = std::io::Cursor::new(Vec::new());
    pooled_img
        .write_to(&mut buffer, ImageFormat::Png)
        .map_err(|e| format!("Failed to write image to buffer: {}", e))?;

    // Encode the buffer to Base64
    let base64_image = base64::encode(&buffer.into_inner());

    // Return the Base64 string
    Ok(base64_image)
}

#[command]
pub fn apply_fully_connected_filter() -> Result<String, String> {
    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the input image path within processed_drawings
    let image_path = data_directory.join("processed_drawings").join("3_pool.png");

    // Check if the file exists
    if !image_path.exists() {
        return Err(format!(
            "Image file does not exist: {}",
            image_path.display()
        ));
    }

    // Load the image
    let img = image::open(&image_path).map_err(|e| format!("Failed to open image: {}", e))?;

    // Apply brightness increase
    let bright_img = img.brighten(25); // Increase brightness by 25

    // Encode the processed image to PNG format in memory
    let mut buffer = std::io::Cursor::new(Vec::new());
    bright_img
        .write_to(&mut buffer, ImageFormat::Png)
        .map_err(|e| format!("Failed to write image to buffer: {}", e))?;

    // Encode the buffer to Base64
    let base64_image = base64::encode(&buffer.into_inner());

    // Return the Base64 string
    Ok(base64_image)
}

/// Simple max pooling implementation
fn max_pooling(img: &GrayImage, pool_size: usize, stride: usize) -> Result<GrayImage, String> {
    let (width, height) = img.dimensions();
    let pooled_width = ((width - pool_size as u32) / stride as u32) + 1;
    let pooled_height = ((height - pool_size as u32) / stride as u32) + 1;

    let mut pooled_img = ImageBuffer::new(pooled_width, pooled_height);

    for y in 0..pooled_height {
        for x in 0..pooled_width {
            let mut max_val = 0u8;
            for dy in 0..pool_size {
                for dx in 0..pool_size {
                    let px = x as usize * stride + dx;
                    let py = y as usize * stride + dy;
                    if px < width as usize && py < height as usize {
                        let p = img.get_pixel(px as u32, py as u32).0[0];
                        if p > max_val {
                            max_val = p;
                        }
                    }
                }
            }
            pooled_img.put_pixel(x as u32, y as u32, Luma([max_val]));
        }
    }

    Ok(pooled_img)
}
