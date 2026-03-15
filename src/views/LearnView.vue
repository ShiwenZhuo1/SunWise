<template>
  <section class="page learn">
    <video class="page-video" autoplay muted loop playsinline>
      <source src="/learn.mp4" type="video/mp4" />
    </video>
    <div class="page-overlay"></div>

    <div class="content-layer">
      <div class="carousel-shell">
        <button class="nav-btn nav-btn-prev" type="button" aria-label="Previous slide" @click="prevSlide">
          &#8249;
        </button>

        <div class="carousel">
          <div
            v-for="(slide, index) in slides"
            v-show="index === activeIndex"
            :key="slide.title"
            class="slide"
            :style="{ backgroundImage: `url(${slide.background})` }"
          >
            <div class="slide-overlay">
              <h1>{{ slide.title }}</h1>
              <p class="slide-text">{{ slide.text }}</p>
              <a class="primary-link" :href="slide.link" target="_blank" rel="noopener noreferrer">
                {{ slide.button }}
              </a>
            </div>
          </div>

          <div class="carousel-controls">
            <div class="dots">
              <button
                v-for="(slide, index) in slides"
                :key="slide.title"
                type="button"
                class="dot"
                :class="{ active: index === activeIndex }"
                :aria-label="`Go to slide ${index + 1}`"
                @click="goTo(index)"
              ></button>
            </div>
          </div>
        </div>

        <button class="nav-btn nav-btn-next" type="button" aria-label="Next slide" @click="nextSlide">
          &#8250;
        </button>
      </div>

      <div class="bottom-grid">
        <button
          class="info-card info-card-btn"
          :class="{ active: activeChart === 'skin' }"
          type="button"
          @click="showChart('skin')"
        >
          <div class="icon-placeholder">?</div>
          <div class="info-text">
            <h2>Skin cancer impact</h2>
            <p>Age-specific incidence rate (per 100,000) by sex - Males, Females, Persons (all ages). Filter by year range.</p>
          </div>
        </button>
        <button
          class="info-card info-card-btn"
          :class="{ active: activeChart === 'heat' }"
          type="button"
          @click="showChart('heat')"
        >
          <div class="icon-placeholder">☀</div>
          <div class="info-text">
            <h2>Heat &amp; UV exposure trend</h2>
            <p>Number of days per year above the 1% heat threshold. Filter by year range to view trends.</p>
          </div>
        </button>
      </div>

      <SkinCancerChart v-if="activeChart === 'skin'" ref="skinChartRef" />
      <HeatChart v-if="activeChart === 'heat'" ref="heatChartRef" />
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue'
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
      'Australia experiences some of the world\'s highest UV radiation levels. Even on mild or cloudy days, UV can damage skin quickly and cause sunburn within minutes.',
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
  position: relative;
  min-height: calc(100vh - 80px);
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
    linear-gradient(180deg, rgba(255, 250, 244, 0.44), rgba(25, 20, 39, 0.24)),
    linear-gradient(135deg, rgba(255, 244, 232, 0.38), rgba(255, 255, 255, 0.14));
  z-index: -1;
}

.content-layer {
  min-height: calc(100vh - 80px);
  padding: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.carousel-shell {
  position: relative;
  width: min(1320px, calc(100vw - 72px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel {
  position: relative;
  width: min(1200px, 100%);
  height: clamp(400px, 42vw, 470px);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(10px);
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: stretch;
}

.slide-overlay {
  flex: 1;
  padding: 32px 36px;
  background: linear-gradient(
    90deg,
    rgba(24, 18, 14, 0.82) 0%,
    rgba(24, 18, 14, 0.66) 34%,
    rgba(24, 18, 14, 0.26) 62%,
    rgba(24, 18, 14, 0.02) 100%
  );
  color: #fff7ed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 520px;
  backdrop-filter: blur(2px);
}

.slide-overlay h1 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 3vw, 2.7rem);
  line-height: 1.05;
  color: #fff7ed;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.slide-text {
  margin: 0 0 22px;
  line-height: 1.6;
  color: rgba(255, 247, 237, 0.96);
  text-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
  max-width: 28ch;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #111827;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 16px 40px rgba(248, 113, 113, 0.32);
}

.primary-link:hover {
  transform: translateY(-1px);
}

.carousel-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(34, 24, 18, 0.82);
  color: #fff7ed;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(10px);
  z-index: 2;
}

.nav-btn:hover {
  background: rgba(68, 42, 27, 0.92);
}

.nav-btn-prev {
  left: 0;
}

.nav-btn-next {
  right: 0;
}

.dots {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(34, 24, 18, 0.46);
  backdrop-filter: blur(8px);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.44);
  cursor: pointer;
}

.dot.active {
  width: 18px;
  background: #f97316;
}

.bottom-grid {
  margin-top: 4px;
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
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.92), rgba(255, 255, 255, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #1f2937;
  backdrop-filter: blur(10px);
}

.info-card-btn {
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.info-card-btn:hover {
  border-color: rgba(249, 115, 22, 0.34);
  transform: translateY(-1px);
}

.info-card-btn.active {
  background: linear-gradient(135deg, rgba(255, 237, 213, 0.96), rgba(255, 247, 237, 0.9));
  border-color: rgba(249, 115, 22, 0.46);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(251, 146, 60, 0.18);
}

.info-card-btn.active .icon-placeholder {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.24), rgba(251, 113, 133, 0.2));
  color: #c2410c;
}

.info-card-btn.active .info-text h2 {
  color: #9a3412;
}

.icon-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 113, 133, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #9a3412;
  flex: 0 0 auto;
}

.info-text h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  color: #7c2d12;
}

.info-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

@media (max-width: 768px) {
  .content-layer {
    padding: 0 16px 28px;
  }

  .carousel-shell {
    width: 100%;
  }

  .carousel {
    height: min(72vw, 480px);
  }

  .slide-overlay {
    padding: 24px 20px;
    max-width: 100%;
    background: linear-gradient(180deg, rgba(24, 18, 14, 0.82), rgba(24, 18, 14, 0.34) 72%);
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .nav-btn-prev {
    left: 8px;
  }

  .nav-btn-next {
    right: 8px;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
    margin-top: 8px;
  }
}
</style>
