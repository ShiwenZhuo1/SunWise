/**
 * config.js — API base URLs. Override via env at build time (e.g. Vercel).
 * VITE_* vars are exposed to the client by Vite.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
export const WEATHER_API_BASE = import.meta.env.VITE_WEATHER_API_BASE || 'http://127.0.0.1:8001'
