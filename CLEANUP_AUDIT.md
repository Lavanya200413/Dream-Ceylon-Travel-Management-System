# Dream Ceylon — Complete Project Cleanup Audit

**Audit Date**: October 21, 2026  
**Project**: Dream Ceylon — Smart Lanka Tourism Planner  
**Stack**: MERN (MongoDB, Express, React, Node.js) with Tailwind CSS, OpenStreetMap + Leaflet, OSRM Routing, and Google OAuth  
**Prepared by**: Senior MERN Stack Architect & Repository Maintenance Specialist  

---

## 1. Executive Summary

This comprehensive audit was performed to evaluate the codebase architecture, file dependencies, security posture, configuration integrity, and readiness for initial Git repository initialization and team collaboration on GitHub.

The application is structured as a decoupled monorepo containing a **Node.js/Express backend (`server/`)** and a **Vite/React frontend (`client/`)**.

Key operational findings:
- **Backend**: Express API running on port 5000 with 10 primary route modules, Mongoose models, JWT authentication, Google OAuth verification, and OpenStreetMap/OSRM routing services.
- **Frontend**: Single Page Application built with React 18, React Router DOM v6, Tailwind CSS, Leaflet/React-Leaflet, and context providers for authentication and tour packages.
- **Security**: Real secrets (JWT secrets, Google OAuth client secret) were stored in `server/.env` without a root `.gitignore`, posing a severe leak risk if pushed to GitHub.
- **Scaffolding Artifacts**: Several legacy initialization scripts (`generate_workspace.js`, `setup_backend.js`, `setup_frontend.js`, `setup_frontend_from_json.js`, `fix.js`, `rename.js`, `frontend_files.json`) remain in the repository after initial setup.

---

## 2. Comprehensive File Classification

All files across the repository have been inspected and classified according to the audit framework:

### Category A: Required Production / Application Files
*Essential for runtime execution of the client and server.*

