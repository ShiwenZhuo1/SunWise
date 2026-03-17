<!--
  AdviseView.vue — Advise page: UV selector, sunscreen recommendation, clothing advice and risk box.
-->
<template>
  <section class="page advise">
    <video class="page-video" autoplay muted loop playsinline>
      <source src="/advise.mp4" type="video/mp4" />
    </video>
    <div class="page-overlay"></div>

    <div class="content-layer">
      <div class="hero-banner">
        <div class="hero-text">
          <p class="hero-label">Sun protection guidance</p>
          <h1>Sun-Smart Clothing Advice</h1>
          <p>Find out what to wear based on today's UV level.</p>
        </div>
      </div>

      <div class="middle-grid">
        <div class="uv-selector">
          <p class="label">Current UV index</p>
          <div class="ring">
            <div class="inner static">
              <span class="uv-label">UV Level</span>
              <span class="level">{{ displayedUv }}</span>
            </div>
          </div>
          <p class="shared-note">Using the latest UV result from Home.</p>
        </div>

        <div class="sunscreen-card">
          <p class="label">Sunscreen recommendation</p>
          <div class="sunscreen-main">
            <div class="sunscreen-row detail-card">
              <div class="sunscreen-visual">
                <img src="/image/uvindex.png" alt="UV index indicator" class="sunscreen-img" />
              </div>
              <div class="sunscreen-copy">
                <p class="detail-label">Current level</p>
                <p class="level-text">{{ levelText }}</p>
              </div>
            </div>
            <div class="sunscreen-row detail-card">
              <div class="sunscreen-visual">
                <img src="/image/sunprotection.png" alt="Sunscreen amount" class="sunscreen-img" />
              </div>
              <div class="sunscreen-copy">
                <p class="detail-label">Suggested amount</p>
                <p class="amount">{{ gramsText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="clothing-panel">
          <div class="photo-col">
            <img src="/image/clothing.png" alt="Clothing on rack" />
          </div>
          <div class="details-col">
            <div class="panel-header-block">
              <div>
                <p class="panel-kicker">Outfit guidance</p>
                <h2 class="panel-title">What to wear now</h2>
                <div class="risk-inline">
                  <span class="risk-pill">{{ riskLabel }} risk</span>
                  <span class="risk-inline-text">UV level {{ displayedUv }}</span>
                </div>
              </div>
            </div>

            <div class="primary-advice">
              <p class="primary-label">Priority action</p>
              <p class="primary-text">{{ advice.hat }}</p>
            </div>

            <ul class="clothing-list">
              <li v-for="item in recommendationItems" :key="item.title" class="clothing-item">
                <span class="item-icon" aria-hidden="true">{{ item.icon }}</span>
                <div class="item-copy">
                  <p class="item-title">{{ item.title }}</p>
                  <p class="item-desc">{{ item.description }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const SHARED_UV_STORAGE_KEY = 'sunwise-current-uv'
const selectedUv = ref(6)
const liveUv = ref(6)

const uvAdviceMap = {
  1: {
    hat: 'Optional: a cap is enough for short outdoor time.',
    clothing: 'Light clothing is fine.',
    sunglasses: 'Recommended in bright conditions.',
    umbrella: 'Usually not necessary.',
  },
  2: {
    hat: 'A small hat is recommended if staying outside.',
    clothing: 'Normal clothing is fine.',
    sunglasses: 'Wear UV-blocking sunglasses.',
    umbrella: 'Optional for extra shade.',
  },
  3: {
    hat: 'Wear a broad-brim hat if outdoors for long periods.',
    clothing: 'Consider light long sleeves.',
    sunglasses: 'UV-blocking sunglasses recommended.',
    umbrella: 'Useful during peak sun hours.',
  },
  4: {
    hat: 'Broad-brim hat recommended.',
    clothing: 'Long-sleeve clothing is preferred.',
    sunglasses: 'Wear UV-blocking sunglasses.',
    umbrella: 'Seek shade or use an umbrella.',
  },
  5: {
    hat: 'Wear a wide-brim hat.',
    clothing: 'Long-sleeve clothing recommended.',
    sunglasses: 'Strongly recommended.',
    umbrella: 'Use shade or umbrella when possible.',
  },
  6: {
    hat: 'Wear a wide-brim hat whenever outside.',
    clothing: 'Protective long sleeves are recommended.',
    sunglasses: 'Essential.',
    umbrella: 'Use an umbrella or stay in shade.',
  },
  7: {
    hat: 'Wide-brim hat is essential.',
    clothing: 'Long sleeves and tighter-weave fabric recommended.',
    sunglasses: 'Essential UV-blocking sunglasses.',
    umbrella: 'Strongly advised.',
  },
  8: {
    hat: 'Always wear a wide-brim hat.',
    clothing: 'Long-sleeve clothing is necessary.',
    sunglasses: 'Always wear UV-blocking sunglasses.',
    umbrella: 'Seek shade and use umbrella when possible.',
  },
  9: {
    hat: 'Strong sun protection needed: wide-brim hat.',
    clothing: 'Protective long sleeves required.',
    sunglasses: 'High protection sunglasses required.',
    umbrella: 'Avoid direct sun; use shade or umbrella.',
  },
  10: {
    hat: 'Wide-brim hat strongly recommended.',
    clothing: 'Long-sleeve clothing strongly recommended.',
    sunglasses: 'UV-blocking sunglasses are essential.',
    umbrella: 'Seek shade immediately or use an umbrella.',
  },
  11: {
    hat: 'Maximum protection: wide-brim hat required.',
    clothing: 'Full protective clothing recommended.',
    sunglasses: 'Essential high-protection sunglasses.',
    umbrella: 'Avoid direct exposure and stay in deep shade.',
  },
}

const advice = ref(uvAdviceMap[selectedUv.value])

const iconMap = {
  hat: '🧢',
  clothing: '👕',
  sunglasses: '🕶️',
  umbrella: '⛱️',
}

const gramsByUv = (uv) => {
  const table = {
    1: 10,
    2: 14,
    3: 18,
    4: 23,
    5: 30,
    6: 37,
    7: 44,
    8: 50,
    9: 56,
    10: 62,
    11: 70,
  }

  return table[uv] ?? 30
}

const riskByUv = (uv) => {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

const displayedUv = computed(() => {
  const uv = Number(liveUv.value)
  if (!Number.isFinite(uv)) return '6'
  return String(uv)
})
const gramsText = computed(() => `≈ ${gramsByUv(selectedUv.value)} g`)
const levelText = computed(() => `Level ${displayedUv.value}`)
const riskLabel = computed(() => riskByUv(Number(liveUv.value)))
const recommendationItems = computed(() => [
  { title: 'Hat', description: advice.value.hat, icon: iconMap.hat },
  { title: 'Clothing', description: advice.value.clothing, icon: iconMap.clothing },
  { title: 'Sunglasses', description: advice.value.sunglasses, icon: iconMap.sunglasses },
  { title: 'Shade', description: advice.value.umbrella, icon: iconMap.umbrella },
])

const syncAdvice = () => {
  advice.value = uvAdviceMap[selectedUv.value] || uvAdviceMap[6]
}

watch(selectedUv, syncAdvice)

function normalizeUvForAdvice(value) {
  const uv = Number(value)
  if (!Number.isFinite(uv)) return 6
  return Math.max(1, Math.min(11, Math.round(uv)))
}

function applySharedUv(value) {
  const uv = Number(value)
  if (!Number.isFinite(uv) || uv < 0) return
  const normalizedUv = normalizeUvForAdvice(uv)
  liveUv.value = normalizedUv
  selectedUv.value = normalizedUv
  syncAdvice()
}

function syncFromStorage() {
  applySharedUv(localStorage.getItem(SHARED_UV_STORAGE_KEY))
}

function onStorage(event) {
  if (event.key === SHARED_UV_STORAGE_KEY) {
    applySharedUv(event.newValue)
  }
}

onMounted(() => {
  syncFromStorage()
  window.addEventListener('storage', onStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
})
</script>

<style scoped>
.page {
  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -16px;
  color: #1f2937;
  overflow-x: hidden;
  isolation: isolate;
}

.page-video,
.page-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.page-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}

.page-overlay {
  background:
    linear-gradient(180deg, rgba(255, 250, 244, 0.58), rgba(34, 24, 18, 0.22)),
    linear-gradient(135deg, rgba(255, 244, 232, 0.54), rgba(255, 255, 255, 0.22));
  z-index: -1;
}

.content-layer {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 64px);
  padding: 0 6vw 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.9rem;
  font-weight: 700;
  color: #6b7280;
}

.hero-banner,
.uv-selector,
.sunscreen-card,
.clothing-panel {
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 250, 244, 0.92), rgba(255, 255, 255, 0.84));
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(12px);
}

.hero-banner {
  padding: 30px 32px;
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
  margin-top: 20px;
}

.hero-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  font-weight: 700;
  color: #c2410c;
}

