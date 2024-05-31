// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ::windows::Win32::UI::Shell::SHQueryUserNotificationState;
use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[tauri::command]
async fn check_notification_state() -> Result<i32, String> {
    let result = unsafe { SHQueryUserNotificationState() };
    match result {
        Ok(state) => Ok(state.0),
        Err(_) => Err("Not supported on this machine.".into()),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);

            app.emit("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .invoke_handler(tauri::generate_handler![check_notification_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
