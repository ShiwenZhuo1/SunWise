<template>
  <section class="page learn">
    <!-- Carousel -->
    <div class="carousel">
      <div
        class="slide"
        v-for="(slide, index) in slides"
        :key="slide.title"
        v-show="index === activeIndex"
        :style="{ backgroundImage: `url(${slide.background})` }"
      >
        <div class="slide-overlay">
          <h1>{{ slide.title }}</h1>
          <p class="slide-text">
            {{ slide.text }}
          </p>
          <a class="primary-link" :href="slide.link" target="_blank" rel="noopener noreferrer">
            {{ slide.button }}
          </a>
        </div>
      </div>

      <div class="carousel-controls">
        <button class="nav-btn" type="button" @click="prevSlide">‹</button>
        <div class="dots">
          <button
            v-for="(slide, index) in slides"
            :key="slide.title"
            type="button"
            class="dot"
            :class="{ active: index === activeIndex }"
            @click="goTo(index)"
          ></button>
        </div>
        <button class="nav-btn" type="button" @click="nextSlide">›</button>
      </div>
    </div>

    <!-- Bottom cards for charts -->
    <div class="bottom-grid">
      <button class="info-card info-card-btn" type="button" @click="showChart('skin')">
        <div class="icon-placeholder">?</div>
        <div class="info-text">
          <h2>Skin cancer impact</h2>
          <p>Age-specific incidence rate (per 100,000) by sex — Males, Females, Persons (all ages). Filter by year range.</p>
        </div>
      </button>
      <button class="info-card info-card-btn" type="button" @click="showChart('heat')">
        <div class="icon-placeholder">☀️</div>
        <div class="info-text">
          <h2>Heat &amp; UV exposure trend</h2>
          <p>Number of days per year above the 1% heat threshold. Filter by year range to view trends.</p>
        </div>
      </button>
    </div>

    <!-- Charts only mount and show after clicking corresponding button -->
    <SkinCancerChart v-if="activeChart === 'skin'" ref="skinChartRef" />

    <HeatChart v-if="activeChart === 'heat'" ref="heatChartRef" />
  </section>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import HeatChart from '../components/HeatChart.vue'
import SkinCancerChart from '../components/SkinCancerChart.vue'

const activeChart = ref(null)
const skinChartRef = ref(null)
const heatChartRef = ref(null)

function showChart(which) {
  if (activeChart.value === which) {
    activeChart.value = null
    return
  }
  activeChart.value = which
  nextTick(() => {
    const el = which === 'skin' ? skinChartRef.value?.$el : heatChartRef.value?.$el
    el?.scrollIntoView({ behavior: 'smooth' })
  })
}

const slides = [
  {
    title: 'Why UV matters in Australia',
    text:
      'Australia experiences some of the world’s highest UV radiation levels. Even on mild or cloudy days, UV can damage skin quickly and cause sunburn within minutes.',
    button: 'Learn more',
    link:
      'https://www.abc.net.au/news/science/2025-02-04/sun-summer-uv-sunburn-skin-cancer-australia-ozone-layer/104870806',
    background: '/image/AustraliaUV.png',
  },
  {
    title: 'Skin cancer impact',
    text:
      'Exposure to ultraviolet (UV) radiation damages skin cells and increases the risk of skin cancer. In Australia, skin cancer is one of the most common cancers but is largely preventable with proper sun protection.',
    button: 'Read official info',
    link: 'https://www.cancer.org.au/cancer-information/types-of-cancer/skin-cancer',
    background: '/image/skincancer.png',
  },
  {
    title: 'Daily sun protection tips',
    text:
      'Protect your skin by using sunscreen, wearing protective clothing, seeking shade and sunglasses. These simple habits can significantly reduce the risk of UV damage and skin cancer.',
    button: 'View official guide',
    link: 'https://www.skincancer.org/skin-cancer-prevention/sun-protection/',
    background: '/image/Dailyprotection.png',
  },
]

const activeIndex = ref(0)

const prevSlide = () => {
  activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length
}

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % slides.length
}

const goTo = (index) => {
  activeIndex.value = index
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.carousel {
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.slide {
  height: 550px;
  background-size: 100% 100%;
  background-position: center;
  display: flex;
  align-items: stretch;
}

.slide-overlay {
  flex: 1;
  padding: 32px 36px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.9), transparent);
  color: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 520px;
}

.slide-overlay h1 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 3vw, 2.6rem);
}

.slide-text {
  margin: 0 0 22px;
  line-height: 1.6;
  opacity: 0.95;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #111827;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 16px 40px rgba(248, 113, 113, 0.7);
}

.primary-link:hover {
  transform: translateY(-1px);
}

.carousel-controls {
  position: absolute;
  inset: auto 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  font-size: 1.1rem;
  cursor: pointer;
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: none;
  background: rgba(148, 163, 184, 0.7);
  cursor: pointer;
}

.dot.active {
  width: 18px;
  background: #f97316;
}

@media (max-width: 768px) {
  .page {
    padding-inline: 16px;
  }

  .slide-overlay {
    padding: 24px 20px;
    max-width: 100%;
  }
}

.bottom-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.info-card {
  border-radius: 24px;
  padding: 20px 22px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.6);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #f9fafb;
}

.info-card-btn {
  border: 1px solid rgba(148, 163, 184, 0.6);
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.info-card-btn:hover {
  border-color: #f97316;
}

.icon-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: #312e81;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.info-text h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

.info-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}
</style>
