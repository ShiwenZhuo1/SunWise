# SunWise

Vue 3 + Vite frontend for UV and sun protection guidance (Home, Learn, Advise).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to Vercel

1. Push the project to GitHub (or GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. **Add New Project** → import your repo. Vercel will detect Vite and use:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Connect to your backend** (required for chat, charts, location):
   - In Vercel: **Project → Settings → Environment Variables**
   - Add `VITE_API_BASE` = your backend URL (e.g. `https://your-api.railway.app` or `https://api.yoursite.com`). No trailing slash.
   - If you use a separate weather service, add `VITE_WEATHER_API_BASE`.
   - **Redeploy** after adding variables (Build → Redeploy).
5. Click **Deploy**. SPA routes (`/`, `/learn`, `/advise`) are handled by `vercel.json` rewrites.

**Why it didn’t connect before:** The app was hardcoded to `http://127.0.0.1:8000`. On Vercel the browser calls that URL on the *user’s* machine, not your server. Setting `VITE_API_BASE` to your real backend URL fixes it. Your backend must allow CORS from your Vercel domain (e.g. `https://your-app.vercel.app`).

**CLI:** Install Vercel CLI (`npm i -g vercel`), run `vercel` in the project root, and follow the prompts.
