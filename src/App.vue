<!--
  App.vue — Root layout: top bar (logo + nav), main content area (RouterView), global ChatWidget.
-->
<script setup>
import { computed, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import ChatWidget from './components/ChatWidget.vue'

const ACCESS_PASSWORD = 'TP48'

const password = ref('')
const errorMessage = ref('')
const isAuthorized = ref(false)

const trimmedPassword = computed(() => password.value.trim())

function unlockSite() {
  if (trimmedPassword.value === ACCESS_PASSWORD) {
    isAuthorized.value = true
    errorMessage.value = ''
    password.value = ''
    return
  }

  errorMessage.value = 'Incorrect password. Try again.'
}
</script>

<template>
  <div class="layout">
    <template v-if="isAuthorized">
      <header class="top-bar">
        <div class="left">
          <div class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" class="logo-icon">
              <circle cx="16" cy="16" r="7" />
              <path d="M16 3.5v4" />
              <path d="M16 24.5v4" />
              <path d="M3.5 16h4" />
              <path d="M24.5 16h4" />
              <path d="m7.2 7.2 2.8 2.8" />
              <path d="m22 22 2.8 2.8" />
              <path d="m7.2 24.8 2.8-2.8" />
              <path d="m22 10 2.8-2.8" />
            </svg>
          </div>
          <div class="logo-text">Sunwise</div>
        </div>

        <nav class="nav">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/learn" class="nav-link">Learn</RouterLink>
          <RouterLink to="/advise" class="nav-link">Advise</RouterLink>
        </nav>
      </header>

      <main class="content">
        <RouterView />
      </main>

      <ChatWidget />
    </template>

    <main v-else class="gate-shell">
      <video class="gate-video" autoplay muted loop playsinline>
        <source src="/home.mp4" type="video/mp4" />
      </video>
      <div class="gate-overlay"></div>
      <section class="gate-card">
        <div class="gate-badge">
          <div class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" class="logo-icon">
              <circle cx="16" cy="16" r="7" />
              <path d="M16 3.5v4" />
              <path d="M16 24.5v4" />
              <path d="M3.5 16h4" />
              <path d="M24.5 16h4" />
              <path d="m7.2 7.2 2.8 2.8" />
              <path d="m22 22 2.8 2.8" />
              <path d="m7.2 24.8 2.8-2.8" />
              <path d="m22 10 2.8-2.8" />
            </svg>
          </div>
          <span>SunWise Private Preview</span>
        </div>
        <h1>Enter password to view the site</h1>
        <p>This preview is protected. Enter the access password to continue.</p>
        <form class="gate-form" @submit.prevent="unlockSite">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
          />
          <button type="submit">Unlock</button>
        </form>
        <p v-if="errorMessage" class="gate-error">{{ errorMessage }}</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #ffb347 0, #7c3aed 45%, #020617 100%);
  color: #ffffff;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  background: linear-gradient(90deg, rgba(34, 24, 18, 0.94), rgba(78, 49, 30, 0.92));
  border-bottom: 1px solid rgba(255, 247, 237, 0.12);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(14px);
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
}

.logo-mark {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 30%, rgba(255, 247, 237, 0.9) 0, rgba(255, 247, 237, 0.18) 18%, transparent 19%),
    radial-gradient(circle at 35% 35%, #fde68a 0, #fb923c 44%, #f97316 74%, #ea580c 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 10px 22px rgba(249, 115, 22, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex: 0 0 auto;
}

.logo-icon {
  width: 22px;
  height: 22px;
  color: rgba(120, 53, 15, 0.88);
  fill: #fde68a;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff7ed;
  font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
  margin-right: 40px;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: #f3e8da;
  font-weight: 600;
  padding: 6px 0;
  transition: color 0.2s ease, transform 0.2s ease;
  letter-spacing: 0.06em;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 2.5px;
  border-radius: 999px;
  background: linear-gradient(90deg, #fb923c, #fdba74);
  transform: scaleX(0);
  transform-origin: center;
  opacity: 0;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.nav-link:hover {
  color: #fdba74;
  transform: translateY(-1px);
}

.nav-link:hover::after {
  transform: scaleX(0.72);
  opacity: 0.65;
}

.nav-link.router-link-active {
  color: #fff7ed;
}

.nav-link.router-link-active::after {
  transform: scaleX(1);
  opacity: 1;
}

.content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.gate-shell {
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  padding: 24px;
  overflow: hidden;
}

.gate-video,
.gate-overlay {
  position: absolute;
  inset: 0;
}

.gate-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gate-overlay {
  background:
    linear-gradient(180deg, rgba(255, 245, 236, 0.24), rgba(25, 20, 39, 0.42)),
    linear-gradient(135deg, rgba(251, 146, 60, 0.16), rgba(236, 72, 153, 0.1));
}

.gate-card {
  position: relative;
  z-index: 1;
  width: min(460px, 100%);
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 250, 244, 0.92), rgba(255, 255, 255, 0.84));
  border: 1px solid rgba(255, 247, 237, 0.22);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  color: #1f2937;
  backdrop-filter: blur(16px);
}

.gate-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #7c2d12;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gate-card h1 {
  margin: 0 0 10px;
  color: #1f1630;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  line-height: 1.05;
}

.gate-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.55;
}

.gate-form {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.gate-form input {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-size: 1rem;
}

.gate-form button {
  border: none;
  border-radius: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f97316, #fb7185);
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(249, 115, 22, 0.22);
}

.gate-error {
  margin-top: 12px;
  color: #b91c1c;
  font-weight: 600;
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0 16px;
    gap: 12px;
  }

  .logo-mark {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }

  .logo-icon {
    width: 20px;
    height: 20px;
  }

  .logo-text {
    margin-right: 18px;
    font-size: 20px;
    letter-spacing: 0.1em;
  }

  .nav {
    gap: 12px;
  }

  .gate-card {
    padding: 22px;
    border-radius: 24px;
  }

  .gate-form {
    flex-direction: column;
  }
}
</style>
