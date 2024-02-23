# v0.0.0-alpha.4

### ✨ 新功能

* 新增 HTTPS fetch 資料來源 (https://github.com/ExpTechTW/TREM-tauri/pull/50)
* 支援地震速報取消報 (https://github.com/ExpTechTW/TREM-tauri/pull/50)

### 🪄 強化

* 修正設定檔未自動創建而導致啟動時顯示黑畫面的問題
* 更新 tauri 至 v2.0.0-beta.3

**完整變更紀錄**: https://github.com/ExpTechTW/TREM-tauri/compare/v0.0.0-alpha.3...v0.0.0-alpha.4


# v0.0.0-alpha.3

### ✨ 新功能

* **Rust 後端遷移至 tauri v2** (https://github.com/ExpTechTW/TREM-tauri/pull/38)
  * 已知問題：游標閃爍 (https://github.com/tauri-apps/tauri/issues/8770)
* 新增開機時自動啟動的設定 (https://github.com/ExpTechTW/TREM-tauri/pull/30)
* 新增最小化至系統匣的設定 (https://github.com/ExpTechTW/TREM-tauri/pull/30)
* 新增啟動參數 `--quiet` 在開啟程式時隱藏視窗 (https://github.com/ExpTechTW/TREM-tauri/pull/30)
* 停用瀏覽器內建快捷鍵 (https://github.com/ExpTechTW/TREM-tauri/pull/31)
* 自動抓取並更新地震報告 (https://github.com/ExpTechTW/TREM-tauri/pull/32)

### 🪄 強化

* 重構前端架構，將 API 放至 Vue 元件中 (https://github.com/ExpTechTW/TREM-tauri/pull/38)
* 修正切換面板後地圖不見的問題 (https://github.com/ExpTechTW/TREM-tauri/pull/34)
* 修正 macOS 環境下 Menu Bar 圖標黑影 (https://github.com/ExpTechTW/TREM-tauri/issues/37)

**完整變更紀錄**: https://github.com/ExpTechTW/TREM-tauri/compare/v0.0.0-alpha.2...v0.0.0-alpha.3


# v0.0.0-alpha.2

### ✨ 新功能

* 地震報告複製 (https://github.com/ExpTechTW/TREM-tauri/pull/24)
* 新增在速報時最上層顯示視窗的設定 (https://github.com/ExpTechTW/TREM-tauri/pull/22)

### 🪄 強化

* Api 支援 rts 請求 - @yayacat (https://github.com/ExpTechTW/TREM-tauri/pull/23)

**完整變更紀錄**: https://github.com/ExpTechTW/TREM-tauri/compare/v0.0.0-alpha.1...v0.0.0-alpha.2