# FactWorld 🌍🚀

> **An interactive 3D Country Globe and Cosmic Solar System Explorer built with Next.js 16, React 19, Three.js, and Tailwind CSS.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-orange?logo=three.js)](https://threejs.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?logo=github)](https://sohaibwaheed21.github.io/FactWorld/)

---

## 🌟 Live Demo

Experience FactWorld live on GitHub Pages:
👉 **[https://sohaibwaheed21.github.io/FactWorld/](https://sohaibwaheed21.github.io/FactWorld/)**

---

## ✨ Features

- **🌍 Interactive 3D Earth Globe**: Seamlessly rotate, zoom, and explore every sovereign nation on Earth rendered with high-precision GeoJSON boundaries.
- **💡 Country Facts HUD**: Click any country to instantly view its capital, population, region, official languages, currencies, and an entertaining curated fun fact.
- **🦅 National Symbols Showcase**: Rich visual gallery displaying official national animals, birds, and national dishes for selected countries.
- **👘 Animated Cultural Pixel Avatars**: Handcrafted pixel-art sprites with country-specific animations (e.g. practicing Tai Chi in China, strolling under falling cherry blossoms in Japan) with automatic accessibility support for `prefers-reduced-motion`.
- **🪐 Cosmic 3D Solar System View**: Look beyond Earth to explore a realistically textured 3D simulation of our solar system including the Sun, Mercury, Venus, Mars, Jupiter with its moon, and Saturn with its iconic rings and radial UV maps.
- **🛸 Custom Astrodynamic Cursors**: Bespoke custom HUD and UFO targeting cursors responsive to hover and selection states.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Static Export)
- **UI Library**: [React 19](https://react.dev/)
- **3D Graphics & Visualization**:
  - [Three.js](https://threejs.org/)
  - [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data & Geography**: Natural Earth 110m Admin 0 Countries GeoJSON & REST Countries API
- **Deployment**: [GitHub Pages](https://pages.github.com/) via GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SohaibWaheed21/FactWorld.git
   cd FactWorld
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view FactWorld.

---

## 📦 Building & Static Export

To create an optimized production static build:

```bash
npm run build
```

This generates a static export in the `out/` directory ready to be served by any static web hosting provider (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

---

## 🌐 Deploying to GitHub Pages

FactWorld is configured for automated deployment via GitHub Pages using **GitHub Actions**.

### Enabling GitHub Pages in Repository Settings:

1. Go to your repository on GitHub: `https://github.com/SohaibWaheed21/FactWorld`
2. Click on **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**:
   - Select **GitHub Actions** (recommended: uses the `.github/workflows/deploy.yml` workflow)
   - *OR* select **Deploy from a branch** and choose the `gh-pages` branch.
4. Your site will automatically build and publish at:
   `https://sohaibwaheed21.github.io/FactWorld/`

---

## 📁 Project Structure

```
FactWorld/
├── app/
│   ├── credits/page.tsx    # Asset and sprite attributions
│   ├── globals.css         # Tailwind & custom cursor styling
│   ├── layout.tsx          # Root layout and metadata
│   └── page.tsx            # Main 3D Globe & HUD interface
├── components/
│   ├── country-avatar.tsx  # Animated cultural sprite container
│   ├── fun-fact-box.tsx    # Country fun fact HUD component
│   └── pixel-avatar.tsx    # Pixel sprite sheet animator
├── data/
│   ├── countries.json       # Country demographics & info
│   ├── countries-extra.json # Fun facts and sprite configurations
│   └── national-symbols.json# National animals, birds & dishes
├── lib/
│   ├── fun-fact.ts         # Country facts & formatting helpers
│   └── solar-system.ts     # Three.js 3D Solar System simulation
├── public/
│   ├── avatars/            # Pixel art character sprite sheets
│   ├── textures/           # Planet texture and bump maps
│   └── ne_110m_admin_0_countries.geojson
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment to Pages
├── next.config.ts          # Next.js configuration (static export & basePath)
└── package.json
```

---

## 📜 Credits & License

- Character sprites & pixel art authored by LPC community contributors & LyniaDesign. For full details and licenses, visit the in-app [/credits](https://sohaibwaheed21.github.io/FactWorld/credits) page.
- Earth GeoJSON provided by [Natural Earth](https://www.naturalearthdata.com/).
- Planet textures provided by NASA / Solar System Scope under Creative Commons.

License: [MIT](LICENSE)
