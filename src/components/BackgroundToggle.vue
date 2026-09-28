<!-- Top-right button: each tap moves the app to the next background.
     The choice is remembered on this device. -->
<script setup>
import { computed, ref, watchEffect } from 'vue'

const THEMES = [
  { id: 'blue', label: 'Blue gradient' },
  { id: 'black', label: 'All black' },
  { id: 'white', label: 'All white' },
  { id: 'green', label: 'Green gradient' },
  { id: 'purple', label: 'Purple gradient' },
  { id: 'sunset', label: 'Sunset gradient' },
]

const STORAGE_KEY = 'swim-bg'

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const i = THEMES.findIndex((t) => t.id === saved)
    return i < 0 ? 0 : i
  } catch {
    return 0
  }
}

const index = ref(loadSaved())
const current = computed(() => THEMES[index.value])
const next = computed(() => THEMES[(index.value + 1) % THEMES.length])

watchEffect(() => {
  const { id } = current.value
  // Blue is the stylesheet default, so it needs no attribute.
  if (id === 'blue') delete document.documentElement.dataset.bg
  else document.documentElement.dataset.bg = id
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage blocked — the theme still applies for this visit.
  }
})

function cycle() {
  index.value = (index.value + 1) % THEMES.length
}
</script>

<template>
  <button class="bg-toggle" type="button" :title="`Background: ${current.label}`" @click="cycle">
    <span class="bg-toggle__swatch" aria-hidden="true" />
    <span class="sr-only">Change background to {{ next.label }}</span>
  </button>
</template>
