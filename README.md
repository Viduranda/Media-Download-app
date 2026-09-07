# Universal Media Downloader App (Cloud Model Guide)

This guide walks through converting your app into a **Full Cloud Model**, where:
1. **Backend Server runs 24/7 in the Cloud** (e.g. Render, Railway, Vercel, Docker).
2. **Mobile App is compiled into standalone Android APK & iOS App** using **Expo Cloud Build (EAS)**, allowing anyone to install and use the app on any device without running a PC or local Metro Bundler server!

---

## Step 1: Deploy Backend API to the Cloud (Free Hosting)

Your backend includes a pre-configured `Dockerfile` and `render.yaml`.

### Option A: Deploy on Render (Recommended - Free)
1. Push your code to GitHub (or import `E:\PERSONAL\mobile apk\apps\backend`).
2. Go to [Render.com](https://render.com) -> Click **New Web Service**.
3. Select **Docker** environment.
4. Render will automatically build the `Dockerfile` (installing `yt-dlp` and `ffmpeg`).
5. Copy your deployed cloud URL (e.g. `https://media-downloader-api.onrender.com`).

### Option B: Deploy on Railway or Vercel
1. Go to [Railway.app](https://railway.app) -> **New Project** -> Deploy from GitHub.
2. Railway detects `Dockerfile` and deploys automatically.

---

## Step 2: Update Mobile App Cloud API URL

Open `E:\PERSONAL\mobile apk\apps\mobile\src\services\apiService.ts`:
```typescript
export const CLOUD_API_URL = 'https://YOUR-DEPLOYED-RENDER-URL.onrender.com/api';
```

---

## Step 3: Build Standalone Cloud APK for Android

Run this command in your PowerShell to build a direct downloadable `.apk` file using Expo Cloud Build:

```powershell
cd "E:\PERSONAL\mobile apk\apps\mobile"
npx eas-cli build --platform android --profile preview
```

Expo Cloud will build your `.apk` in the cloud and give you a direct download link / QR code to install the APK directly onto any Android phone!

---

## Step 4: Build iOS App

For iOS devices:
```powershell
cd "E:\PERSONAL\mobile apk\apps\mobile"
npx eas-cli build --platform ios --profile preview
```
This generates an iOS build for installation via TestFlight or direct device registration.
