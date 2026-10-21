# Google Auth Setup

This document explains how to set up Google Sign-In for the Dream Ceylon tourism planner.

## 1. Create a Google Cloud OAuth Client
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or create a new one).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. If prompted, configure your OAuth consent screen (choose External, add app name, support email, and developer contact info).
6. Select **Web application** as the application type.
7. Under **Authorized JavaScript origins**, add your frontend URL:
   - `http://localhost:5173`
8. (Optional) Under **Authorized redirect URIs**, you can add your frontend redirect if necessary.
9. Click **Create**. You will get a **Client ID** and a **Client Secret**.

## 2. Configure Environment Variables
Add your generated credentials to your local environment variables.

**Backend (`server/.env`)**:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Frontend (`client/.env`)**:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 3. Run Locally
After adding your API keys, restart your backend and frontend servers:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Now, when you visit the Login page, you will see a **"Continue with Google"** button!
