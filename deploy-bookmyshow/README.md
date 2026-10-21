# 🎬 BookMyShow PWA - Ready to Deploy Package

This folder is a **100% self-contained, pre-built production package** for the **BookMyShow Progressive Web App**. It includes the bundled frontend (PWA, Service Worker, Manifest, and assets) along with the Node.js Express REST API server.

---

## 📁 Package Structure

```
deploy-bookmyshow/
├── public/                 # Pre-built production frontend & PWA assets
│   ├── assets/             # Optimized CSS & JS bundles
│   ├── index.html          # Shell HTML with Plus Jakarta Sans & PWA tags
│   ├── manifest.webmanifest# W3C Web App Manifest with app shortcuts
│   ├── sw.js               # Service Worker with offline caching strategies
│   ├── pwa-192.svg         # 192x192 App Icon
│   ├── pwa-512.svg         # 512x512 App Icon
│   ├── pwa-maskable.svg    # 512x512 Maskable Icon
│   └── favicon.svg         # BookMyShow Ticket Favicon
├── server.js               # Express server (REST APIs + Static PWA Server)
├── package.json            # Runtime dependencies (express, cors, jsonwebtoken, dotenv)
├── vercel.json             # 1-Click Vercel configuration
├── render.yaml             # 1-Click Render configuration
├── Procfile                # Heroku / Railway startup config
├── Dockerfile              # Docker production container config
└── README.md               # Deployment instructions (this file)
```

---

## 🚀 Deployment Options

### Option 1: Run Locally or on Any VPS (Ubuntu, Debian, EC2, Droplet)

```bash
# 1. Enter the deployment folder
cd deploy-bookmyshow

# 2. Install production dependencies
npm install --omit=dev

# 3. Start the application
npm start
```
Open **`http://localhost:5000`** in your browser. Both the BookMyShow PWA frontend and REST APIs are active!

---

### Option 2: Deploy to Vercel (1-Click)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```
2. Run inside `deploy-bookmyshow`:
   ```bash
   cd deploy-bookmyshow
   vercel
   ```
3. Follow the CLI prompt — Vercel will deploy using `vercel.json` and give you an instant live URL (e.g. `https://bookmyshow-xxx.vercel.app`).

---

### Option 3: Deploy to Render / Railway

1. Push this folder to a Git repository (GitHub / GitLab).
2. Go to [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Select **New Web Service** and connect your repository:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. The service will automatically boot and provide an `https://...` URL.

---

### Option 4: Deploy with Docker

```bash
# 1. Build the Docker image
docker build -t bookmyshow-pwa .

# 2. Run the container
docker run -p 5000:5000 bookmyshow-pwa
```
Access the application at `http://localhost:5000`.

---

## 📱 Progressive Web App (PWA) Features Included

- **Offline Mode**: Movies and previously confirmed M-Tickets are cached in the browser by `sw.js`.
- **Installable**: Shows a native "Install BookMyShow App" banner on Chrome, Edge, Safari, and Android.
- **M-Ticket Scanning**: Paperless digital M-Tickets with simulated turnstile QR codes.
- **Quick Shortcuts**: Jump directly to *Now Showing Movies*, *Theatres*, or *Your Orders* from your phone's home screen icon.