| File Path | Description / Role | Status |
|:---|:---|:---:|
| `server/server.js` | Express app entry point, middleware & route mounting | **Active** |
| `server/config/db.js` | MongoDB connection via Mongoose | **Active** |
| `server/config/googleAuth.js` | Google OAuth2 client initialization | **Active** |
| `server/models/User.js` | User schema with bcrypt hashing & JWT generation | **Active** |
| `server/models/Destination.js` | Sri Lanka travel destination schema & geo-coordinates | **Active** |
| `server/models/Package.js` | Basic, Standard, and Premium tour package schemas | **Active** |
| `server/models/Booking.js` | Travel booking schema & status tracking | **Active** |
| `server/models/Hotel.js` | Hotel partner schema & amenities | **Active** |
| `server/models/Guide.js` | Tour guide schema & daily rates | **Active** |
| `server/models/TourPlan.js` | User-generated smart itinerary schema | **Active** |
| `server/models/TouristProfile.js`| Tourist preference profile schema | **Active** |
| `server/models/Review.js` | Destination and guide reviews schema | **Active** |
| `server/models/Holiday.js` | Sri Lankan public holidays reference model | **Active** |
| `server/models/CurrencyRate.js` | Currency conversion rate model | **Active** |
| `server/controllers/authController.js` | Email/password registration, login, getMe | **Active** |
| `server/controllers/googleAuthController.js` | Google ID token verification & profile sync | **Active** |
| `server/controllers/destinationController.js` | Destination CRUD and queries | **Active** |
| `server/controllers/packageController.js` | Package listing and detail queries | **Active** |
| `server/controllers/plannerController.js` | Smart itinerary generation & recommendations | **Active** |
| `server/controllers/hotelController.js` | Hotel listings and partner endpoints | **Active** |
| `server/controllers/guideController.js` | Tour guide directory endpoints | **Active** |
| `server/controllers/bookingController.js` | Booking creation and user bookings | **Active** |
| `server/controllers/reviewController.js` | User review submissions | **Active** |
| `server/controllers/mapController.js` | OSRM routing and Nominatim geocoding proxy | **Active** |
| `server/middlewares/authMiddleware.js` | JWT Bearer token authentication & role authorization | **Active** |
| `server/routes/*.js` (10 files) | Express route definitions | **Active** |
| `server/services/mapService.js` | Haversine distance, OSRM routing, Nominatim geocoding | **Active** |
| `server/services/recommendationEngine.js` | Category & preference destination matching | **Active** |
| `client/index.html` | Vite HTML entry template | **Active** |
| `client/src/main.jsx` | React root rendering with AuthProvider & PackageProvider | **Active** |
| `client/src/App.jsx` | React Router route definitions and layout structure | **Active** |
| `client/src/index.css` | Tailwind directives and base stylesheet | **Active** |
| `client/src/components/Navbar.jsx` | Global navigation bar with user state | **Active** |
| `client/src/components/Footer.jsx` | Global responsive footer | **Active** |
| `client/src/components/ProfileDropdown.jsx` | User account menu, role badge, logout | **Active** |
| `client/src/components/GoogleLoginButton.jsx` | Google OAuth button component | **Active** |
| `client/src/components/MapView.jsx` | Leaflet interactive map with custom markers & polyline | **Active** |
| `client/src/components/DestinationCard.jsx` | Destination preview card | **Active** |
| `client/src/components/PackageCard.jsx` | Tour package card with inclusion/exclusion matrices | **Active** |
| `client/src/context/AuthContext.jsx` | Authentication state, JWT storage, user session | **Active** |
| `client/src/context/PackageContext.jsx` | Package selections, customizations & cost engine | **Active** |
| `client/src/services/api.js` | Axios instance with JWT authorization interceptor | **Active** |
| `client/src/pages/Home.jsx` | Landing page | **Active** |
| `client/src/pages/Login.jsx` | Email + Google authentication page | **Active** |
| `client/src/pages/Register.jsx` | Account creation page | **Active** |
| `client/src/pages/Destinations.jsx` | Destination catalog with search & filters | **Active** |
| `client/src/pages/DestinationDetails.jsx` | Single destination deep-dive with map & quick info | **Active** |
| `client/src/pages/Packages.jsx` | Tour package tier comparison | **Active** |
| `client/src/pages/PackageDetails.jsx` | Package rules, add-ons, meal & guide customizer | **Active** |
| `client/src/pages/Planner.jsx` | 4-step smart planner with live cost & route calculation | **Active** |
| `client/src/pages/Hotels.jsx` | Hotel directory placeholder page | **Active** |
| `client/src/pages/Guides.jsx` | Tour guide directory placeholder page | **Active** |
| `client/src/pages/Dashboard.jsx` | Role-based tourist & provider dashboard | **Active** |

---

### Category B: Required Development and Configuration Files
*Essential for building, testing, linting, and running the project in development.*

| File Path | Description / Role | Status |
|:---|:---|:---:|
| `server/package.json` | Server manifest, dependencies, scripts (`start`, `dev`) | **Keep** |
| `server/package-lock.json` | Server dependency lockfile | **Keep** |
| `server/seed.js` | MongoDB seed script for Sri Lankan destinations | **Keep** |
| `server/seedPackages.js` | MongoDB seed script for updated Basic/Standard/Premium packages | **Keep** |
| `server/.env.example` | Sanitized environment template for server | **Keep & Update** |
| `client/package.json` | Client manifest, scripts (`dev`, `build`, `lint`) | **Keep** |
| `client/package-lock.json` | Client dependency lockfile | **Keep** |
| `client/postcss.config.js` | PostCSS config for Tailwind CSS processing | **Keep** |
| `client/tailwind.config.js` | Tailwind CSS configuration | **Keep** |
| `client/.env.example` | Sanitized environment template for client | **Create** |
| `.gitignore` | Root Git exclusion file | **Create** |

---

### Category C: Useful Documentation and Testing Files
*Project documentation, setup guides, and architectural notes.*

