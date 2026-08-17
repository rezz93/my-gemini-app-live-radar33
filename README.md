# 🌦️ Live Weather Radar & Future Nowcast Engine

An interactive, high-precision global live weather radar and atmospheric nowcasting application built with React, TypeScript, Leaflet, Tailwind CSS, and Motion.

![Live Weather Radar](https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80)

## ✨ Key Features

- 🛰️ **Real-Time Doppler Radar**: Seamless real-time radar data synchronized with RainViewer global satellite and radar feeds.
- 🔮 **Atmospheric Nowcasting & Future Radar**: Physics-based advection forecasting that calculates storm propagation vectors, displacement, and atmospheric dispersion up to 2 hours in the future.
- 🗺️ **Multi-Layer Base Maps**: Topographic terrain, satellite imagery, dark/light canvas, OpenStreetMap, and OpenTopoMap with smooth tile blending.
- 🔍 **Sub-Pixel High-Res Upsampling**: Custom HTML5 Canvas GridLayer with bilinear smoothing for continuous radar rendering across all zoom levels (z0 - z18).
- 📍 **Location Autocomplete & Geocoding**: Direct search by city, state, or ZIP code with fast debounce geocoding.
- ⚡ **Interactive Animation Controls**: Play/pause timelines, step backwards/forwards, loop past/future sequences, and jump to current conditions.
- 📊 **Precipitation Metrics & Insights**: Live rain rate (mm/h), dBZ reflectivity color scale, active alerts, and storm tracking vectors.
- 📦 **Standalone Single-File HTML Export**: One-click export that generates a self-contained, offline-compatible HTML file containing the entire radar engine and offline advection simulator.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build & Deployment

### Production Build
To create an optimized production build:
```bash
npm run build
```
The output will be generated in the `dist/` directory.

### Deploy to GitHub Pages / Vercel / Netlify
- **Vercel / Netlify**: Simply link this GitHub repository. The build command is `npm run build` and output directory is `dist`.
- **GitHub Pages**: A GitHub Actions workflow is included in `.github/workflows/deploy.yml` to automatically build and deploy the application on push to `main`.

---

## 📁 Project Structure

```
├── .github/workflows/deploy.yml  # GitHub Actions automated build & deployment
├── src/
│   ├── components/               # UI components (RadarMap, Controls, Search, Metrics)
│   ├── services/                 # Weather API & Standalone HTML generator
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── App.tsx                   # Main application entry point
│   ├── main.tsx                  # Root renderer
│   └── index.css                 # Tailwind CSS styles
├── public/                       # Static assets & icons
├── package.json                  # Dependencies & scripts
└── vite.config.ts                # Vite configuration
```

---

## 📄 License
MIT License. Free to use, modify, and distribute.
