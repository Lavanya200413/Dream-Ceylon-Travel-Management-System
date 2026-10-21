# Dream Ceylon — Smart Lanka Tourism Planner

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, full-stack MERN travel management and smart itinerary planning platform designed for exploring Sri Lanka. Features AI-powered smart itinerary generation, turn-by-turn route mapping via OpenStreetMap and OSRM, role-based dashboards, Google OAuth, and customizable tour packages (Basic, Standard, and Premium).

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
- [Environment Configuration](#environment-configuration)
- [Database Seeding](#database-seeding)
- [API Endpoints Overview](#api-endpoints-overview)
- [Mapping Stack (OpenStreetMap & OSRM)](#mapping-stack-openstreetmap--osrm)
- [Tour Packages Architecture](#tour-packages-architecture)
- [Team Contribution Workflow](#team-contribution-workflow)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Overview

Dream Ceylon bridges tourists, certified tour guides, and hotel partners across Sri Lanka. It combines interactive geographic route generation, smart preference-based destination recommendation, and flexible travel tiers into a seamless, high-performance web platform.

---

## Key Features

- **Smart Itinerary Planner**: Multi-step wizard matching duration, travelers, travel interests (Cultural, Mountain, Beach, Wildlife, Forest), weather preferences, and transport modes.
- **Open-Source Interactive Map**: Built with Leaflet, OpenStreetMap, and Project OSRM for real-time turn-by-turn road distance, drive duration, and interactive route polylines without costly third-party map API keys.
- **Three-Tier Tour Packages**:
  - **Basic**: Dedicated standard private transport and licensed chauffeur. Accommodation and meals self-arranged.
  - **Standard**: 3–4★ handpicked hotels and comfort transport included. Food excluded by default; optional tour guide add-on.
  - **Premium**: All-inclusive complete luxury experience with 5★ luxury resorts, choice of 5 gourmet culinary preferences, and dedicated specialist tour guide of choice.
- **Dual Authentication**: Secure local email/password registration with bcrypt & JWT, plus one-tap Google OAuth 2.0 sign-in.
- **Role-Based Dashboards**: Tailored views for Tourists, Tour Guides, Hotel Partners, and Administrators.

---

## Technology Stack

### Frontend (`client/`)
- **Core**: React 18, Vite 5, JavaScript (ES Modules)
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Routing**: React Router DOM v6
- **Mapping**: Leaflet 1.9, React-Leaflet 4.2
- **Icons**: Lucide React
- **HTTP Client**: Axios with automated Bearer token interceptor
- **Authentication**: `@react-oauth/google`

### Backend (`server/`)
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8 ODM
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `google-auth-library`
- **Routing Engine**: Project OSRM (Open Source Routing Machine) API integration
- **Geocoding**: OpenStreetMap Nominatim API

---

## Project Directory Structure

```
project/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, MapView, Cards, etc.)
│   │   ├── context/            # Global state (AuthContext, PackageContext)
│   │   ├── pages/              # Routed views (Home, Destinations, Planner, Packages, etc.)
│   │   ├── services/           # Axios API service instance & interceptors
│   │   ├── App.jsx             # React Router configuration
│   │   ├── index.css           # Tailwind directives & custom utilities
│   │   └── main.jsx            # React root with providers
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Client dependencies & scripts
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── .env.example            # Client environment variable template
│
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # Database (db.js) & Google OAuth (googleAuth.js)
│   ├── controllers/            # Route business logic (auth, planner, destinations, etc.)
│   ├── middlewares/            # JWT authentication & role authorization middleware
│   ├── models/                 # Mongoose schemas (User, Destination, Package, etc.)
│   ├── routes/                 # Express API routes
│   ├── services/               # Map geocoding, OSRM routing & recommendation engine
│   ├── seed.js                 # Database seed script for destinations
│   ├── seedPackages.js         # Database seed script for tour packages
│   ├── package.json            # Server dependencies & scripts
│   ├── server.js               # Application entry point
│   └── .env.example            # Server environment variable template
│
├── .gitignore                  # Git exclusion rules for node_modules, .env & builds
├── CLEANUP_AUDIT.md            # Initial project audit and file classification
├── CLEANUP_REPORT.md           # Cleanup actions, rationale, and validation logs
├── ENVIRONMENT_SETUP.md        # Environment variables and security instructions
├── GOOGLE_AUTH_SETUP.md        # Google Cloud OAuth 2.0 configuration guide
├── MAP_SETUP.md                # OpenStreetMap, Leaflet & OSRM integration guide
└── README.md                   # Primary project documentation
```

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (packaged with Node.js)
- **MongoDB**: Local community server on port `27017` ([Download](https://www.mongodb.com/try/download/community)) or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster URI.

---

## Installation & Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

### 2. Configure Environment Files
Copy the example templates in both folders:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```
*(Review [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for full configuration options).*

### 3. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Seed the Database
Ensure MongoDB is running, then populate initial destinations and packages:

```bash
cd ../server
npm run seed
```

### 5. Start Development Servers

Open two terminal windows:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Environment Configuration

| Scope | File | Description |
|:---|:---|:---|
| **Server** | `server/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Client** | `client/.env` | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |

> 🔒 **Security Notice**: Actual `.env` files are ignored by Git. Never commit production secrets or API keys. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

---

## Database Seeding

The backend includes built-in scripts to populate sample data:
- `npm run seed`: Runs both `seed.js` and `seedPackages.js` sequentially.
  - `seed.js`: Imports 9 iconic Sri Lankan destinations (**Sigiriya, Ella, Kandy, Galle Fort, Yala, Nuwara Eliya, Mirissa, Arugam Bay, Horton Plains**) with GPS coordinates and ratings.
  - `seedPackages.js`: Seeds the **Basic**, **Standard**, and **Premium** tour packages with updated business rules, explicit inclusions, exclusions, and customization choices.

---

## API Endpoints Overview

Base URL: `http://localhost:5000/api`

| Module | Method | Endpoint | Access | Description |
|:---|:---:|:---|:---:|:---|
| **Auth** | `POST` | `/auth/register` | Public | Register new user account |
| | `POST` | `/auth/login` | Public | Authenticate user & issue JWT |
| | `GET` | `/auth/me` | Private | Retrieve authenticated user profile |
| | `POST` | `/auth/google` | Public | Verify Google ID token & synchronize user |
| **Destinations** | `GET` | `/destinations` | Public | Get all destinations |
| | `GET` | `/destinations/:id` | Public | Get destination by ID |
| | `POST` | `/destinations` | Admin | Create new destination |
| **Packages** | `GET` | `/packages` | Public | Get all tour packages |
| | `GET` | `/packages/:id` | Public | Get package details by ID |
| **Planner** | `GET` | `/planner/recommendations` | Private | Get rule-based destination recommendations |
| | `POST` | `/planner/plan` | Private | Save custom travel plan to profile |
| **Maps** | `GET` | `/maps/route` | Public | Query OSRM turn-by-turn routing between coordinates |
| | `GET` | `/maps/nearby` | Public | Haversine formula nearby destinations search |
| | `GET` | `/maps/geocode` | Public | OpenStreetMap Nominatim geocoding proxy |
| **Hotels** | `GET` | `/hotels` | Public | List hotel partners |
| **Guides** | `GET` | `/guides` | Public | List certified tour guides |
| **Bookings** | `GET` | `/bookings` | Private | List authenticated user bookings |
| | `POST` | `/bookings` | Private | Create travel booking |

---

## Mapping Stack (OpenStreetMap & OSRM)

Dream Ceylon runs completely on **free, open-source mapping**:
- **Tiles**: OpenStreetMap standard tile server rendered via `react-leaflet`.
- **Turn-by-Turn Routing**: Backend queries `http://router.project-osrm.org/route/v1/{mode}/{coords}` and returns full geometry arrays converted to Leaflet-compatible `[lat, lng]` coordinates.
- **Geocoding**: OpenStreetMap Nominatim API proxy (`/api/maps/geocode`).
- See [MAP_SETUP.md](MAP_SETUP.md) for deeper implementation details.

---

## Tour Packages Architecture

1. **Basic Package (Standard Transport)**:
   - Dedicated private air-conditioned vehicle with licensed chauffeur.
   - Accommodation, meals, and tour guide are **excluded**.
2. **Standard Package (Accommodation & Non-Food)**:
   - Handpicked 3–4★ hotels and standard transport included.
   - Meals are **excluded by default** (pay as you dine).
   - Tour guide is **not automatically included**, but available as an optional add-on service (`+$45/day`).
3. **Premium Package (Complete Experience)**:
   - 5★ luxury resort accommodations and luxury transport.
   - Full-board dining with choice of 5 culinary preferences (Sri Lankan, Coastal Seafood, International, Vegan, Halal).
   - Dedicated specialist tour guide of choice included.
   - National park safaris, heritage site tickets, and spa vouchers included.

---

## Team Contribution Workflow

1. **Branching Strategy**:
   - `main`: Production-ready release branch.
   - `develop`: Integration branch for active features.
   - `feature/<feature-name>`: Topic branches for individual features.
2. **Commit Conventions**:
   Follow conventional commits:
   - `feat: add hotel filter by district`
   - `fix: resolve coordinate ordering in OSRM proxy`
   - `docs: update environment setup instructions`
   - `refactor: clean unused dependencies`
3. **Pull Request Protocol**:
   - Always run `npm run build` in `client/` before submitting a PR.
   - Ensure no `.env` or sensitive credentials are committed.
   - Verify server startup and database seeds.

---

## Known Limitations & Roadmap

- **Hotels & Guides Catalog UI**: Backend models, controllers, and routes are implemented. The frontend `/hotels` and `/guides` views currently render informational placeholders ready for catalog cards.
- **Payment Gateway**: Current booking actions register plans in MongoDB; live Stripe or PayHere payment gateway integration is planned for the next release.
- **Offline Map Caching**: Currently queries public OpenStreetMap and OSRM servers; self-hosted OSRM tile server support is planned for high-traffic deployments.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
