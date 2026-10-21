# Open-Source Map Integration Setup

This document explains the completely free and open-source map stack used in Dream Ceylon tourism planner.

## 1. Technology Stack

- **Map Provider**: OpenStreetMap (OSM) via Leaflet.js
- **Frontend Integration**: `react-leaflet` and `leaflet`
- **Routing Engine**: Project OSRM (Open Source Routing Machine)
- **Geocoding**: Nominatim OpenStreetMap API

## 2. No API Keys Required
Because we are using entirely open-source routing and mapping technologies, you **do not** need to register for any Google Cloud accounts, nor do you need to input any API keys in `.env`.

## 3. How It Works

1. **Map Display**: The `MapView` component uses `react-leaflet` to display standard OpenStreetMap tile layers. It places custom markers automatically.
2. **Geocoding**: The `mapService` in the backend securely queries `nominatim.openstreetmap.org` without exposing the request structure to the frontend client.
3. **Routing**: When you generate a route, the backend queries `router.project-osrm.org` to generate turn-by-turn driving coordinates between destinations. The backend aggregates these segment paths and passes the geometry (as an array of `[lat, lng]`) back to the frontend to draw a clean `Polyline`.
4. **Haversine Distance**: Finding "nearby destinations" utilizes an algorithmic implementation of the Haversine formula against our internal MongoDB `Destinations` collection, saving external API requests.

## 4. Run Locally
To run the setup, ensure that all dependencies are installed:

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Now, when you use the Smart Planner, you can click **View Route on Map** to see an interactive map with plotted destination markers and the optimal driving route.