| File Path | Description / Role | Status |
|:---|:---|:---:|
| `README.md` | Primary project overview and instructions | **Keep & Enhance** |
| `GOOGLE_AUTH_SETUP.md` | Step-by-step Google Cloud OAuth configuration guide | **Keep** |
| `MAP_SETUP.md` | Leaflet, OpenStreetMap, Nominatim, and OSRM guide | **Keep** |
| `CLEANUP_AUDIT.md` | Pre-cleanup structural audit and file classification | **New Deliverable** |
| `CLEANUP_REPORT.md` | Post-cleanup execution report and validation logs | **New Deliverable** |
| `ENVIRONMENT_SETUP.md` | Environment variable specifications and security policies | **New Deliverable** |

---

### Category D: Generated Files and Dependencies (Must NOT be Committed)
*Must be added to `.gitignore` and excluded from Git commits.*

| File Path | Nature / Reason for Exclusion |
|:---|:---|
| `server/node_modules/` | Server package dependencies (installed via `npm install`) |
| `client/node_modules/` | Client package dependencies (installed via `npm install`) |
| `client/dist/` | Vite production build output (regenerated via `npm run build`) |
| `server/.env` | Contains live credentials (JWT Secret, Google Client Secret) |
| `client/.env` | Contains local development environment settings |
| `*.log`, `npm-debug.log*` | Temporary runtime and debug logs |
| `.DS_Store`, `Thumbs.db` | Operating system generated index files |

---

### Category E: Confirmed Unused Files (Recommended for Safe Removal)
*Temporary scaffolding utilities used during initial project creation that are no longer referenced anywhere.*

| File Path | Size | Reason for Removal |
|:---|:---|:---|
| `generate_workspace.js` | 15.2 KB | Initial workspace generator script; completely superseded by active source tree. |
| `setup_backend.js` | 12.6 KB | Hardcoded string writer for backend files; obsolete. |
| `setup_frontend.js` | 41.0 KB | Hardcoded string writer for frontend files; obsolete. |
| `setup_frontend_from_json.js`| 0.5 KB | Unpacker script for `frontend_files.json`; obsolete. |
| `client/frontend_files.json` | 41.6 KB | Redundant JSON snapshot of initial frontend boilerplate; superseded by `client/src`. |
| `fix.js` | 0.4 KB | One-time regex string replacer run on setup script; obsolete. |
| `rename.js` | 1.2 KB | One-time bulk project renaming script; obsolete. |

---

### Category F: Uncertain Files (Preserve Until Verified)
*Files whose necessity cannot be established with 100% certainty.*

> **Audit Result**: **None.** Every file in the repository was analyzed, cross-referenced with imports, routing, and scripts. All files belong definitively to Categories A, B, C, D, or E.

---

## 3. Security & Environment Variable Audit

1. **Google OAuth Client Secret Exposure**:
   - `server/.env` contains `GOOGLE_CLIENT_SECRET=GOCSPX-...`.
   - **Action Required**: Add `.env` to `.gitignore`. Create `server/.env.example` with placeholder values (`your_google_client_secret_here`). Flag secret for rotation prior to public release.
2. **JWT Secret Hardcoding**:
   - `server/.env` contains a development secret `JWT_SECRET=your_jwt_super_secret_key_12345`.
   - **Action Required**: Retain development fallback in `.env.example`, but document in `ENVIRONMENT_SETUP.md` that production environments must use a cryptographically random string (e.g. `openssl rand -hex 32`).
3. **Client-Side Secrets**:
   - `client/.env` contains only public values (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`), conforming to Vite security standards.
   - **Action Required**: Create `client/.env.example` documenting these variables.

---

## 4. Next Actions (Phase 2 - Phase 9)
1. Safely remove the 7 confirmed obsolete scaffolding scripts (Category E).
2. Clean and standardize source code (Phase 3).
3. Create root `.gitignore`, `server/.env.example`, `client/.env.example`, and `ENVIRONMENT_SETUP.md` (Phase 4).
4. Perform dependency audit (Phase 5).
5. Verify all existing features and execute Vite build validation (Phases 6-7).
6. Update root `README.md` and prepare Git instructions (Phases 8-9).
