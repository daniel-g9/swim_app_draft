<script setup>
import VideoPlaceholder from '../components/VideoPlaceholder.vue'
</script>

<template>
  <main class="screen about">
    <h1 class="screen-title screen-title--center">About app</h1>

    <p class="about__body">
      A bunch of text explaining how it works. Record a length, upload it, and say
      what to look at — a stroke, an open or flip turn, or your dive off the block.
      The app breaks it down frame by frame, then tells you the one thing to change
      next session.
    </p>

    <VideoPlaceholder class="about__video" />
  </main>
</template>

<style scoped>
.about {
  gap: 26px;
  align-items: center;
}

.about__body {
  max-width: 30ch;
  text-align: center;
  font-size: 18px;
  line-height: 1.5;
  color: var(--on-brand);
}

.about__video {
  width: 100%;
  margin-top: auto;
}
</style>
