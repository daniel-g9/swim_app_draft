<!-- Still frame standing in for a saved analysis' video. Swap the <svg> for a
     real poster image when uploads are wired up; .thumb keeps the 4:3 box.
     `variant` just shifts the water hue so a list of cards reads as distinct. -->
<script setup>
const props = defineProps({
  variant: { type: Number, default: 0 },
  label: { type: String, default: 'Analysis still' },
})

// Gradients need ids unique to the document, and several thumbs share a page.
const uid = `thumb-${Math.random().toString(36).slice(2, 9)}`

// Water tints, cycled by `variant`: [top, bottom].
const TINTS = [
  ['#7fd2f2', '#2d86c9'],
  ['#8fe0dd', '#2f9bb4'],
  ['#9ad8f7', '#3f77c4'],
  ['#77c9e8', '#2b6fb0'],
]

const tint = TINTS[props.variant % TINTS.length]
</script>

<template>
  <figure class="thumb">
    <svg class="thumb__art" viewBox="0 0 120 90" role="img" :aria-label="label">
      <defs>
        <linearGradient :id="`${uid}-water`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="tint[0]" />
          <stop offset="100%" :stop-color="tint[1]" />
        </linearGradient>
      </defs>

      <rect width="120" height="90" :fill="`url(#${uid}-water)`" />

      <!-- Lane ropes. -->
      <g stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round"
         stroke-dasharray="7 6">
        <path d="M0 22h120" />
        <path d="M0 68h120" />
      </g>

      <!-- Wake behind the swimmer. -->
      <g fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2.6" stroke-linecap="round">
        <path d="M14 56q10-7 20 0t20 0" />
        <path d="M22 64q9-6 18 0" />
      </g>

      <!-- Swimmer mid-stroke: trailing arm, head, body, kicking legs. -->
      <g fill="#0d1117">
        <path d="M64 42q9-9 19-4l-3 6q-7-3-13 3z" />
        <circle cx="60" cy="48" r="7" />
        <path d="M52 50q-14 3-24 9 11 5 24 1 7-2 10-6z" />
        <path d="M30 57q-9 4-14 11l5 3q5-6 12-9z" />
      </g>
    </svg>
  </figure>
</template>

<style scoped>
.thumb {
  flex: none;
  width: 92px;
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #cfe9f7;
  box-shadow: 0 4px 10px rgba(8, 40, 66, 0.18);
}

.thumb__art {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
}
</style>
