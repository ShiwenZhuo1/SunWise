<template>
  <div class="chat-root" :style="rootStyle">
    <button
      class="chat-toggle"
      type="button"
      :aria-label="isOpen ? 'Close chat' : 'Open chat'"
      @mousedown.prevent="onDragStart($event, 'mouse')"
      @touchstart.prevent="onDragStart($event, 'touch')"
      @click="onToggleClick"
    >
      💬
    </button>

    <div v-if="isOpen" class="chat-panel" :style="panelStyle">
      <header class="chat-header">
        <span>Ask SunWise</span>
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

const isOpen = ref(false)
const question = ref('')
const loading = ref(false)
const messages = ref([])

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
  left: `${posX.value}px`,
  top: `${posY.value}px`,
}))

const panelStyle = computed(() => ({
  bottom: `${BUTTON_SIZE + 8}px`,
  right: '0',
}))

function clampPosition(x, y) {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - BUTTON_SIZE : 9999
  const maxY = typeof window !== 'undefined' ? window.innerHeight - BUTTON_SIZE : 9999
  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
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
  isOpen.value = !isOpen.value
}

onMounted(() => {
  const { x, y } = clampPosition(window.innerWidth - GAP - BUTTON_SIZE, window.innerHeight - GAP - BUTTON_SIZE)
  posX.value = x
  posY.value = y
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #111827;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.9);
  cursor: pointer;
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
</style>

