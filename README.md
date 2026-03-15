# SunWise Frontend

Vue 3 + Vite frontend for the SunWise (SunSmart) project: UV awareness, sun protection advice, and skin cancer–related information.

## Requirements

- Node.js 18+ (LTS recommended)
- npm 9+ (or yarn / pnpm)

## Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd SunWise
```

### 2. Install dependencies

```bash
npm install
```

## Configuration

The app talks to a backend API for charts and chat. By default it uses `http://127.0.0.1:8000`.

If your backend runs on a different host or port (e.g. the SunSmart backend on port **8001**), set the base URL in these components:

| Component            | File path                      | Variable   |
|----------------------|--------------------------------|------------|
| Chat                 | `src/components/ChatWidget.vue`  | `API_BASE` |
| Heat chart           | `src/components/HeatChart.vue`   | `API_BASE` |
| Skin cancer chart    | `src/components/SkinCancerChart.vue` | `API_BASE` |

Example (port 8001):

```js
const API_BASE = 'http://127.0.0.1:8001'
```

### CORS

If the backend is on another port (e.g. 8001), ensure it allows requests from the frontend origin (e.g. `http://localhost:5173`). Alternatively, use Vite’s proxy in `vite.config.js`:

```js
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

Then in the frontend you can use `API_BASE = ''` and request paths like `/api/chat`, `/api/db/one_percent_heat`, etc., and Vite will proxy them to the backend.

## Running the app

Start the development server:

```bash
npm run dev
```

The app will be available at:

- http://localhost:5173 (or the port printed in the terminal)

Other commands:

- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`

## Project structure

```
src/
├── App.vue              # Root layout, top bar, nav, chat widget
├── main.js              # App entry, router
├── router.js            # Routes: /, /learn, /advise
├── style.css            # Global styles
├── components/          # Reusable components
│   ├── ChatWidget.vue   # Floating chat (POST /chat)
│   ├── HeatChart.vue    # One percent heat line chart
│   └── SkinCancerChart.vue  # Skin cancer incidence line chart
└── views/
    ├── HomeView.vue     # Home page
    ├── LearnView.vue    # Carousel + chart toggles
    └── AdviseView.vue   # UV selector, sunscreen, clothing advice
```

## Routes and features

| Route     | Page  | Description |
|-----------|-------|-------------|
| `/`       | Home  | Landing placeholder. |
| `/learn`  | Learn | Carousel with external links and background images. Two buttons: **Skin cancer impact** (incidence by sex, year range) and **Heat & UV exposure trend** (one percent heat days per year, year range). Click a button to show its chart; click again to hide it. |
| `/advise` | Advise | UV level selector (1–11), sunscreen recommendation (image + grams), clothing advice from `uvAdviceMap`, and a Clothing recommendation block (image + list + risk level). |

**Global:** Floating chat button (bottom-right). Opens a panel; user questions are sent to the backend `POST /chat` and the answer is shown.

## Backend endpoints used

The frontend expects these endpoints (default base URL `http://127.0.0.1:8000`):

| Method | Path                   | Purpose |
|--------|------------------------|---------|
| `GET`  | `/db/one_percent_heat` | Data for the heat chart: `{ "data": [ { "Year", "NumberofDays" }, ... ] }`. |
| `GET`  | `/db/skin_cancer`      | Data for the skin cancer chart (Year, Sex, age group, incidence rate, etc.). |
| `POST` | `/chat`                | Chat: body `{ "question": "string" }`, response `{ "answer": "string", ... }`. |

If you use the SunSmart backend, it runs on port **8001** by default; set `API_BASE` (or proxy) accordingly.

## Static assets

Place images in `public/image/`. The app references at least:

- `clothing.png` — Advise page, clothing block.
- `AustraliaUV.png` — Learn carousel slide 1.
- `skincancer.png` — Learn carousel slide 2.
- `Dailyprotection.png` — Learn carousel slide 3.
- `uvindex.png`, `sunprotection.png` — Advise sunscreen block.

Paths in code are like `/image/clothing.png` (no `public/` in the path).

## Troubleshooting

### Charts or chat do not load

- Confirm the backend is running (e.g. `http://127.0.0.1:8001`).
- Check `API_BASE` in `ChatWidget.vue`, `HeatChart.vue`, and `SkinCancerChart.vue` (and that the port matches the backend).
- Open the browser dev tools (Network tab) and see if requests to the API fail (CORS, 404, 5xx).

### CORS errors when calling the API

- Enable CORS on the backend for the frontend origin (e.g. `http://localhost:5173`), or
- Use the Vite proxy (see **Configuration → CORS** above) and call the API via relative paths (e.g. `/api/chat`).

### Images not showing

- Ensure files exist under `public/image/` with the names used in the app (e.g. `clothing.png`).
- Use paths starting with `/image/...` (e.g. `src="/image/clothing.png"`).

### Port 5173 already in use

Start dev server on another port:

```bash
npm run dev -- --port 5174
```

### Build fails

- Run `npm install` and try again.
- Use a supported Node version (18+). Check with `node -v`.

## Deploy to Vercel (and connect to production backend)

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com). Build and output are auto-detected (Vite → `dist`).
2. **Set environment variable** so the frontend calls your deployed backend:
   - In Vercel: **Project → Settings → Environment Variables**
   - Add: **Name** `VITE_API_BASE`, **Value** `https://sunsmart-backend-production.up.railway.app` (no trailing slash).
   - Optional: if you use a separate weather API, add `VITE_WEATHER_API_BASE`.
3. **Redeploy** after saving the variable (Deployments → … → Redeploy). Vite bakes `VITE_*` at build time, so a new build is required.
4. **CORS:** The backend must allow the frontend origin. For the Vercel app that is `https://sun-wise-ruby.vercel.app`. If the backend does not send `Access-Control-Allow-Origin` for that origin, the browser will block requests. See **[docs/BACKEND_CORS.md](docs/BACKEND_CORS.md)** for a FastAPI CORS example (add `CORSMiddleware` and allow `https://sun-wise-ruby.vercel.app`). After changing the backend, redeploy it (e.g. on Railway).
