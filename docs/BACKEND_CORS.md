# Backend CORS configuration

The frontend is deployed at **https://sun-wise-ruby.vercel.app**. The backend must allow this origin, or the browser will block API requests with:

```text
blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## FastAPI example

Add CORS middleware and allow your Vercel frontend origin:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow the Vercel frontend origin (add others if needed, e.g. http://localhost:5173 for local dev)
origins = [
    "https://sun-wise-ruby.vercel.app",
    "http://localhost:5173",  # optional: local Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... your routes (e.g. /chat, /db/skin_cancer, /db/one_percent_heat, /location/reverse, etc.)
```

After changing the backend, redeploy it (e.g. on Railway) so the new CORS headers are active.
