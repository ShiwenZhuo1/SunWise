<template>
  <div class="chat-root">
    <!-- Floating toggle button -->
    <button class="chat-toggle" type="button" @click="isOpen = !isOpen">
      💬
    </button>

    <!-- Chat panel -->
    <div v-if="isOpen" class="chat-panel">
      <header class="chat-header">
        <span>Ask SunWise</span>
        <button type="button" class="close-btn" @click="isOpen = false">✕</button>
      </header>

      <main class="chat-body">
        <div v-for="(msg, idx) in messages" :key="idx" class="msg" :class="msg.role">
          <p>{{ msg.text }}</p>
        </div>
        <div v-if="loading" class="loading">Thinking...</div>
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
import { ref } from 'vue'

// Adjust base URL if your backend runs elsewhere
const API_BASE = 'http://127.0.0.1:8000'

const isOpen = ref(false)
const question = ref('')
const loading = ref(false)
const messages = ref([])

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
  right: 24px;
  bottom: 24px;
  z-index: 2000;
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
  bottom: 64px;
  width: 320px;
  max-height: 460px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #020617;
  color: #f9fafb;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #111827;
  font-weight: 600;
  font-size: 0.9rem;
}

.close-btn {
  border: none;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
}

.chat-body {
  padding: 8px 10px;
  flex: 1;
  overflow-y: auto;
  font-size: 0.85rem;
}

.msg {
  margin-bottom: 6px;
  max-width: 90%;
}

.msg.user {
  align-self: flex-end;
  text-align: right;
  color: #e5e7eb;
}

.msg.bot {
  align-self: flex-start;
  color: #e5e7eb;
  opacity: 0.95;
}

.loading {
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-input {
  display: flex;
  gap: 6px;
  padding: 8px 8px 10px;
  border-top: 1px solid rgba(30, 64, 175, 0.7);
}

.chat-input input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  background: #020617;
  color: #f9fafb;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.chat-input button {
  border-radius: 999px;
  border: none;
  padding: 6px 12px;
  background: #f97316;
  color: #111827;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>

