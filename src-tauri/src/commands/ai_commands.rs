use crate::ai;
use crate::ai::model::{ConvNet, TrainingArgs};
use base64;
use candle_core;
use candle_core::Device;
use std::fs;
use std::path::PathBuf;
use tauri::api::path::data_dir;
use tauri::{command, AppHandle, InvokeError, Manager};

#[command]
pub fn train(app_handle: AppHandle) -> Result<(), String> {
    let app_handle_clone = app_handle.clone();
    tauri::async_runtime::spawn_blocking(move || {
        // Create the varmap
        let mut vm = candle_nn::VarMap::new();

        // Load the model from the temp-assets directory
        let model_path = match get_model_path() {
            Ok(path) => path,
            Err(e) => {
                eprintln!("Error getting model path: {}", e);
                app_handle_clone
                    .emit_all("training_error", e.to_string())
                    .unwrap_or_else(|err| {
                        eprintln!("Failed to emit training_error event: {}", err)
                    });
                return;
            }
        };

        let model = match ConvNet::new_from_file(&mut vm, &PathBuf::from(model_path.clone())) {
            Ok(m) => m,
            Err(e) => {
                eprintln!("Failed to load model: {}", e);
                app_handle_clone
                    .emit_all("training_error", e.to_string())
                    .unwrap_or_else(|err| {
                        eprintln!("Failed to emit training_error event: {}", err)
                    });
                return;
            }
        };

        // Get the data directory
        let data_directory = match data_dir() {
            Some(dir) => dir,
            None => {
                let err_msg = "Data directory not found".to_string();
                eprintln!("{}", err_msg);
                app_handle_clone
                    .emit_all("training_error", err_msg.clone())
                    .unwrap_or_else(|err| {
                        eprintln!("Failed to emit training_error event: {}", err)
                    });
                return;
            }
        };

        // Define the drawings directory within data directory
        let drawings_dir = data_directory.join("drawings");

        // Load the dataset
        let dataset = match ai::utils::create_dataset(&drawings_dir) {
            Ok(d) => d,
            Err(e) => {
                eprintln!("Failed to create dataset: {}", e);
                app_handle_clone
                    .emit_all("training_error", e.to_string())
                    .unwrap_or_else(|err| {
                        eprintln!("Failed to emit training_error event: {}", err)
                    });
                return;
            }
        };

        // Create Training Args
        let args = TrainingArgs {
            epochs: 1,
            learning_rate: 0.01,
            batch_size: 10,
            save: Some(model_path.clone()),
            load: Some(model_path.clone()),
        };

        // Train the model
        if let Err(e) = model.train(&dataset, &args, &mut vm) {
            eprintln!("Failed to train model: {}", e);
            app_handle_clone
                .emit_all("training_error", e.to_string())
                .unwrap_or_else(|err| eprintln!("Failed to emit training_error event: {}", err));
            return;
        }

        // Emit training complete event
        app_handle_clone
            .emit_all("training_complete", ())
            .unwrap_or_else(|err| eprintln!("Failed to emit training_complete event: {}", err));
    });

    Ok(())
}

#[command]
pub fn predict_from_data(image_data: String) -> Result<u32, InvokeError> {
    // Get the device
    let dev = Device::cuda_if_available(0).unwrap_or(Device::Cpu);

    // Create the varmap
    let mut vm = candle_nn::VarMap::new();

    // Use get_model_path() to get the correct model path
    let model_path = get_model_path().map_err(|e| {
        eprintln!("Failed to get model path: {}", e);
        InvokeError::from(e)
    })?;

    let model =
        ConvNet::new_from_file(&mut vm, &PathBuf::from(model_path)).expect("Failed to load model");

    // Decode the base64 string
    let image_bytes = base64::decode(image_data).expect("Failed to decode base64 string");

    // Load the image from bytes
    let img = image::load_from_memory(&image_bytes).expect("Failed to load image from memory");

    // Get image as tensor
    let image =
        ai::utils::image_to_formatted_tensor(img).expect("Failed to convert image to tensor");

    // Get the prediction
    let prediction = model
        .predict(&image, &dev)
        .expect("Failed to predict image");

    println!("Prediction: {}", prediction);

    // Return the prediction
    Ok(prediction)
}

/// Helper function to get the model path from temp-assets directory
fn get_model_path() -> Result<String, String> {
    // Get the data directory
    let data_directory = data_dir().ok_or_else(|| "Data directory not found".to_string())?;

    // Define the temp-assets directory within data directory
    let temp_asset_dir = data_directory.join("temp-assets");

    // Define the model file path
    let model_path = temp_asset_dir.join("model.safetensors");

    // Check if the model file exists
    if !model_path.exists() {
        return Err(format!("Model file does not exist at {:?}", model_path));
    }

    // Return the absolute path as a string
    let absolute_path = fs::canonicalize(&model_path)
        .expect("Failed to get absolute path")
        .to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(|s| s.to_string())
        .map_err(|e| format!("Failed to get absolute path: {}", e))?
        .to_string();

    Ok(absolute_path)
}