.hero-text h1 {
  margin: 0 0 6px;
  font-size: clamp(2rem, 3vw, 3rem);
  color: #7c2d12;
}

.hero-text p {
  margin: 0;
  color: #4b5563;
  font-size: 1rem;
}

.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
  gap: 24px;
}

.uv-selector {
  padding: 24px 22px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.ring {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: conic-gradient(#b10000 0 90deg, #a5d66a 90deg 180deg, #f2c94c 180deg 270deg, #f97316 270deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #22004a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.uv-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.level {
  font-size: 4.8rem;
  line-height: 1;
  font-weight: 900;
  margin: 0;
  color: #e11d48;
}

.shared-note {
  margin: 0;
  text-align: center;
  color: #5b6473;
  font-size: 0.98rem;
  line-height: 1.45;
  font-weight: 700;
  white-space: nowrap;
}

.sunscreen-card {
  padding: 24px 32px 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.sunscreen-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sunscreen-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.detail-card {
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(249, 115, 22, 0.12);
}

.sunscreen-visual {
  width: 108px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 113, 133, 0.08));
  flex: 0 0 auto;
}

.sunscreen-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.detail-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: #6b7280;
}

.sunscreen-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 16px;
}

.level-text,
.amount {
  margin: 0;
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
}

.level-text {
  color: #f97316;
}

