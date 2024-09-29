#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use image::{GenericImageView, GrayImage, ImageBuffer, Luma};
use imageproc::filter;
use std::fs;
use std::path::Path;
use tauri::command;

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
fn apply_conv_filter(image_path: String) -> Result<String, String> {
    // Load the image
    let img = image::open(&image_path).map_err(|e| e.to_string())?;

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
    fs::create_dir_all("conv_layers").map_err(|e| e.to_string())?;

    // Generate the filename
    let filename = Path::new(&image_path)
        .file_stem()
        .ok_or_else(|| "Invalid image path".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid filename".to_string())?
        .to_string();
    let conv_filename = format!("conv_layers/{}_conv.png", filename);

    // Save the processed image
    conv_img.save(&conv_filename).map_err(|e| e.to_string())?;

    // Get the absolute path of the processed image
    let conv_filepath = std::fs::canonicalize(&conv_filename).map_err(|e| e.to_string())?;

    println!("Applied convolution filter: {}", conv_filepath.display());
    Ok(conv_filepath
        .to_str()
        .ok_or("Failed to convert path to string")?
        .to_string())
}

#[command]
fn apply_pooling_filter(image_path: String) -> Result<String, String> {
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
    fs::create_dir_all("pool_layers").map_err(|e| e.to_string())?;

    // Generate the filename
    let filename = Path::new(&image_path)
        .file_stem()
        .ok_or_else(|| "Invalid image path".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid filename".to_string())?
        .to_string();
    let pool_filename = format!("pool_layers/{}_pool.png", filename);

    // Save the processed image
    pooled_img.save(&pool_filename).map_err(|e| e.to_string())?;

    // Get the absolute path of the processed image
    let pool_filepath = std::fs::canonicalize(&pool_filename).map_err(|e| e.to_string())?;

    println!("Applied pooling filter: {}", pool_filepath.display());
    Ok(pool_filepath
        .to_str()
        .ok_or("Failed to convert path to string")?
        .to_string())
}

#[command]
fn apply_fully_connected_filter(image_path: String) -> Result<String, String> {
    // For visualization purposes, we'll simulate the fully connected layer
    // by applying a brightness adjustment.

    // Load the image
    let img = image::open(&image_path).map_err(|e| e.to_string())?;

    // Apply brightness increase
    let bright_img = img.brighten(50); // Increase brightness by 50

    // Create the directory if it doesn't exist
    fs::create_dir_all("fc_layers").map_err(|e| e.to_string())?;

    // Generate the filename
    let filename = Path::new(&image_path)
        .file_stem()
        .ok_or_else(|| "Invalid image path".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid filename".to_string())?
        .to_string();
    let fc_filename = format!("fc_layers/{}_fc.png", filename);

    // Save the processed image
    bright_img.save(&fc_filename).map_err(|e| e.to_string())?;

    // Get the absolute path of the processed image
    let fc_filepath = std::fs::canonicalize(&fc_filename).map_err(|e| e.to_string())?;

    println!("Applied fully connected filter: {}", fc_filepath.display());
    Ok(fc_filepath
        .to_str()
        .ok_or("Failed to convert path to string")?
        .to_string())
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
