<template>
  <section class="page advise">
    <div class="hero-banner">
      <div class="sunset"></div>
      <div class="hero-text">
        <h1>Sun-Smart Clothing Advice</h1>
        <p>Find out what to wear based on today's UV level.</p>
      </div>
    </div>

    <div class="middle-grid">
      <div class="uv-selector">
        <p class="label">Select UV level</p>
        <div class="ring">
          <button class="inner" type="button" @click="showSelector = !showSelector">
            <span class="level">{{ selectedUv }}</span>
            <span class="hint">Tap in here</span>
          </button>
        </div>
        <transition name="fade">
          <div v-if="showSelector" class="uv-dropdown">
            <label>
              <span class="dropdown-label">UV level</span>
              <select v-model.number="selectedUv">
                <option v-for="val in uvOptions" :key="val" :value="val">Level {{ val }}</option>
              </select>
            </label>
          </div>
        </transition>
        <button class="primary" type="button">Get advice</button>
      </div>

      <div class="sunscreen-card">
        <p class="label">Sunscreen recommendation:</p>
        <div class="sunscreen-main">
          <div class="sunscreen-row">
            <img src="/image/uvindex.png" alt="UV index indicator" class="sunscreen-img" />
            <p class="level-text">{{ levelText }}</p>
          </div>
          <div class="approx-row">≈</div>
          <div class="sunscreen-row">
            <img src="/image/sunprotection.png" alt="Sunscreen amount" class="sunscreen-img" />
            <p class="amount">{{ gramsText }}</p>
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
          <p class="panel-title">Clothing recommendation:</p>
          <ul class="clothing-list">
            <li>
              <span class="item-icon">🧢</span>
              <span class="item-title">Wide-brim hat</span>
            </li>
            <li>
              <span class="item-icon">👕</span>
              <span class="item-title">Long-sleeve clothing</span>
            </li>
            <li>
              <span class="item-icon">🕶️</span>
              <span class="item-title">UV-blocking sunglasses</span>
            </li>
            <li>
              <span class="item-icon">⛱️</span>
              <span class="item-title">Seek shade</span>
            </li>
          </ul>
          <div class="risk-box">
            <p class="risk-label">Risk level:</p>
            <p class="risk-value">{{ riskLabel }}</p>
            <p class="risk-detail">UV level at {{ selectedUv }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const uvOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const showSelector = ref(false)
const selectedUv = ref(6)

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
  if (uv <= 10) return 'Very high'
  return 'Extreme'
}

const gramsText = computed(() => `≈ ${gramsByUv(selectedUv.value)} g`)
const levelText = computed(() => `Level ${selectedUv.value}`)
const riskLabel = computed(() => riskByUv(selectedUv.value))
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 32px 6vw 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: #f9fafb;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #e5e7eb;
}

/* Hero banner */
.hero-banner {
  border-radius: 32px;
  padding: 28px 28px 34px;
  background: radial-gradient(circle at top, #fb923c 0, #7c3aed 45%, #020617 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.sunset {
  width: min(360px, 80vw);
  aspect-ratio: 4 / 3;
  border-radius: 999px;
  background: radial-gradient(circle at top, #fde68a 0, #fb923c 40%, #ec4899 80%);
  position: relative;
  overflow: hidden;
}

.sunset::before,
.sunset::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  border-top: 4px solid rgba(15, 23, 42, 0.8);
}

.sunset::before {
  top: 45%;
}

.sunset::after {
  top: 60%;
}

.hero-text h1 {
  margin: 0 0 4px;
  font-size: clamp(1.8rem, 2.5vw, 2.3rem);
}

.hero-text p {
  margin: 0;
  opacity: 0.9;
}

/* Middle grid */
.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
  gap: 24px;
}

.uv-selector {
  border-radius: 30px;
  padding: 24px 22px 26px;
  background: #020617;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.ring {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: conic-gradient(#ef4444 0 90deg, #f97316 90deg 180deg, #22c55e 180deg 270deg, #3b82f6 270deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: #020617;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  cursor: pointer;
}

.level {
  font-size: 2.6rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #f9fafb;
}

.hint {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #e5e7eb;
}

.primary {
  border-radius: 999px;
  border: none;
  padding: 10px 28px;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #111827;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

.primary:hover {
  transform: translateY(-1px);
}

.uv-dropdown {
  width: 100%;
  padding: 10px 14px;
  border-radius: 16px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.7);
  display: flex;
  justify-content: center;
}

.dropdown-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.uv-dropdown select {
  width: 140px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.9);
  background: #020617;
  color: #e5e7eb;
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sunscreen-card {
  border-radius: 32px;
  padding: 24px 32px 26px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.6);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 1);
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-self: stretch;
}

.sunscreen-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.sunscreen-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.sunscreen-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.approx-row {
  font-size: 3rem;
  font-weight: 700;
  color: #facc15;
  align-self: center;
}

.level-text {
  margin: 0 0 4px;
  font-size: 3.5rem !important;
  font-weight: 800;
  color: #f97316;
}

.amount {
  margin: 0;
  font-size: 3.5rem !important;
  font-weight: 800;
  color: #f9fafb;
}

.ghost {
  align-self: flex-end;
  border-radius: 999px;
  padding: 8px 18px;
  border: none;
  background: #312e81;
  color: #f9fafb;
  font-size: 0.8rem;
  cursor: pointer;
}

.ghost:hover {
  border-color: #f97316;
}

/* Bottom grid */
.bottom-grid {
  display: block;
}

.clothing-panel {
  border-radius: 32px;
  padding: 24px 26px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 1);
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.8fr);
  gap: 0;
  align-items: flex-start;
}

.photo-col img {
  width: 450px;
  height: 450px;
  object-fit: cover;
  border-radius: 24px 0 0 24px;
  display: block;
}

.details-col {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: radial-gradient(circle at top, #fde68a 0, #fb923c 45%, #ec4899 80%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.panel-title {
  margin: 0 0 10px;
  font-weight: 600;
  font-size: 1.5rem;
}

.clothing-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  font-size: 1.5rem;
}

.clothing-list li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.item-title {
  font-weight: 600;
}

.risk-box {
  display: inline-block;
  align-self: flex-end;
  border-radius: 18px;
  border: 2px solid #f97316;
  padding: 8px 14px;
  text-align: right;
  font-size: 1.5rem;
}

.risk-label {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 1.4rem;
}

.risk-value {
  margin: 0;
  color: #f97316;
  font-weight: 700;
}

.risk-detail {
  margin: 2px 0 0;
  font-size: 1.5rem;
}

@media (max-width: 1024px) {
  .middle-grid,
  .bottom-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .clothing-panel {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .page {
    padding-inline: 16px;
  }
}
</style>
