<script setup>
import { RouterView, RouterLink } from 'vue-router'
import ChatWidget from './components/ChatWidget.vue'
</script>

<template>
  <div class="layout">
    <header class="top-bar">
      <div class="left">
        <div class="logo-mark">☀️</div>
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
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(76, 29, 149, 0.96));
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.7);
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #facc15 0, #f97316 40%, #fb7185 90%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 10px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f9fafb;
  margin-right: 40px;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #cbd5f5;
  font-weight: 500;
  padding-bottom: 6px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
  letter-spacing: 0.04em;
}

.nav-link:hover {
  color: #f97316;
}

.nav-link.router-link-active {
  color: #ffffff;
  border-bottom-color: #f97316;
}

.content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0 16px;
    gap: 12px;
  }

  .nav {
    gap: 12px;
  }

  .right-actions {
    display: none;
  }
}
</style>
