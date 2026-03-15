<!--
  HomeView.vue — Home page: local UV guidance, location picker, UV gauge, and optional city modal.
-->
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

      <article ref="resultCardRef" class="uv-hero-card" :class="{ empty: !hasLocationData }">
        <div class="uv-hero-main">
          <div class="gauge-zone">
            <p class="card-kicker label-with-icon">
              <span class="icon-chip" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="mini-icon"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" /></svg>
              </span>
              Current UV index
            </p>
            <div class="gauge-shell hero-gauge-shell">
              <div class="gauge-ring hero-gauge" :class="{ muted: !hasLocationData }">
                <div class="gauge-center hero-gauge-center">
                  <span class="gauge-label">UV Level</span>
                  <span class="gauge-value" :style="hasLocationData ? accentStyle : null">
                    {{ hasLocationData ? displayData.uvIndex : '-' }}
                  </span>
                </div>
              </div>
            </div>
            <p class="gauge-caption" v-if="!hasLocationData">Waiting for location access</p>
          </div>

          <div class="uv-hero-summary" :class="{ centered: !hasLocationData }">
            <p class="summary-title">
              {{ hasLocationData ? displayData.riskLabel + ' UV in your area' : 'See your local UV level' }}
            </p>
            <p class="summary-copy" v-if="hasLocationData">{{ displayData.riskMessage }}</p>
            <p class="summary-copy" v-else>
              Use your location or choose a city to load live UV data and protection guidance.
            </p>

            <div class="summary-grid" v-if="hasLocationData">
              <div class="summary-item location-item">
                <span class="summary-label label-with-icon">
                  <span class="icon-chip" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="mini-icon"><path d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  </span>
                  Current location
                </span>
                <span class="summary-value">{{ displayData.locationName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label label-with-icon">
                  <span class="icon-chip" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="mini-icon"><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>
                  </span>
                  Peak window
                </span>
                <span class="summary-value">{{ displayData.peakWindow }}</span>
              </div>
            </div>

            <div class="inline-guide" v-if="hasLocationData">
              <p class="inline-guide-kicker label-with-icon">
                <span class="icon-chip" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="mini-icon"><path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" /><path d="M9.5 12.5 11 14l3.5-3.5" /></svg>
                </span>
                Protection guide
              </p>
              <p class="inline-guide-title">What you should do now</p>
              <div class="protection-list">
                <div v-for="item in protectionItems" :key="item.label" class="protection-chip">
                  <span class="protection-icon" aria-hidden="true" v-html="item.icon"></span>
                  <span class="protection-chip-text">{{ item.label }}</span>
                </div>
              </div>
              <button class="guide-link" type="button" @click="goToAdvise">
                See detailed advice
              </button>
            </div>

            <div class="summary-actions">
              <div class="action-row">
                <button class="cta-button" type="button" :disabled="isLoading" @click="detectLocation">
                  <span class="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="mini-icon"><path d="M12 2v4M12 18v4M4 12h4M16 12h4" /><circle cx="12" cy="12" r="4" /></svg>
                  </span>
                  {{ isLoading ? 'Locating...' : hasLocationData ? 'Update location' : 'Use my location' }}
                </button>
                <button class="secondary-button" type="button" :disabled="isLoading" @click="toggleCityPicker">
                  <span class="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="mini-icon"><path d="M4 18h16M6 16V8l6-3 6 3v8" /><path d="M9 10h6" /></svg>
                  </span>
                  Choose city
                </button>
              </div>
              <p v-if="isLoading" class="status-text">
                {{ locationStatus }}
              </p>
            </div>
          </div>
        </div>
      </article>

      <div v-if="showCityPicker" class="city-modal-backdrop" @click="toggleCityPicker">
        <div class="city-modal" @click.stop>
          <div class="city-modal-header">
            <div>
              <h2 class="city-modal-title">Major Australian cities</h2>
            </div>
            <button class="city-close" type="button" aria-label="Close city picker" @click="toggleCityPicker">×</button>
          </div>
          <p class="city-modal-copy">Select a city to load its current UV index and risk guidance.</p>
          <div class="city-grid modal-grid">
            <button
              v-for="city in MAJOR_AUSTRALIAN_CITIES"
              :key="city.name"
              type="button"
              class="city-chip"
              :class="{ active: selectedCityName === city.name }"
              :disabled="isLoading"
              @click="selectCity(city)"
            >
              {{ city.name }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const SHARED_UV_STORAGE_KEY = 'sunwise-current-uv'
const FALLBACK_COORDS = { latitude: -37.8136, longitude: 144.9631 }
const FALLBACK_LOCATION = 'Melbourne, Australia'
const LOCATION_API_BASE = 'http://127.0.0.1:8000'
const WEATHER_API_BASE = 'http://127.0.0.1:8001'
const MAJOR_AUSTRALIAN_CITIES = [
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Brisbane', latitude: -27.4698, longitude: 153.0251 },
  { name: 'Perth', latitude: -31.9523, longitude: 115.8613 },
  { name: 'Adelaide', latitude: -34.9285, longitude: 138.6007 },
  { name: 'Canberra', latitude: -35.2809, longitude: 149.13 },
  { name: 'Hobart', latitude: -42.8821, longitude: 147.3272 },
  { name: 'Darwin', latitude: -12.4634, longitude: 130.8456 },
]

const isLoading = ref(false)
const coords = ref(null)
const locationStatus = ref('Use your location to get your local UV result.')
const homeData = ref(null)
const showCityPicker = ref(false)
const selectedCityName = ref('')
const resultCardRef = ref(null)
const router = useRouter()

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
    uvColour: 'Fallback',
  }
}

async function fetchReverseLocation(currentCoords) {
  const query = new URLSearchParams({
    latitude: String(currentCoords.latitude),
    longitude: String(currentCoords.longitude),
  })
  const response = await fetch(`${LOCATION_API_BASE}/location/reverse?${query.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to reverse geocode current location.')
  }

  return response.json()
}

async function fetchWeatherData(currentCoords) {
  const query = new URLSearchParams({
    latitude: String(currentCoords.latitude),
    longitude: String(currentCoords.longitude),
  })
  const response = await fetch(`${WEATHER_API_BASE}/weather/current?${query.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch current weather data.')
  }

  return response.json()
}

async function fetchUvSummary(uvIndex) {
  const query = new URLSearchParams({
    uv_index: String(uvIndex),
  })
  const response = await fetch(`${WEATHER_API_BASE}/uv?${query.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch UV summary.')
  }

  return response.json()
}

function parseLocationName(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const candidates = [
    payload,
    payload.data,
    payload.result,
    payload.results?.[0],
    payload.location,
    payload.address,
    payload.data?.address,
    payload.result?.address,
    payload.results?.[0]?.address,
  ].filter((item) => item && typeof item === 'object')

  for (const item of candidates) {
    const parts = [
      item.suburb,
      item.neighbourhood,
      item.city,
      item.town,
      item.village,
      item.municipality,
      item.county,
      item.state,
      item.country,
    ]
      .filter((part) => typeof part === 'string' && part.trim())
      .map((part) => part.trim())
      .filter((part) => part.toLowerCase() !== 'city')

    if (parts.length > 0) {
      return [...new Set(parts)].join(', ')
    }

    const directName =
      item.locationName ||
      item.formatted_address ||
      item.address ||
      item.name ||
      item.label ||
      item.display_name

    if (typeof directName === 'string' && directName.trim()) {
      return directName.trim()
    }
  }

  return ''
}

function mapUvColour(colour) {
  const normalized = String(colour || '').trim().toLowerCase()
  const colourMap = {
    green: '#65a30d',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#dc2626',
    purple: '#7c3aed',
  }

  return colourMap[normalized] || '#e11d48'
}

async function loadHomeData(currentCoords, fallbackLocationName = FALLBACK_LOCATION) {
  const reverseLocation = await fetchReverseLocation(currentCoords).catch(() => null)
  const locationName = parseLocationName(reverseLocation) || fallbackLocationName

  try {
    const weather = await fetchWeatherData(currentCoords)
    const uvIndex = Number(weather?.uv_index)

    if (!Number.isFinite(uvIndex)) {
      throw new Error('Weather API did not return a valid uv_index.')
    }

    const uvSummary = await fetchUvSummary(uvIndex)

    return {
      locationName,
      uvIndex,
      riskLabel: uvSummary?.level || getRiskLabel(uvIndex),
      riskMessage: uvSummary?.message || getRiskMessage(uvIndex),
      peakWindow: getPeakWindow(uvIndex),
      protectionAdvice: getProtectionAdvice(uvIndex),
      uvColour: uvSummary?.colour || 'Unknown',
    }
  } catch {
    return buildMockHomeData(currentCoords, locationName)
  }
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
    uvColour: '',
  }
)
const accentStyle = computed(() => ({
  color: mapUvColour(displayData.value.uvColour),
}))
const protectionItems = computed(() =>
  String(displayData.value.protectionAdvice || '')
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({
      label: item,
      icon: getProtectionIcon(item),
    }))
)

watch(
  homeData,
  (value) => {
    const uvIndex = Number(value?.uvIndex)

    if (Number.isFinite(uvIndex)) {
      localStorage.setItem(SHARED_UV_STORAGE_KEY, String(uvIndex))
    }
  },
  { deep: true }
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
        homeData.value = await loadHomeData(nextCoords, 'Current device location')
        selectedCityName.value = ''
        showCityPicker.value = false
        await scrollToResultCard()
        locationStatus.value =
          homeData.value.uvColour === 'Fallback'
            ? `Using location: ${homeData.value.locationName}. Live UV data was unavailable, so fallback UV guidance is shown.`
            : `Using location: ${homeData.value.locationName}`
      } catch {
        homeData.value = buildMockHomeData(nextCoords, 'Current device location')
        locationStatus.value = 'Location updated, but live UV data was unavailable. Showing fallback UV guidance.'
      } finally {
        isLoading.value = false
      }
    },
    async () => {
      coords.value = { ...FALLBACK_COORDS }
      homeData.value = buildMockHomeData(FALLBACK_COORDS, FALLBACK_LOCATION)
      locationStatus.value = 'Location access was unavailable. Showing Melbourne as a fallback after your request.'
      isLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function toggleCityPicker() {
  showCityPicker.value = !showCityPicker.value
}

async function selectCity(city) {
  isLoading.value = true
  locationStatus.value = `Loading UV for ${city.name}...`
  selectedCityName.value = city.name

  const nextCoords = {
    latitude: city.latitude,
    longitude: city.longitude,
  }

  coords.value = nextCoords

  try {
    homeData.value = await loadHomeData(nextCoords, city.name)
    showCityPicker.value = false
    await scrollToResultCard()
    locationStatus.value =
      homeData.value.uvColour === 'Fallback'
        ? `Using selected city: ${homeData.value.locationName}. Live UV data was unavailable, so fallback UV guidance is shown.`
        : `Using selected city: ${homeData.value.locationName}`
  } catch {
    homeData.value = buildMockHomeData(nextCoords, city.name)
    showCityPicker.value = false
    locationStatus.value = `Using selected city: ${city.name}. Live UV data was unavailable, so fallback UV guidance is shown.`
  } finally {
    isLoading.value = false
  }
}

async function scrollToResultCard() {
  await nextTick()

  if (!resultCardRef.value) {
    return
  }

  const top = resultCardRef.value.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  })
}

function goToAdvise() {
  router.push('/advise')
}

function getProtectionIcon(item) {
  const normalized = item.toLowerCase()

  if (normalized.includes('hat')) {
    return '<svg viewBox="0 0 24 24" class="mini-icon"><path d="M7 12a5 5 0 0 1 10 0" /><path d="M3 13h18" /><path d="M8 13v1a4 4 0 0 0 8 0v-1" /></svg>'
  }

  if (normalized.includes('spf') || normalized.includes('sunscreen')) {
    return '<svg viewBox="0 0 24 24" class="mini-icon"><path d="M9 4h6" /><path d="M10 4v3" /><path d="M14 4v3" /><rect x="8" y="7" width="8" height="13" rx="2" /><path d="M10 11h4" /></svg>'
  }

  if (normalized.includes('shade')) {
    return '<svg viewBox="0 0 24 24" class="mini-icon"><path d="M12 3v9" /><path d="M5 12a7 7 0 0 1 14 0Z" /><path d="M12 12v9" /></svg>'
  }

  if (normalized.includes('sleeves') || normalized.includes('clothing')) {
    return '<svg viewBox="0 0 24 24" class="mini-icon"><path d="m9 5 3-2 3 2 3 3-2 3-2-1v10H10V10l-2 1-2-3 3-3Z" /></svg>'
  }

  return '<svg viewBox="0 0 24 24" class="mini-icon"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></svg>'
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
  overflow-x: hidden;
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

.label-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-chip {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  color: #7c2d12;
  flex: 0 0 auto;
}

.mini-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
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
  opacity: 0.34;
  transform: scale(0.88);
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

.summary-title {
  margin: 0;
  font-size: clamp(1.45rem, 2.2vw, 2.05rem);
  font-weight: 800;
  color: #7c2d12;
  line-height: 1.08;
}

.summary-copy {
  margin: 0;
  color: #4b5563;
  line-height: 1.48;
  font-size: 0.98rem;
  max-width: 620px;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
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

.location-item {
  background: rgba(255, 255, 255, 0.8);
}

.inline-guide {
  width: 100%;
  display: grid;
  gap: 8px;
  margin-top: 4px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(255, 255, 255, 0.72));
  border: 1px solid rgba(249, 115, 22, 0.12);
}

.inline-guide-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: #6b7280;
}

.inline-guide-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #7c2d12;
}

.protection-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.protection-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(249, 115, 22, 0.12);
}

.protection-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(251, 113, 133, 0.12));
  color: #9a3412;
  flex: 0 0 auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.protection-chip-text {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.1;
}

.protection-icon :deep(.mini-icon) {
  width: 18px;
  height: 18px;
  stroke-width: 1.7;
}

.guide-link {
  margin-top: 4px;
  justify-self: start;
  border: none;
  background: transparent;
  color: #7c2d12;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.guide-link:hover {
  color: #9a3412;
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
  overflow-wrap: anywhere;
}

.summary-actions {
  margin-top: 6px;
  display: grid;
  gap: 8px;
  justify-items: center;
  width: 100%;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.cta-button {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.secondary-button {
  border: 1px solid rgba(124, 45, 18, 0.18);
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.78);
  color: #7c2d12;
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
  padding: 14px 22px;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.secondary-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.92);
}

.secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.city-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(10px);
}

.city-modal {
  width: min(560px, 100%);
  max-height: min(720px, calc(100vh - 48px));
  overflow-y: auto;
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 252, 248, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
}

.city-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.city-modal-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.68rem;
  color: #6b7280;
}

.city-modal-title {
  margin: 6px 0 0;
  font-size: 1.5rem;
  line-height: 1.1;
  color: #7c2d12;
}

.city-modal-copy {
  margin: 0;
  color: #5b6473;
  font-size: 0.96rem;
  line-height: 1.45;
}

.city-close {
  border: 1px solid rgba(124, 45, 18, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  color: #7c2d12;
  font-weight: 700;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.modal-grid {
  gap: 12px;
}

  .city-chip {
    border: none;
    border-radius: 14px;
  cursor: pointer;
  padding: 10px 12px;
  background: rgba(249, 115, 22, 0.08);
  color: #7c2d12;
  font-weight: 700;
  font-size: 0.98rem;
  border: 1px solid transparent;
  transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.city-chip:hover {
  background: rgba(249, 115, 22, 0.16);
  transform: translateY(-1px);
}

  .city-chip.active {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(251, 113, 133, 0.18));
    border-color: rgba(249, 115, 22, 0.28);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.12);
}

.city-chip:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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
  max-width: 520px;
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
  .uv-hero-main {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .gauge-zone {
    order: 1;
  }

  .uv-hero-summary {
    order: 2;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 0 14px 28px;
  }

  .hero {
    padding-top: 14px;
  }

  .hero-intro,
  .uv-hero-card,
  .advice-panel {
    border-radius: 24px;
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-intro h1 {
    font-size: clamp(2rem, 8vw, 2.8rem);
  }

  .hero-text {
    font-size: 0.96rem;
  }

  .gauge-ring {
    width: 220px;
    height: 220px;
  }

  .gauge-center {
    width: 122px;
    height: 122px;
  }

  .gauge-value {
    font-size: 3.8rem;
  }

  .summary-title {
    font-size: clamp(1.35rem, 6.2vw, 1.9rem);
  }

  .summary-copy {
    font-size: 0.94rem;
  }

  .summary-grid,
  .meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .action-row {
    display: grid;
    width: 100%;
  }

  .cta-button,
  .secondary-button {
    width: 100%;
  }

  .city-modal-backdrop {
    padding: 16px;
  }

  .city-modal {
    padding: 18px;
    max-height: calc(100vh - 32px);
  }

  .city-modal-header {
    grid-template-columns: minmax(0, 1fr);
    display: grid;
  }

  .city-close {
    justify-self: start;
  }

  .city-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .inline-guide {
    padding: 16px;
  }

  .inline-guide-title {
    font-size: 1rem;
  }

  .inline-guide-text {
    font-size: 1.35rem;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 0 10px 22px;
  }

  .hero {
    gap: 12px;
    padding-top: 10px;
  }

  .hero-intro,
  .uv-hero-card {
    padding-left: 14px;
    padding-right: 14px;
  }

  .card-kicker,
  .summary-label,
  .inline-guide-kicker {
    letter-spacing: 0.1em;
    font-size: 0.66rem;
  }

  .gauge-ring {
    width: 186px;
    height: 186px;
  }

  .gauge-center {
    width: 106px;
    height: 106px;
  }

  .gauge-label {
    font-size: 0.8rem;
  }

  .gauge-value {
    font-size: 3.1rem;
  }

  .summary-title {
    font-size: 1.55rem;
  }

  .summary-copy {
    font-size: 0.9rem;
  }

  .summary-item {
    padding: 14px;
  }

  .protection-list {
    gap: 8px;
  }

  .protection-chip {
    width: 100%;
  }

  .protection-chip-text {
    font-size: 1rem;
  }

  .cta-button,
  .secondary-button {
    padding: 13px 18px;
    font-size: 0.76rem;
  }

  .status-text {
    font-size: 0.86rem;
  }
}
</style>
