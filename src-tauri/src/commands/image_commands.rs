use base64;
use image::ImageFormat;
use std::fs;
use tauri::api::path::data_dir;
use tauri::command;

#[command]
pub fn get_input_image() -> Result<String, String> {
    // Step 1: Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Step 2: Define the path to the 'drawings' directory and '3.png' image
    let image_path = data_directory.join("drawings").join("3.png");

    // Step 3: Check if the image file exists
    if !image_path.exists() {
        return Err(format!(
            "Input image file does not exist: {}",
            image_path.display()
        ));
    }

    // Step 4: Load the image
    let img: image::DynamicImage =
        image::open(&image_path).map_err(|e| format!("Failed to open input image: {}", e))?;

    // Encode the processed image to PNG format in memory
    let mut buffer = std::io::Cursor::new(Vec::new());
    img.write_to(&mut buffer, ImageFormat::Png)
        .map_err(|e| format!("Failed to write image to buffer: {}", e))?;

    // Encode the buffer to Base64
    let base64_image = base64::encode(&buffer.into_inner());

    // Step 6: Return the Base64 string
    Ok(base64_image)
}

#[command]
pub fn save_drawing(image_data: String, symbol: String) -> Result<(), String> {
    // Remove the "data:image/png;base64," prefix
    let base64_data = image_data
        .split(',')
        .nth(1)
        .ok_or_else(|| "Invalid image data format".to_string())?;

    // Decode the base64 string
    let image_bytes = base64::decode(base64_data).map_err(|e| e.to_string())?;

    // Load the image from bytes
    let img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to load image from memory: {}", e))?;

    // Resize the image to 28x28 using `resize_exact` with nearest-neighbor filter
    let resized_img = img.resize_exact(28, 28, image::imageops::FilterType::Nearest);

    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the drawings directory within data directory
    let drawings_dir = data_directory.join("drawings");

    // Create the drawings directory if it doesn't exist
    fs::create_dir_all(&drawings_dir).map_err(|e| e.to_string())?;

    // Generate the filename
    let filename = drawings_dir.join(format!("{}.png", symbol));

    // Save the resized image to the file
    resized_img
        .save_with_format(&filename, ImageFormat::Png)
        .map_err(|e| format!("Failed to save resized image: {}", e))?;

    println!("Saved resized drawing: {:?}", filename);
    Ok(())
}
