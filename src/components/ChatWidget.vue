<template>
  <div class="chat-root" :style="rootStyle">
    <button
      class="chat-toggle"
      :class="{ open: isOpen }"
      type="button"
      :aria-label="isOpen ? 'Close SunWise AI Assistant' : 'Open SunWise AI Assistant'"
      @mousedown.prevent="onDragStart($event, 'mouse')"
      @touchstart.prevent="onDragStart($event, 'touch')"
      @click="onToggleClick"
    >
      <span class="chat-toggle-icon">{{ isOpen ? '✕' : '💬' }}</span>
      <span v-if="!isOpen" class="chat-toggle-copy">
        <strong>SunWise AI</strong>
        <small>Ask about UV safety</small>
      </span>
    </button>

    <div v-if="isOpen" class="chat-panel" :style="panelStyle">
      <header class="chat-header">
        <span>☀️ SunWise AI Assistant</span>
        <button type="button" class="close-btn" @click="isOpen = false">✕</button>
      </header>

      <main class="chat-body">
        <div v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="msg.role">
          <div class="msg-avatar" :class="msg.role">
            <span v-if="msg.role === 'bot'">☀</span>
            <span v-else>You</span>
          </div>
          <div class="msg-bubble">
            <p>{{ msg.text }}</p>
          </div>
        </div>
        <div v-if="loading" class="msg-row bot">
          <div class="msg-avatar bot">☀</div>
          <div class="msg-bubble loading-bubble">Thinking...</div>
        </div>
      </main>

      <form class="chat-input" @submit.prevent="send">
        <input
          v-model="question"
          type="text"
          placeholder="Ask about UV, sun safety..."
          :disabled="loading"
        />
        <button type="submit" :disabled="loading || !question.trim()">Send</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { API_BASE } from '../config'

const BUTTON_SIZE = 52
const GAP = 24
const RIGHT_OFFSET = 15

const isOpen = ref(false)
const question = ref('')
const loading = ref(false)
const messages = ref([])
const welcomeMessage = `☀️ SunWise AI Assistant

Ask anything about UV safety.

Suggested questions:
• What should I wear for UV 6?
• Do I need sunscreen today?
• How long can I stay outside safely?`

// FAB position (updated on drag)
const posX = ref(0)
const posY = ref(0)
const isDragging = ref(false)
const hasMoved = ref(false)
let startX = 0
let startY = 0
let startPosX = 0
let startPosY = 0

const rootStyle = computed(() => ({
  right: RIGHT_OFFSET + 'px',
  top: posY.value + 'px',
}))

const panelStyle = computed(() => ({
  bottom: `${BUTTON_SIZE + 8}px`,
  right: '0',
}))

function clampPosition(x, y) {
  const maxY = typeof window !== 'undefined' ? window.innerHeight - BUTTON_SIZE - GAP : 9999
  const minY = typeof window !== 'undefined' ? GAP : 0
  return {
    x: 0,
    y: Math.max(minY, Math.min(y, maxY)),
  }
}

function onDragStart(e, type) {
  hasMoved.value = false
  const clientX = type === 'mouse' ? e.clientX : e.touches[0].clientX
  const clientY = type === 'mouse' ? e.clientY : e.touches[0].clientY
  startX = clientX
  startY = clientY
  startPosX = posX.value
  startPosY = posY.value
  isDragging.value = true
  if (type === 'mouse') {
    window.addEventListener('mousemove', onDragMoveMouse)
    window.addEventListener('mouseup', onDragEndMouse, { once: true })
  } else {
    window.addEventListener('touchmove', onDragMoveTouch, { passive: false })
    window.addEventListener('touchend', onDragEndTouch, { once: true })
  }
}

function onDragMoveMouse(e) {
  e.preventDefault()
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.value = true
  const { x, y } = clampPosition(startPosX + dx, startPosY + dy)
  posX.value = x
  posY.value = y
}

function onDragMoveTouch(e) {
  if (e.cancelable) e.preventDefault()
  const t = e.touches[0]
  const dx = t.clientX - startX
  const dy = t.clientY - startY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.value = true
  const { x, y } = clampPosition(startPosX + dx, startPosY + dy)
  posX.value = x
  posY.value = y
}

function onDragEndMouse() {
  window.removeEventListener('mousemove', onDragMoveMouse)
  isDragging.value = false
}

function onDragEndTouch() {
  window.removeEventListener('touchmove', onDragMoveTouch)
  isDragging.value = false
}

