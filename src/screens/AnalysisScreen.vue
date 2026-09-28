<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import VideoPlaceholder from '../components/VideoPlaceholder.vue'
import { saveAnalysis } from '../stores/analyses'

const route = useRoute()

const name = ref('')
const saved = ref(false)

// One save per analysis; the button locks once it's gone to the profile.
function save() {
  const title = name.value.trim()
  if (!title || saved.value) return

  saveAnalysis({ title, technique: route.query.technique || 'Freestyle' })
  saved.value = true
}
</script>

<template>
  <main class="screen analysis">
    <VideoPlaceholder />

    <!-- One AI turn. Repeat .bubble per message once the thread is real. -->
    <div class="message">
      <p class="bubble">Blah blah blah</p>
      <svg class="avatar" width="30" height="30" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="7" width="17" height="12.5" rx="3" />
        <path d="M12 3.2v3.8" />
        <circle cx="12" cy="2.6" r="1.1" fill="currentColor" />
        <path d="M8.6 12.2v2.2M15.4 12.2v2.2" stroke-width="2.4" stroke-linecap="round" />
      </svg>
      <span class="sr-only">Message from the analysis assistant</span>
    </div>

    <div class="analysis__spacer" />

    <div class="panel field composer">
      <label class="sr-only" for="ask">Ask about this swim</label>
      <input id="ask" class="text-input" type="text" placeholder="Ask a question…" />
      <button class="btn btn--icon" type="button">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8z" />
        </svg>
        <span class="sr-only">Send</span>
      </button>
    </div>

    <div class="save-row">
      <div class="panel field save-row__name">
        <label class="sr-only" for="analysis-name">Name this analysis</label>
        <input id="analysis-name" v-model="name" class="text-input" type="text"
               placeholder="Type name" :disabled="saved" @keydown.enter="save" />
      </div>
      <button class="btn btn--white" type="button" :disabled="!name.trim() || saved"
              @click="save">
        {{ saved ? 'Saved' : 'Save' }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.analysis {
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.bubble {
  position: relative;
  max-width: 82%;
  padding: 14px 18px;
  border: 2px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--panel);
  color: var(--ink);
  font-size: 15px;
}

/* Tail: an outlined square rotated behind the bubble, with the bubble's own
   fill masking the seam. */
.bubble::before,
.bubble::after {
  content: '';
  position: absolute;
  left: 20px;
  bottom: -9px;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
}

.bubble::before {
  background: var(--line);
}

.bubble::after {
  bottom: -5px;
  background: var(--panel);
}

.avatar {
  margin-left: 6px;
  color: var(--on-brand);
}

/* Pushes the composer and save row to the bottom of the screen. */
.analysis__spacer {
  flex: 1;
  min-height: 12px;
}

.composer {
  border-radius: var(--radius-pill);
  padding-right: 6px;
}

.save-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.save-row__name {
  flex: 1;
  min-height: 42px;
}

.save-row .btn {
  flex: none;
}
</style>