.amount {
  color: #1f2937;
}

.bottom-grid {
  display: block;
}

.clothing-panel {
  padding: 26px;
  display: grid;
  grid-template-columns: minmax(280px, 0.92fr) minmax(0, 1.25fr);
  gap: 26px;
  align-items: stretch;
}

.photo-col {
  position: relative;
}

.photo-col::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(124, 45, 18, 0.03), rgba(15, 23, 42, 0.14));
  pointer-events: none;
}

.photo-col img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  border-radius: 28px;
  display: block;
}

.details-col {
  padding: 8px 6px 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-header-block {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.panel-kicker,
.primary-label {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.74rem;
  font-weight: 700;
  color: #6b7280;
}

.panel-title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  line-height: 1.05;
  color: #7c2d12;
}

.risk-inline {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.risk-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(251, 113, 133, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.18);
  color: #c2410c;
  font-size: 0.92rem;
  font-weight: 800;
}

.risk-inline-text {
  margin: 0;
  color: #4b5563;
  font-size: 0.98rem;
  font-weight: 600;
}

.primary-advice {
  padding: 16px 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(255, 255, 255, 0.72));
  border: 1px solid rgba(249, 115, 22, 0.14);
}

.primary-text {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 1.9rem);
  line-height: 1.25;
  color: #374151;
  font-weight: 500;
}

.clothing-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.clothing-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(255, 255, 255, 0.34);
}

.item-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 113, 133, 0.1));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  line-height: 1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.item-copy {
  display: grid;
  gap: 4px;
}

.item-title {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
}

.item-desc {
  margin: 0;
  font-size: 1.12rem;
  color: #374151;
  line-height: 1.45;
}

@media (max-width: 1024px) {
  .middle-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .clothing-panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .photo-col img {
    min-height: 300px;
    max-height: 360px;
  }
}

@media (max-width: 768px) {
  .content-layer {
    padding: 0 14px 28px;
    gap: 24px;
  }

  .hero-banner,
  .uv-selector,
  .sunscreen-card,
  .clothing-panel {
    border-radius: 24px;
  }

  .hero-banner {
    padding: 24px 20px;
    margin-top: 14px;
  }

  .shared-note {
    white-space: normal;
    max-width: 260px;
  }

  .ring {
    width: 230px;
    height: 230px;
  }

  .inner {
    width: 126px;
    height: 126px;
  }

  .level {
    font-size: 4rem;
  }

  .detail-card {
    padding: 16px;
  }

  .sunscreen-visual {
    width: 92px;
    height: 92px;
  }

  .sunscreen-img {
    width: 84px;
    height: 84px;
    border-radius: 12px;
  }

  .clothing-panel {
    padding: 18px;
    gap: 18px;
  }

  .photo-col img {
    width: 100%;
    height: auto;
    min-height: unset;
    max-height: unset;
    aspect-ratio: 4 / 3;
  }

  .details-col {
    padding: 0;
  }

  .panel-header-block {
    flex-direction: column;
  }

  .clothing-item {
    grid-template-columns: 56px minmax(0, 1fr);
    padding: 12px 14px;
  }

  .item-icon {
    width: 56px;
    height: 56px;
    font-size: 26px;
  }

  .item-desc {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content-layer {
    padding: 0 10px 22px;
  }

  .hero-banner {
    margin-top: 10px;
  }

  .sunscreen-row {
    flex-direction: column;
    text-align: center;
  }

  .sunscreen-copy {
    align-items: center;
  }

  .level-text,
  .amount {
    font-size: 2.5rem;
  }

  .ring {
    width: 186px;
    height: 186px;
  }

  .inner {
    width: 106px;
    height: 106px;
  }

  .uv-label {
    font-size: 0.8rem;
  }

  .level {
    font-size: 3.1rem;
  }

  .panel-title {
    font-size: 1.8rem;
  }

  .primary-text {
    font-size: 1.2rem;
  }

  .clothing-item {
    grid-template-columns: 1fr;
    text-align: left;
  }
}
</style>