function onToggleClick() {
  if (hasMoved.value) return
  const nextState = !isOpen.value
  isOpen.value = nextState
  if (nextState) ensureWelcomeMessage()
}

function ensureWelcomeMessage() {
  if (messages.value.length > 0) return
  messages.value.push({
    role: 'bot',
    text: welcomeMessage,
  })
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    // initial position: 50px from bottom
    const initialTop = window.innerHeight - BUTTON_SIZE - 100
    posY.value = initialTop
  }
})

const send = async () => {
  const q = question.value.trim()
  if (!q) return

  messages.value.push({ role: 'user', text: q })
  question.value = ''
  loading.value = true

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    const answer = data.answer ?? JSON.stringify(data)
    messages.value.push({ role: 'bot', text: answer })
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'bot',
      text: 'Sorry, something went wrong while contacting the server.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chat-root {
  position: fixed;
  z-index: 2000;
  pointer-events: none;
}

.chat-root > .chat-toggle {
  pointer-events: auto;
}

.chat-panel {
  pointer-events: auto;
}

.chat-toggle {
  min-height: 50px;
  padding: 8px 12px 8px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.95), rgba(255, 255, 255, 0.86));
  color: #7c2d12;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 9px;
  justify-content: center;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
  animation: chatFloat 3.2s ease-in-out infinite;
}

.chat-toggle:hover {
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(249, 115, 22, 0.34);
  background: linear-gradient(135deg, rgba(255, 244, 232, 0.98), rgba(255, 255, 255, 0.9));
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
}

.chat-toggle.open {
  width: 52px;
  min-height: 52px;
  padding: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb7185);
  border-color: rgba(255, 255, 255, 0.18);
  color: #1f2937;
}

.chat-toggle-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(251, 113, 133, 0.14));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.08rem;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  color: #9a3412;
}

.chat-toggle.open .chat-toggle-icon {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.chat-toggle-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
  text-align: left;
}

.chat-toggle-copy strong {
  color: #7c2d12;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chat-toggle-copy small {
  color: #6b7280;
  font-size: 0.58rem;
  margin-top: 1px;
}

.chat-toggle::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(251, 146, 60, 0.1) 35%,
    transparent 65%
  );
  transform: translateX(-140%);
  animation: chatShimmer 4.8s ease-in-out infinite;
  pointer-events: none;
}

.chat-toggle.open::after {
  display: none;
}

@keyframes chatFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes chatShimmer {
  0%,
  70%,
  100% {
    transform: translateX(-140%);
  }
  82% {
    transform: translateX(140%);
  }
}

.chat-panel {
  position: absolute;
  right: 0;
  width: 360px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #f8fafc;
  color: #111827;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.25);
  overflow: hidden;
  font-size: 16px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f1f5f9;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  font-weight: 600;
  font-size: 1.125rem;
  color: #1e293b;
}

.close-btn {
  border: none;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 2px 6px;
  line-height: 1;
}

.chat-body {
  padding: 14px 12px;
  flex: 1;
  overflow-y: auto;
  font-size: 1rem;
  background: #f8fafc;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.msg-row.bot {
  flex-direction: row;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.msg-avatar.bot {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  font-size: 1.125rem;
}

.msg-avatar.user {
  background: #e2e8f0;
}

.msg-bubble {
  max-width: 78%;
  padding: 12px 16px;
  border-radius: 14px;
  line-height: 1.5;
  font-size: 1rem;
}

.msg-row.bot .msg-bubble {
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #111827;
}

.msg-row.user .msg-bubble {
  background: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #111827;
}

.msg-bubble p {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  white-space: pre-line;
}

.loading-bubble {
  color: #64748b;
  font-style: italic;
  font-size: 1rem;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: #f1f5f9;
}

.chat-input input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #fff;
  color: #111827;
  padding: 10px 16px;
  font-size: 1rem;
}

.chat-input input::placeholder {
  color: #64748b;
}

.chat-input button {
  border-radius: 999px;
  border: none;
  padding: 10px 18px;
  background: #f97316;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 640px) {
  .chat-toggle {
    min-height: 46px;
    padding: 7px 10px 7px 7px;
    gap: 8px;
  }

  .chat-toggle-copy strong {
    font-size: 0.66rem;
  }

  .chat-toggle-copy small {
    font-size: 0.55rem;
  }

  .chat-panel {
    width: min(360px, calc(100vw - 28px));
  }
}
</style>
