<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// What the analyser can score, grouped the way a swimmer thinks about a
// length: the four strokes, the turns between them, and the start off the
// block. Placeholders — drive the list from your data.
const TECHNIQUE_GROUPS = [
  { label: 'Strokes', options: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'] },
  { label: 'Turns', options: ['Open turn', 'Flip turn'] },
  { label: 'Starts', options: ['Dive'] },
]

const technique = ref(TECHNIQUE_GROUPS[0].options[0])

const analyzing = ref(false)
const progress = ref(0)

let timer = null

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

// Placeholder pacing: a random 2.5–6.5s run, then straight to the analysis
// screen. Swap for real progress once the backend reports it.
function analyze() {
  if (analyzing.value) return

  analyzing.value = true
  progress.value = 0

  const duration = 2500 + Math.random() * 4000
  const started = performance.now()

  timer = setInterval(() => {
    const elapsed = performance.now() - started
    progress.value = Math.min(100, Math.round((elapsed / duration) * 100))

    if (progress.value >= 100) {
      stopTimer()
      router.push({ name: 'analysis' })
    }
  }, 60)
}

onBeforeUnmount(stopTimer)
</script>

<template>
  <main class="screen upload">
    <h1 class="screen-title">Add video</h1>

    <!-- Technique picker: strokes, turns and the dive, grouped by kind. -->
    <div class="panel field">
      <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
      <label class="sr-only" for="technique">Technique</label>
      <select id="technique" v-model="technique" name="technique">
        <optgroup v-for="group in TECHNIQUE_GROUPS" :key="group.label" :label="group.label">
          <option v-for="name in group.options" :key="name">{{ name }}</option>
        </optgroup>
      </select>
      <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="3" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>

    <!-- Click or drop target. The native input handles file choice; drag-and-drop
         needs your own handlers. -->
    <label class="dropzone">
      <input class="sr-only" type="file" accept="video/*" />
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v11" />
        <path d="M7.5 10.5L12 15l4.5-4.5" />
        <path d="M4 18.5h16" />
      </svg>
      <span class="dropzone__hint">Insert file here</span>
    </label>

    <!-- Status only: the app ticks these, the swimmer can't. -->
    <section class="checks">
      <h2 class="checks__title">Checking video…</h2>

      <p class="check-row check-row--static">
        Clear enough?
        <input class="checkbox" type="checkbox" disabled />
      </p>

      <p class="check-row check-row--static">
        Right setting?
        <input class="checkbox" type="checkbox" disabled />
      </p>
    </section>

    <button class="btn upload__go" type="button" :disabled="analyzing" @click="analyze">
      {{ analyzing ? 'Analyzing…' : 'Analyze' }}
    </button>

    <div v-if="analyzing" class="progress">
      <div class="progress__track" role="progressbar" aria-label="Analyzing video"
           :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="progress__fill" :style="{ width: progress + '%' }" />
      </div>
      <p class="progress__label">{{ progress }}%</p>
    </div>
  </main>
</template>

<style scoped>
.upload {
  gap: 18px;
}

.dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 150px;
  padding: 22px;
  border-radius: var(--radius-md);
  background: var(--panel-mute);
  color: var(--ink-soft);
  cursor: pointer;
  transition: filter 0.15s ease;
}

/* Dashed inner rule, inset from the fill's edge. */
.dropzone::before {
  content: '';
  position: absolute;
  inset: 7px;
  border: 2px dashed rgba(17, 19, 24, 0.38);
  border-radius: var(--radius-sm);
  pointer-events: none;
}

.dropzone:hover {
  filter: brightness(1.04);
}

.dropzone:focus-within {
  outline: 3px solid var(--on-brand);
  outline-offset: 2px;
}

.dropzone__hint {
  font-size: 13px;
}

.checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checks__title {
  font-size: 19px;
  color: var(--on-brand);
}

.upload__go {
  align-self: center;
  min-width: 150px;
  border-radius: var(--radius-pill);
}

.upload__go:disabled {
  cursor: default;
  filter: none;
  opacity: 0.75;
}

.upload__go:disabled:active {
  transform: none;
}

/* Analysis progress — shown only while a run is in flight. */
.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress__track {
  flex: 1;
  height: 14px;
  overflow: hidden;
  border: 2px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--panel);
}

.progress__fill {
  height: 100%;
  border-radius: inherit;
  background: var(--line);
  transition: width 0.12s linear;
}

.progress__label {
  flex: none;
  min-width: 42px;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--on-brand);
}
</style>
