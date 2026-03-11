<template>
  <section class="page learn">
    <!-- Top: Why UV matters card -->
    <div class="why-card">
      <div class="why-text">
        <h1>Why UV matters in Australia</h1>
        <p class="quote">
          Australia has some of the highest levels of UV radiation in the world. UV can cause sunburn in as little as
          10 minutes on a clear summer day.
        </p>
        <p class="source">
          Source:
          <span>ABC Science, Lab Notes</span>
        </p>
        <a
          class="primary-link"
          href="https://www.abc.net.au/news/science/2025-02-04/sun-summer-uv-sunburn-skin-cancer-australia-ozone-layer/104870806"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </div>
      <div class="why-visual">
        <div class="sunset-hero"></div>
      </div>
    </div>

    <!-- Bottom placeholder cards for future charts -->
    <div class="bottom-grid">
      <div class="info-card">
        <div class="icon-placeholder">?</div>
        <div class="info-text">
          <h2>Skin cancer impact</h2>
          <p>Learn how UV levels relate to skin cancer risk in Australia.</p>
        </div>
      </div>
      <div class="info-card">
        <div class="icon-placeholder">☀️</div>
        <div class="info-text">
          <h2>Heat &amp; UV exposure trend</h2>
          <p>Visualise daily UV and heat trends for your location (coming soon).</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 32px 6vw 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.why-card {
  border-radius: 32px;
  padding: 32px 32px 36px;
  background: linear-gradient(135deg, #0b0620, #3b0764);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.1fr);
  gap: 32px;
  color: #f9fafb;
}

.why-text h1 {
  margin: 0 0 16px;
  font-size: clamp(2.1rem, 3vw, 2.8rem);
}

.quote {
  margin: 0 0 18px;
  max-width: 440px;
  line-height: 1.6;
  opacity: 0.94;
}

.source {
  margin: 0 0 26px;
  font-size: 0.9rem;
  opacity: 0.8;
}

.source span {
  font-weight: 600;
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

.why-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sunset-hero {
  width: min(360px, 80%);
  aspect-ratio: 4 / 3;
  border-radius: 999px;
  background: radial-gradient(circle at top, #fde68a 0, #fb923c 40%, #ec4899 80%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
}

.sunset-hero::before,
.sunset-hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  border-top: 4px solid rgba(15, 23, 42, 0.8);
}

.sunset-hero::before {
  top: 45%;
}

.sunset-hero::after {
  top: 60%;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
  gap: 24px;
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

@media (max-width: 960px) {
  .why-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .bottom-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sunset-hero {
    width: min(320px, 90%);
  }
}
</style>
