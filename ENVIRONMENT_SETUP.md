# Dream Ceylon — Environment Setup & Security Guide

This document describes all environment variables required for running the Dream Ceylon application, the distinction between server and client configurations, and essential security practices before pushing code to GitHub.

---

## 1. Security First: Credential Protection

> [!WARNING]
> **Never commit real `.env` files to Git!**  
> Local `.env` files contain sensitive credentials such as JWT secret keys and OAuth client secrets. Ensure `.gitignore` is present at the repository root before making your first git commit.

### Secret Rotation Notice
If any API credentials, Google OAuth client secrets, or private tokens were ever shared, committed in earlier local Git repositories, or exposed publicly:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Select your OAuth Client ID and click **Reset Secret** to generate a new Client Secret.
3. Update your local `server/.env` file.
4. If using a production database (e.g., MongoDB Atlas), rotate the database user credentials.

---

## 2. Server Environment Variables (`server/.env`)

Create a `.env` file inside the `server/` directory:

```bash
cp server/.env.example server/.env
```

| Variable | Required | Description | Example / Recommended Value |
|:---|:---:|:---|:---|
| `PORT` | Yes | HTTP port the Express server listens on | `5000` |
| `NODE_ENV` | Optional | Application runtime mode (`development` or `production`) | `development` |
| `MONGO_URI` | Yes | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://localhost:27017/dream-ceylon` |
| `JWT_SECRET` | Yes | Private key used to sign JSON Web Tokens | 32+ character random secret (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRE` | Yes | Expiration duration for user sessions | `30d` |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud OAuth 2.0 Web Application Client ID | `your_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud OAuth 2.0 Client Secret (Private to server) | `GOCSPX-your_client_secret_here` |

> **Security Note**: `GOOGLE_CLIENT_SECRET` must **never** be exposed to the client or browser. It is strictly consumed by Node.js to verify Google ID tokens.

---

## 3. Client Environment Variables (`client/.env`)

Create a `.env` file inside the `client/` directory:

```bash
cp client/.env.example client/.env
```

| Variable | Required | Description | Example Value |
|:---|:---:|:---|:---|
| `VITE_API_URL` | Yes | Base URL pointing to the Express backend API | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth Web Client ID (Public browser identifier) | `your_id.apps.googleusercontent.com` |

> **Vite Convention**: In Vite, only environment variables prefixed with `VITE_` are exposed to the browser client bundle (`import.meta.env.VITE_*`). Never prefix sensitive private secrets with `VITE_`.

---

## 4. Google OAuth 2.0 Configuration Checklist

1. **Origins & Redirects**:
   In the Google Cloud Console, under **Authorized JavaScript Origins**, add:
   - `http://localhost:5173` (Vite development server)
   - `http://localhost:5000` (Backend API origin, if testing server redirects)
2. **Same Client ID**:
   Ensure `GOOGLE_CLIENT_ID` in `server/.env` and `VITE_GOOGLE_CLIENT_ID` in `client/.env` match the same OAuth client ID so that client-issued ID tokens match the backend verification audience.

---

## 5. Verification Command

To confirm that your environment variables are configured correctly without exposing secrets:

```bash
# Verify backend connection and routes
node -e "require('dotenv').config({ path: 'server/.env' }); console.log('Backend Port:', process.env.PORT, '| Mongo configured:', !!process.env.MONGO_URI, '| Google Auth configured:', !!process.env.GOOGLE_CLIENT_ID);"
```
