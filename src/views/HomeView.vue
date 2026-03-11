<template>
  <section class="page home">
    <section class="hero">
      <div class="hero-copy">
        <p class="hero-label">UV protection guidance</p>
        <h1>Stay Sun-Safe Today</h1>
        <p class="hero-text">Real-time UV alerts and protection guidance</p>
      </div>

      <div class="hero-art" aria-hidden="true">
        <img :src="heroImage" alt="" class="hero-image" />
      </div>

      <div class="hero-actions">
        <button class="cta-button" type="button" :disabled="isLoading" @click="detectLocation">
          {{ isLoading ? 'Locating...' : 'Use my location' }}
        </button>
        <p class="status-text">{{ locationStatus }}</p>
      </div>
    </section>

    <section class="dashboard">
      <article class="uv-card">
        <p class="panel-kicker">UV index</p>
        <div class="gauge-shell">
          <div class="gauge-ring">
            <div class="gauge-center">
              <span class="gauge-label">UV Level</span>
              <span class="gauge-value">{{ homeData.uvIndex }}</span>
            </div>
          </div>
        </div>
        <div class="location-block">
          <p class="location-label">Current location</p>
          <p class="location-value">{{ homeData.locationName }}</p>
          <p class="location-coords">{{ coordsText }}</p>
        </div>
        <button class="secondary-button" type="button" :disabled="isLoading" @click="detectLocation">
          {{ isLoading ? 'Updating...' : 'Change location' }}
        </button>
      </article>

      <article class="risk-panel">
        <p class="risk-kicker">Today's risk</p>
        <div class="risk-header">
          <div class="sun-badge" aria-hidden="true">
            <span class="sun-core"></span>
          </div>
          <div>
            <p class="risk-title">{{ homeData.riskLabel }}</p>
            <p class="risk-subtitle">UV level at {{ homeData.uvIndex }}</p>
          </div>
        </div>
        <p class="risk-message">{{ homeData.riskMessage }}</p>
        <div class="meta-grid">
          <div class="meta-card">
            <span class="meta-label">Peak window</span>
            <span class="meta-value">{{ homeData.peakWindow }}</span>
          </div>
          <div class="meta-card">
            <span class="meta-label">Protection</span>
            <span class="meta-value">{{ homeData.protectionAdvice }}</span>
          </div>
        </div>
        <button class="ghost-button" type="button" @click="scrollToAdvice">
          What should I wear?
        </button>
        <p class="more-link">See more advice below</p>
      </article>
    </section>

    <section id="home-advice" class="advice-strip">
      <article class="advice-card">
        <p class="advice-title">Quick sun-safe checklist</p>
        <ul class="advice-list">
          <li>Apply broad-spectrum sunscreen before outdoor activity.</li>
          <li>Wear a hat, sunglasses, and breathable long sleeves when risk is high.</li>
          <li>Plan direct sun exposure outside the peak UV window when possible.</li>
        </ul>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import heroImage from '../assets/1.png'

const FALLBACK_COORDS = { latitude: -37.8136, longitude: 144.9631 }
const FALLBACK_LOCATION = 'Melbourne, Australia'
const API_BASE_URL = '/api/home-data'
const USE_BACKEND_API = false

const isLoading = ref(false)
const coords = ref({ ...FALLBACK_COORDS })
const locationStatus = ref('Location ready. Tap to use your current position.')
const homeData = ref(buildMockHomeData(FALLBACK_COORDS, FALLBACK_LOCATION))

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

