# DraftBook - Notebook & Sketch Journal

A fully responsive, beautiful, 3D page-flipping notebook web app built with React, Vite, and Tailwind CSS.

## 🚀 Running the App
If you are seeing a blank screen or the app isn't running:
1. Try **hard refreshing** the page (Ctrl + F5 or Cmd + Shift + R).
2. Clear your browser cache and local storage (the local storage schema changed when we added page sizes and images, which might cause an old version to crash). 
3. Open your browser console (F12) to see if there are any specific errors.

---

## 📦 How to convert this Web App into an APK (Android) or DMG (macOS)

Since this app is built purely with web technologies (React/HTML/JS/CSS), it can be easily converted into a native app using cross-platform wrappers.

### 📱 Android (APK) via Capacitor
[Capacitor](https://capacitorjs.com/) by Ionic is the easiest way to turn a web app into an Android app.

1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init DraftBook com.draftbook.app
   npm install @capacitor/android
   npx cap add android
   ```
2. **Build the Web App:**
   ```bash
   npm run build
   ```
3. **Sync to Android:**
   ```bash
   npx cap sync android
   ```
4. **Build the APK:**
   Open the generated `android` folder in **Android Studio**. From there, you can go to `Build > Build Bundle(s) / APK(s) > Build APK(s)` to generate your `.apk` file.

### 💻 macOS (DMG) via Tauri or Electron
[Tauri](https://tauri.app/) is a lightweight and blazing fast way to turn web apps into desktop apps (creates `.dmg` files natively).

1. **Install Tauri CLI:**
   ```bash
   npm install -D @tauri-apps/cli
   ```
2. **Initialize Tauri in your project:**
   ```bash
   npx tauri init
   ```
   *(Follow the prompts. Set your build command to `npm run build` and your output directory to `dist`)*
3. **Run in Desktop Dev Mode:**
   ```bash
   npx tauri dev
   ```
4. **Build the DMG:**
   ```bash
   npx tauri build
   ```
   Tauri will bundle the React app into a highly optimized macOS application and generate a `.dmg` file inside `src-tauri/target/release/bundle/dmg/`. 

*(Note: To build a `.dmg` file, you must run the build command on a macOS machine).*