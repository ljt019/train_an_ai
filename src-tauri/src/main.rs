#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use std::fs;

mod ai;
mod dataset;

// Train an ML model with the drawings (CNN using candle)
#[tauri::command]
fn train() {
    println!("Training the model...");
}

#[tauri::command]
fn save_drawing(image_data: String, symbol: String) -> Result<(), String> {
    // Remove the "data:image/png;base64," prefix
    let base64_data = image_data.split(",").nth(1).unwrap();

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_drawing, train])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