const coordsText = computed(
  () => `${coords.value.latitude.toFixed(2)}, ${coords.value.longitude.toFixed(2)}`
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
      locationStatus.value = 'Location access was unavailable. Showing Melbourne as a fallback.'
      isLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function scrollToAdvice() {
  document.getElementById('home-advice')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 32px 6vw 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero {
  border-radius: 32px;
  padding: 28px 28px 34px;
  background: linear-gradient(180deg, #25004d 0%, #1b003a 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  gap: 8px;
  overflow: hidden;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(251, 113, 133, 0.08), transparent 60%);
  pointer-events: none;
}

.hero-copy {
  text-align: center;
  max-width: 620px;
  position: relative;
  z-index: 1;
}

.hero-label {
  margin: 0 0 10px;
  color: #f8c7d8;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.76rem;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.3rem, 4.6vw, 3.5rem);
  line-height: 1.05;
  font-weight: 800;
  color: #ffffff;
}

.hero-text {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1rem;
}

.hero-art {
  width: min(1120px, 100%);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.hero-image {
  display: block;
  width: min(980px, 100%);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 26px 38px rgba(251, 113, 133, 0.16));
}

.hero-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.cta-button,
.secondary-button,
.ghost-button {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.cta-button,
.secondary-button {
  background: linear-gradient(135deg, #f97316, #fb7185);
  color: #1f2937;
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.35);
}

.cta-button {
  padding: 14px 28px;
  text-transform: uppercase;
  font-size: 0.82rem;
}

.secondary-button {
  padding: 12px 22px;
  text-transform: uppercase;
  font-size: 0.74rem;
  align-self: flex-start;
}

.ghost-button {
  padding: 12px 18px;
  background: #2e1065;
  color: #ffffff;
  width: fit-content;
}

.cta-button:hover,
.secondary-button:hover,
.ghost-button:hover {
  transform: translateY(-1px);
}

.cta-button:disabled,
.secondary-button:disabled,
.ghost-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.status-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92rem;
  text-align: center;
}

.dashboard {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 32px;
  padding: 28px;
  color: #1f2937;
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
  gap: 28px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.32);
}

.uv-card {
  background: #22004a;
  color: #ffffff;
  border-radius: 30px;
  padding: 28px 28px 26px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.panel-kicker,
.risk-kicker,
.advice-title {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.panel-kicker {
  font-size: clamp(2rem, 5vw, 3rem);
}

.gauge-shell {
  display: flex;
  justify-content: center;
}

.gauge-ring {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background:
    conic-gradient(
      #b10000 0deg 90deg,
      #a5d66a 90deg 180deg,
      #f2c94c 180deg 270deg,
      #f97316 270deg 360deg
    );
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-center {
  width: 126px;
  height: 126px;
  border-radius: 50%;
  background: #22004a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-label {
  font-size: 0.84rem;
  font-weight: 700;
}

.gauge-value {
  font-size: 4rem;
  line-height: 1;
  color: #e11d48;
  font-weight: 900;
}

.location-block {
  display: grid;
  gap: 4px;
}

.location-label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #c4b5fd;
}

.location-value,
.location-coords,
.risk-title,
.risk-subtitle,
.risk-message,
.more-link {
  margin: 0;
}

.location-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.location-coords {
  color: rgba(255, 255, 255, 0.72);
}

.risk-panel {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 30px;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.1);
}

.risk-kicker {
  color: #6b7280;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
}

.risk-header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.sun-badge {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #ef233c;
  position: relative;
  flex-shrink: 0;
}

.sun-badge::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 8px solid #facc15;
}

.sun-badge::after {
  content: '';
  position: absolute;
  inset: -6px;
  background:
    conic-gradient(
      transparent 0deg 15deg,
      #facc15 15deg 30deg,
      transparent 30deg 45deg,
      #facc15 45deg 60deg,
      transparent 60deg 75deg,
      #facc15 75deg 90deg,
      transparent 90deg 105deg,
      #facc15 105deg 120deg,
      transparent 120deg 135deg,
      #facc15 135deg 150deg,
      transparent 150deg 165deg,
      #facc15 165deg 180deg,
      transparent 180deg 195deg,
      #facc15 195deg 210deg,
      transparent 210deg 225deg,
      #facc15 225deg 240deg,
      transparent 240deg 255deg,
      #facc15 255deg 270deg,
      transparent 270deg 285deg,
      #facc15 285deg 300deg,
      transparent 300deg 315deg,
      #facc15 315deg 330deg,
      transparent 330deg 345deg,
      #facc15 345deg 360deg
    );
  -webkit-mask: radial-gradient(circle, transparent 50px, #000 51px);
  mask: radial-gradient(circle, transparent 50px, #000 51px);
}

.sun-core {
  position: absolute;
  inset: 30px;
  border-radius: 50%;
  background: #facc15;
}

.risk-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  color: #c2410c;
  text-transform: uppercase;
  line-height: 1;
}

.risk-subtitle {
  margin-top: 6px;
  font-size: clamp(1.1rem, 3vw, 2rem);
  font-weight: 800;
  color: #c2410c;
  text-transform: uppercase;
}

.risk-message {
  font-size: 1rem;
  color: #4b5563;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.meta-card {
  border-radius: 18px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
  font-size: 0.76rem;
}

.meta-value {
  font-weight: 800;
  color: #1f2937;
}

.more-link {
  color: #6b7280;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
}

.advice-strip {
  display: grid;
}

.advice-card {
  border-radius: 28px;
  padding: 24px 26px;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.75);
}

.advice-title {
  font-size: 1.1rem;
  margin-bottom: 14px;
}

.advice-list {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  color: rgba(255, 255, 255, 0.86);
}

@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
  }

  .uv-card {
    max-width: 460px;
  }

  .hero-image {
    width: min(860px, 100%);
  }
}

@media (max-width: 768px) {
  .page {
    padding-inline: 16px;
  }

  .hero {
    padding: 24px 18px 28px;
  }

  .hero-copy h1 {
    font-size: clamp(1.9rem, 8vw, 2.6rem);
  }

  .dashboard {
    padding: 18px;
  }

  .uv-card {
    padding: 24px 18px 22px;
  }

  .gauge-ring {
    width: 210px;
    height: 210px;
  }

  .gauge-center {
    width: 112px;
    height: 112px;
  }

  .risk-header {
    display: grid;
    align-items: start;
  }

  .meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
