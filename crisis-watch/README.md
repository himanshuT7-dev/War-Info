# WarInfo Crisis Watch

A web-based conflict monitoring application for humanitarian crisis tracking, evacuation planning, and safety information. Tracks active conflicts across Ukraine, Gaza/Lebanon, Iran/Israel, Sudan, Afghanistan, and provides a global overview.

## Features

- **Interactive map** — Conflict reports, evacuation corridors, shelter locations, flight tracking
- **Threat intelligence** — Region status, reports, disasters, casualties, geopolitical tensions, news
- **Evacuation tools** — Route planning, border crossings, emergency contacts, amenities along routes
- **Layer toggles** — Strikes, corridors, shelters, flights

## Prerequisites

- Node.js 18+ 
- npm

## Quick Start

### 1. Start the backend

```bash
cd crisis-watch/backend
npm install
npm start
```

The API runs on **http://localhost:4000**.

### 2. Start the frontend

```bash
cd crisis-watch/frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**. The frontend proxies `/api` requests to the backend automatically.

## Data Sources

- Wikipedia — Casualties, conflict data, geopolitical tensions
- GDELT — Real-time crisis news
- OpenSky — Live flight tracking
- HDX / UNHCR — Shelter locations
- Nominatim — Geocoding

All data sources are free and require no API keys.

## Optional: Data Scripts

To update country statistics or GeoJSON data:

```bash
cd crisis-watch/backend
node data/generate_stats.js   # Fetch World Bank data → countryStats.json
node data/update_stats.js     # Update missing stats
node data/fix_map.js          # Patch countries.geo.json
```

## Environment Variables

- `PORT` — Backend port (default: 4000)

## Project Structure

```
crisis-watch/
├── backend/          # Express API server
│   ├── routes/       # API route handlers
│   ├── data/         # Static data & scripts
│   └── server.js     # Entry point
└── frontend/        # React + Vite SPA
    └── src/
        ├── components/
        ├── hooks/
        └── utils/
```

## Future Enhancements

Ideas for additional features:

- **Marker clustering** — Group nearby strikes/shelters into clusters when zoomed out to reduce DOM load
- **Search** — Search reports, countries, or locations across the map
- **Date range filter** — Filter reports by date (last 24h, 7 days, 30 days)
- **Export / Share** — Export threat summary or share a region snapshot as PDF/link
- **Alerts & notifications** — Browser push or email alerts when new high-severity reports appear in a region
- **Historical view** — Toggle to see conflict timeline or past incident density
- **Dark/light theme** — User preference for map and UI theme
- **Offline / PWA** — Service worker for basic offline use and installable app
- **Multi-language** — Translate UI and key labels (Arabic, Ukrainian, French)
- **Compare regions** — Side-by-side stats for two conflict zones
