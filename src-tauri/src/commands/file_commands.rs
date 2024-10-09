use std::fs;
use tauri::api::path::{data_dir, resource_dir};
use tauri::{command, AppHandle, Manager};

/// Corrected reset_temp_assets_directory function
#[command]
pub fn reset_temp_assets_directory(app_handle: AppHandle) -> Result<(), String> {
    println!("Resetting temp-assets directory...");

    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the assets and temp-assets directories
    let resource_directory = resource_dir(&app_handle.package_info(), &app_handle.env())
        .ok_or_else(|| "Resource directory not found".to_string())?;
    let assets_dir = resource_directory.join("assets");
    let temp_asset_dir = data_directory.join("temp-assets");

    // Check if assets_dir exists
    if !assets_dir.exists() {
        return Err(format!(
            "Assets directory does not exist at {:?}",
            assets_dir
        ));
    }

    // Remove the temp-assets directory if it exists
    if fs::remove_dir_all(&temp_asset_dir).is_err() {
        println!("Failed to remove temp-assets directory or it does not exist.");
    } else {
        println!("Removed temp-assets directory.");
    }

    // Create the temp-assets directory
    fs::create_dir_all(&temp_asset_dir)
        .map_err(|e| format!("Failed to create temp-assets directory: {}", e))?;
    println!("Created temp-assets directory.");

    // Define the source and destination paths for model.safetensors
    let model_source = assets_dir.join("model.safetensors");
    let model_destination = temp_asset_dir.join("model.safetensors");

    // Check if model_source exists
    if !model_source.exists() {
        return Err(format!("Model file does not exist at {:?}", model_source));
    }

    // Copy the model.safetensors file from assets to temp-assets
    fs::copy(&model_source, &model_destination).map_err(|e| {
        format!(
            "Failed to copy from {:?} to {:?}: {}",
            model_source, model_destination, e
        )
    })?;
    println!("Copied from {:?} to {:?}", model_source, model_destination);

    Ok(())
}
