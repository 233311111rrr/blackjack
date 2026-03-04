# Blackjack Pro Advisor - Android & GitHub Sync Guide

這是一個基於 React + Vite + Capacitor 的 21 點策略助手。

## 1. 如何同步到 GitHub

由於我無法直接登入你的 GitHub 帳號，請按照以下步驟在你的電腦上操作：

1. **在 GitHub 上建立一個新的 Repository** (例如命名為 `blackjack-pro-advisor`)。
2. **在你的電腦上打開終端機 (Terminal)**，進入專案目錄。
3. **執行以下指令：**

```bash
# 初始化 Git
git init

# 加入所有檔案
git add .

# 提交變更
git commit -m "Initial commit: Blackjack Pro Advisor with Android support"

# 連結到你的 GitHub (請將 <YOUR_GITHUB_URL> 替換為你的 Repo 網址)
git remote add origin <YOUR_GITHUB_URL>

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 2. 如何生成 Android APK

要生成 APK，你需要在電腦上安裝 **Android Studio**。

1. **安裝依賴：**
   ```bash
   npm install
   ```

2. **同步網頁程式碼到 Android 專案：**
   ```bash
   npm run mobile:sync
   ```

3. **使用 Android Studio 打開專案：**
   ```bash
   npm run mobile:open
   ```

4. **在 Android Studio 中：**
   - 等待 Gradle 同步完成。
   - 點擊選單：**Build > Build Bundle(s) / APK(s) > Build APK(s)**。
   - 完成後，點擊右下角的 **Locate** 即可找到生成的 `.apk` 檔案。

---

## 3. 技術架構

- **前端**: React + Tailwind CSS + Framer Motion
- **跨平台框架**: Capacitor
- **策略引擎**: 基於 21 點基本策略 (Basic Strategy)
- **已移除功能**: 根據使用者要求，已移除重放 (Replay) 功能。
