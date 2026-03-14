<template>
  <section class="page home">
    <video class="page-video" autoplay muted loop playsinline>
      <source src="/home.mp4" type="video/mp4" />
    </video>
    <div class="page-overlay"></div>

    <section class="hero content-layer">
      <div class="hero-intro">
        <p class="hero-label">Local UV protection guidance</p>
        <h1>Stay Sun-Safe Today</h1>
        <p class="hero-text">
          Share your location to instantly check the UV index and see what protection you need
          before heading outside.
        </p>
      </div>

      <article class="uv-hero-card" :class="{ empty: !hasLocationData }">
        <div class="uv-hero-main">
          <div class="gauge-zone">
            <p class="card-kicker">Current UV index</p>
            <div class="gauge-shell hero-gauge-shell">
              <div class="gauge-ring hero-gauge" :class="{ muted: !hasLocationData }">
                <div class="gauge-center hero-gauge-center">
                  <span class="gauge-label">UV Level</span>
                  <span class="gauge-value">{{ hasLocationData ? displayData.uvIndex : '-' }}</span>
                </div>
              </div>
            </div>
            <p class="gauge-caption" v-if="hasLocationData">{{ displayData.locationName }}</p>
            <p class="gauge-caption" v-else>Waiting for location access</p>
          </div>

          <div class="uv-hero-summary" :class="{ centered: !hasLocationData }">
            <p class="summary-kicker">{{ hasLocationData ? 'Current result' : 'Get started' }}</p>
            <p class="summary-title">
              {{ hasLocationData ? displayData.riskLabel + ' UV in your area' : 'Enable location to view your local UV level' }}
            </p>
            <p class="summary-copy" v-if="hasLocationData">{{ displayData.riskMessage }}</p>
            <p class="summary-copy" v-else>
              Share your location once and SunWise will show your UV level, risk summary, and protection advice here.
            </p>

            <div class="summary-grid" v-if="hasLocationData">
              <div class="summary-item">
                <span class="summary-label">Peak window</span>
                <span class="summary-value">{{ displayData.peakWindow }}</span>
              </div>
              <div class="summary-item accent">
                <span class="summary-label">Protection</span>
                <span class="summary-value">{{ displayData.protectionAdvice }}</span>
              </div>
            </div>

            <div class="summary-actions">
              <button class="cta-button" type="button" :disabled="isLoading" @click="detectLocation">
                {{ isLoading ? 'Locating...' : hasLocationData ? 'Update location' : 'Use my location' }}
              </button>
              <p class="status-text">{{ locationStatus }}</p>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="details-grid content-layer">
      <article class="advice-panel">
        <p class="card-kicker centered">Protection guide</p>
        <template v-if="hasLocationData">
          <div class="advice-highlight">
            <p class="advice-title">What you should do now</p>
            <p class="advice-text">{{ displayData.protectionAdvice }}</p>
          </div>
          <div class="meta-grid">
            <div class="meta-card">
              <span class="meta-label">Risk level</span>
              <span class="meta-value">{{ displayData.riskLabel }}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Peak window</span>
              <span class="meta-value">{{ displayData.peakWindow }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="advice-highlight empty-block">
            <p class="advice-title">Protection advice will appear here</p>
            <p class="advice-text muted-text">
              Share your location first to get personalised UV guidance.
            </p>
          </div>
        </template>
      </article>

      <article class="advice-panel checklist-panel">
        <p class="card-kicker centered">Quick checklist</p>
        <div class="checklist-block">
          <ul class="advice-list">
            <li>Apply broad-spectrum sunscreen before outdoor activity.</li>
            <li>Wear a hat, sunglasses, and breathable long sleeves when risk is high.</li>
            <li>Plan direct sun exposure outside the peak UV window when possible.</li>
          </ul>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const FALLBACK_COORDS = { latitude: -37.8136, longitude: 144.9631 }
const FALLBACK_LOCATION = 'Melbourne, Australia'
const API_BASE_URL = '/api/home-data'
const USE_BACKEND_API = false

const isLoading = ref(false)
const coords = ref(null)
const locationStatus = ref('Use your location to get your local UV result.')
const homeData = ref(null)

function getRiskLabel(uvIndex) {
  if (uvIndex <= 2) return 'Low'
  if (uvIndex <= 5) return 'Moderate'
  if (uvIndex <= 7) return 'High'
  if (uvIndex <= 10) return 'Very High'
  return 'Extreme'
}

function getRiskMessage(uvIndex) {
  if (uvIndex <= 2) return 'Low risk today. Sunglasses and basic sunscreen are usually enough.'
  if (uvIndex <= 5) return 'Sun damage is possible. Reapply sunscreen and cover up if you stay out.'
  if (uvIndex <= 7) return 'High UV. Limit midday exposure and bring protective clothing.'
  if (uvIndex <= 10) return 'Skin may be damaged within minutes. Full protection is strongly advised.'
  return 'Extreme UV. Avoid direct sun exposure during peak hours if possible.'
}

function getPeakWindow(uvIndex) {
  if (uvIndex <= 2) return '11 AM - 1 PM'
  if (uvIndex <= 5) return '10 AM - 2 PM'
  if (uvIndex <= 7) return '10 AM - 3 PM'
  return '9 AM - 4 PM'
}

function getProtectionAdvice(uvIndex) {
  if (uvIndex <= 2) return 'SPF 30+'
  if (uvIndex <= 5) return 'Hat + SPF 30+'
  if (uvIndex <= 7) return 'Sleeves + SPF 50+'
  return 'Shade + SPF 50+'
}

function estimateUv(latitude) {
  const hour = new Date().getHours()
  const daytimeFactor = Math.max(0, 1 - Math.abs(hour - 13) / 7)
  const latitudeFactor = Math.max(0.55, 1.15 - Math.abs(latitude) / 120)
  return Math.max(1, Math.min(11, Math.round(daytimeFactor * latitudeFactor * 11)))
}

function buildMockHomeData(currentCoords, locationName) {
  const uvIndex = estimateUv(currentCoords.latitude)

  return {
    locationName,
    uvIndex,
    riskLabel: getRiskLabel(uvIndex),
    riskMessage: getRiskMessage(uvIndex),
    peakWindow: getPeakWindow(uvIndex),
    protectionAdvice: getProtectionAdvice(uvIndex),
  }
}

async function fetchHomeDataFromApi(currentCoords) {
  const query = new URLSearchParams({
    lat: String(currentCoords.latitude),
    lng: String(currentCoords.longitude),
  })
  const response = await fetch(`${API_BASE_URL}?${query.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch home data from backend.')
  }

  return response.json()
}

async function loadHomeData(currentCoords, fallbackLocationName = FALLBACK_LOCATION) {
  if (USE_BACKEND_API) {
    return fetchHomeDataFromApi(currentCoords)
  }

  return buildMockHomeData(currentCoords, fallbackLocationName)
}

const hasLocationData = computed(() => homeData.value !== null)
const displayData = computed(() =>
  homeData.value ?? {
    locationName: '',
    uvIndex: '-',
    riskLabel: '',
    riskMessage: '',
    peakWindow: '',
    protectionAdvice: '',
  }
)

async function detectLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = 'Geolocation is not supported in this browser.'
    return
  }

  isLoading.value = true
  locationStatus.value = 'Detecting your location...'

  navigator.geolocation.getCurrentPosition(
    async ({ coords: position }) => {
      const nextCoords = {
        latitude: position.latitude,
        longitude: position.longitude,
      }

      coords.value = nextCoords

      try {
        const nextHomeData = await loadHomeData(nextCoords, 'Current device location')
        homeData.value = {
          ...nextHomeData,
          locationName: nextHomeData.locationName || 'Current device location',
        }
        locationStatus.value = USE_BACKEND_API
          ? 'Location updated from your device and synced with backend data.'
          : 'Location updated from your device. UV data is currently using local mock logic.'
      } catch {
        homeData.value = buildMockHomeData(nextCoords, 'Current device location')
        locationStatus.value = 'Location updated, but backend data was unavailable. Showing local mock data.'
      } finally {
        isLoading.value = false
      }
    },
    async () => {
      coords.value = { ...FALLBACK_COORDS }
      homeData.value = await loadHomeData(FALLBACK_COORDS, FALLBACK_LOCATION)
      locationStatus.value = 'Location access was unavailable. Showing Melbourne as a fallback after your request.'
      isLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}
</script>

<style scoped>
.page {
  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -16px;
  padding: 0 6vw 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow: hidden;
}

.page-video,
.page-overlay {
  position: absolute;
  inset: 0;
}

.page-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-overlay {
  background:
    linear-gradient(180deg, rgba(255, 245, 236, 0.28), rgba(25, 20, 39, 0.38)),
    linear-gradient(135deg, rgba(251, 146, 60, 0.16), rgba(236, 72, 153, 0.12));
}

.content-layer {
  position: relative;
  z-index: 1;
}

.hero {
  display: grid;
  gap: 16px;
  padding-top: 20px;
}

.hero-intro,
.uv-hero-card,
.advice-panel {
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(12px);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.2);
}

.hero-intro {
  padding: 26px 30px;
  background: linear-gradient(135deg, rgba(255, 250, 244, 0.84), rgba(255, 255, 255, 0.72));
  text-align: center;
}

.hero-label,
.card-kicker,
.summary-kicker {
  margin: 0 0 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.76rem;
  font-weight: 700;
}

.hero-label {
  color: #c2410c;
}

.hero-intro h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.6rem);
  line-height: 1.02;
  color: #1f1630;
}

.hero-text {
  margin: 14px auto 0;
  max-width: 720px;
  color: #4b5563;
  font-size: 1.02rem;
}

.uv-hero-card {
  padding: 24px 26px 26px;
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.94), rgba(255, 255, 255, 0.88));
}

.uv-hero-card.empty {
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.9), rgba(255, 255, 255, 0.84));
}

.uv-hero-main {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}

.gauge-zone {
  display: grid;
  gap: 12px;
  justify-items: center;
}

.card-kicker {
  color: #6b7280;
  text-align: center;
}

.gauge-caption {
  margin: 0;
  text-align: center;
  font-weight: 700;
  color: #5b6473;
  min-height: 1.5em;
}

.hero-gauge-shell {
  justify-content: center;
}

.gauge-ring {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: conic-gradient(#b10000 0deg 90deg, #a5d66a 90deg 180deg, #f2c94c 180deg 270deg, #f97316 270deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-ring.muted {
  filter: grayscale(0.5) saturate(0.7) brightness(1.02);
  opacity: 0.46;
  transform: scale(0.92);
}

.gauge-center {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #22004a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.gauge-value {
  font-size: 4.8rem;
  line-height: 1;
  color: #e11d48;
  font-weight: 900;
}

.uv-hero-summary {
  display: grid;
  gap: 10px;
}

.uv-hero-summary.centered {
  justify-items: center;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.summary-kicker {
  color: #6b7280;
}

.summary-title {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
  font-weight: 800;
  color: #7c2d12;
  line-height: 1.08;
}

.summary-copy {
  margin: 0;
  color: #4b5563;
  line-height: 1.55;
  font-size: 1rem;
  max-width: 760px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
  width: 100%;
}

.summary-item,
.meta-card,
.advice-highlight,
.checklist-block {
  border-radius: 20px;
  padding: 16px 18px;
}

.summary-item {
  display: grid;
  gap: 6px;
  background: rgba(255, 255, 255, 0.72);
}

.summary-item.accent {
  background: rgba(249, 115, 22, 0.14);
}

.summary-label,
.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: #6b7280;
}

.summary-value,
.meta-value {
  font-weight: 800;
  color: #1f2937;
}

.summary-actions {
  margin-top: 8px;
  display: grid;
  gap: 8px;
  justify-items: center;
}

.cta-button {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, #f97316, #fb7185);
  color: #1f2937;
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.22);
  transition: transform 0.2s ease, opacity 0.2s ease;
  padding: 14px 28px;
  text-transform: uppercase;
  font-size: 0.82rem;
}

.cta-button:hover {
  transform: translateY(-1px);
}

.cta-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.status-text {
  margin: 0;
  color: #5b6473;
  font-size: 0.92rem;
  text-align: center;
  max-width: 420px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.advice-panel {
  padding: 24px 26px;
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.92), rgba(255, 255, 255, 0.84));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.centered {
  text-align: center;
}

.advice-highlight {
  background: rgba(249, 115, 22, 0.1);
}

.empty-block {
  text-align: center;
}

.advice-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #7c2d12;
}

.advice-text,
.muted-text {
  margin: 8px 0 0;
  color: #374151;
  line-height: 1.5;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-panel {
  justify-content: flex-start;
}

.checklist-block {
  background: rgba(255, 255, 255, 0.72);
}

.advice-list {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  color: #374151;
}

@media (max-width: 1024px) {
  .uv-hero-main,
  .details-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .page {
    padding-inline: 16px;
  }

  .hero-intro,
  .uv-hero-card,
  .advice-panel {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-intro h1 {
    font-size: clamp(2rem, 8vw, 2.8rem);
  }

  .gauge-ring {
    width: 230px;
    height: 230px;
  }

  .gauge-center {
    width: 126px;
    height: 126px;
  }

  .gauge-value {
    font-size: 4rem;
  }

  .summary-grid,
  .meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .cta-button {
    width: 100%;
  }
}
</style>
