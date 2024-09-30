#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use image::{GenericImageView, GrayImage, ImageBuffer, Luma};
use imageproc::filter;
use std::fs;
use std::path::Path;
use tauri::command;

mod ai;

// Define Tauri commands

#[command]
fn train() {
    println!("Training the model...");
}

#[command]
fn save_drawing(image_data: String, symbol: String) -> Result<(), String> {
    // Remove the "data:image/png;base64," prefix
    let base64_data = image_data
        .split(',')
        .nth(1)
        .ok_or_else(|| "Invalid image data format".to_string())?;

    // Decode the base64 string
    let image_bytes = base64::decode(base64_data).map_err(|e| e.to_string())?;

    // Create the directory if it doesn't exist
    fs::create_dir_all("drawings").map_err(|e| e.to_string())?;

    // Generate the filename
    let filename = format!("drawings/{}.png", symbol);

    // Write the image to the file (this will overwrite if it already exists)
    fs::write(&filename, image_bytes).map_err(|e| e.to_string())?;

    println!("Saved drawing: {}", filename);
    Ok(())
}

#[command]
fn apply_conv_filter() -> Result<String, String> {
    // Log the image path
    //println!("Received image path: {}", image_path);

    let image_path = "drawings/3.png".to_string();

    // Resolve the absolute path
    let absolute_image_path = std::fs::canonicalize(&image_path)
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
    let gray_img: ImageBuffer<Luma<u8>, Vec<u8>> = img.to_luma8();

    let gray_img_f32: ImageBuffer<Luma<f32>, Vec<f32>> =
        ImageBuffer::from_fn(gray_img.width(), gray_img.height(), |x, y| {
            Luma([gray_img.get_pixel(x, y).0[0] as f32])
        });

    // Define a convolution kernel (e.g., edge detection)
    let kernel: [f32; 9] = [-1.0, -1.0, -1.0, -1.0, 8.0, -1.0, -1.0, -1.0, -1.0];

    // Apply convolution using imageproc's convolution function
    let conv_img: ImageBuffer<Luma<f32>, Vec<f32>> = filter::filter3x3(&gray_img_f32, &kernel);

    // Convert back to u8
    let conv_img: ImageBuffer<Luma<u8>, Vec<u8>> =
        ImageBuffer::from_fn(conv_img.width(), conv_img.height(), |x, y| {
            Luma([conv_img.get_pixel(x, y).0[0].clamp(0.0, 255.0) as u8])
        });

    // Create the directory if it doesn't exist
    let conv_dir = "processed_drawings";
    fs::create_dir_all(conv_dir)
        .map_err(|e| format!("Failed to create directory {}: {}", conv_dir, e))?;

    // Generate the filename
    let filename = Path::new(&image_path)
        .file_stem()
        .ok_or_else(|| "Invalid image path".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid filename".to_string())?
        .to_string();
    let conv_filename = format!("{}/{}_conv.png", conv_dir, filename);

    // Save the processed image
    conv_img
        .save(&conv_filename)
        .map_err(|e| format!("Failed to save image: {}", e))?;

    // Get the absolute path of the processed image
    let conv_filepath =
        "C:/Users/lthom/Projects/Exhibits/number_proto/src-tauri/processed_drawings/3_conv.png"
            .to_string();

    println!("Applied convolution filter: {}", conv_filepath);

    Ok(conv_filepath)
}

#[command]
fn apply_pooling_filter() -> Result<String, String> {
    let image_path = "processed_drawings/3_conv.png".to_string();

    // Load the image
    let img = image::open(&image_path).map_err(|e| e.to_string())?;

    // Convert to grayscale
    let gray_img = img.to_luma8();

    // Define pooling parameters
    let pool_size = 2;
    let stride = 2;

    // Apply max pooling
    let pooled_img = max_pooling(&gray_img, pool_size, stride)?;

    // Create the directory if it doesn't exist
    fs::create_dir_all("processed_drawings").map_err(|e| e.to_string())?;

    // create filename
    let pool_filename = "processed_drawings/3_pool.png".to_string();

    // Save the processed image
    pooled_img.save(&pool_filename).map_err(|e| e.to_string())?;

    // Get the absolute path of the processed image
    let pool_filepath =
        "C:/Users/lthom/Projects/Exhibits/number_proto/src-tauri/processed_drawings/3_pool.png"
            .to_string();

    println!("Applied pooling filter: {}", pool_filepath);
    Ok(pool_filepath)
}

#[command]
fn apply_fully_connected_filter() -> Result<String, String> {
    // For visualization purposes, we'll simulate the fully connected layer
    // by applying a brightness adjustment.

    let image_path = "processed_drawings/3_pool.png".to_string();

    // Load the image
    let img = image::open(&image_path).map_err(|e| e.to_string())?;

    // Apply brightness increase
    let bright_img = img.brighten(25); // Increase brightness by 50

    // Create the directory if it doesn't exist
    fs::create_dir_all("processed_drawings").map_err(|e| e.to_string())?;

    let fc_filename = "processed_drawings/3_fc.png";

    // Save the processed image
    bright_img.save(&fc_filename).map_err(|e| e.to_string())?;

    // Get the absolute path of the processed image
    let fc_filepath =
        "C:/Users/lthom/Projects/Exhibits/number_proto/src-tauri/processed_drawings/3_fc.png"
            .to_string();

    println!("Applied fully connected filter: {}", fc_filepath);
    Ok(fc_filepath)
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_drawing,
            train,
            apply_conv_filter,
            apply_pooling_filter,
            apply_fully_connected_filter
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
