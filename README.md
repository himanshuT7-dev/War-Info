# War-Info: Global Conflict Monitor

War-Info is a real-time humanitarian crisis tracking and mapping platform designed for civilian evacuation, safety monitoring, and tactical awareness in conflict zones globally. It provides live visualizations of active hostilities, safe evacuation corridors, flight restrictions, critical infrastructure failures (cyber/grid outgages), and emergency facility locations.

## Features

- **Interactive Tactical Map**: Live visualization of strikes, corridors, shelters, and flight data using Leaflet and WebGL heatmaps.
- **Global & Regional Monitoring**: Specialized views for major conflict zones including Ukraine-Russia, Israel-Gaza, Myanmar, Sudan, Ethiopia, DRC, and more.
- **Evacuation Tools**: Safe route mapping, emergency shelter locations (via UNHCR and local APIs), and border crossing statuses.
- **Threat Intelligence**: Aggregated news, real-time casualty tracking (Wikipedia/ReliefWeb), and active crises overviews.
- **Cyber Warfare & Infrastructure**: Pulse map layers indicating regional telecom drops, DDoS attacks, and power grid failures.
- **Country Power Comparison**: Interactive statistical breakdowns of economy and military metrics across world nations.
- **Progressive Web App (PWA)**: Mobile-optimized bottom navigation layout with offline caching and "Add to Home Screen" capabilities.

## Architecture

This project uses a MERN stack heavily optimized for real-time frontend mapping applications.
- **Frontend**: React, Vite, Tailwind CSS, React-Leaflet.
- **Backend**: Node.js, Express, providing proxy APIs, caching layers, and external aggregations.
