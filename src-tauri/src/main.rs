#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai;
mod commands;

use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // AI Commands
            train,
            predict_from_data,
            // Image Commands
            save_drawing,
            apply_conv_filter,
            apply_pooling_filter,
            apply_fully_connected_filter,
            get_input_image,
            // File Commands
            reset_temp_assets_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
