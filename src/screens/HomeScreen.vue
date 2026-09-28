<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Home is a splash: it holds the title for a beat, then hands over to the
// upload screen. The cross-fade itself is the app-level <Transition> in
// App.vue — this only decides when to leave.
const HOLD_MS = 2600

let timer = null

onMounted(() => {
  timer = setTimeout(() => {
    timer = null
    // replace(), not push(), so the back button doesn't return to the splash.
    router.replace({ name: 'upload' })
  }, HOLD_MS)
})

// Leaving early via the tab bar cancels the hand-off.
onBeforeUnmount(() => {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <main class="screen home">
    <h1 class="home__title panel">Placeholder Title</h1>
  </main>
</template>

<style scoped>
.home {
  /* The title sits in the upper third, as in the wireframe. */
  justify-content: flex-start;
  align-items: center;
  padding-top: 22vh;
}

.home__title {
  max-width: 100%;
  padding: 18px 32px;
  border-radius: var(--radius-pill);
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  text-wrap: balance;
  box-shadow: 0 12px 28px rgba(8, 40, 66, 0.22);
  animation: home-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes home-rise {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home__title {
    animation: none;
  }
}
</style>
