<!-- Poster artwork standing in for a real <video>. Swap the <svg> for the
     player when you wire playback up; .video-frame keeps the 16:10 box. -->
<template>
  <figure class="video-frame">
    <svg class="poster" viewBox="0 0 320 200" role="img" aria-label="Video placeholder">
      <defs>
        <linearGradient id="vp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bfe6fb" />
          <stop offset="100%" stop-color="#e8f6fd" />
        </linearGradient>
      </defs>

      <rect width="320" height="200" fill="url(#vp-sky)" />

      <g fill="#ffffff">
        <ellipse cx="86" cy="52" rx="26" ry="15" />
        <ellipse cx="106" cy="45" rx="18" ry="13" />
        <ellipse cx="228" cy="42" rx="22" ry="13" />
        <ellipse cx="246" cy="36" rx="15" ry="11" />
      </g>

      <path d="M0 150 Q 70 96 140 138 T 320 120 V200 H0 Z" fill="#7cc36a" />
      <path d="M0 168 Q 96 128 190 160 T 320 146 V200 H0 Z" fill="#5fae53" />
      <path d="M0 200 V182 Q 120 160 320 178 V200 Z" fill="#4c9845" />
    </svg>

    <!-- Static scrub bar; hook it to the player's timeupdate later. -->
    <div class="scrubber" aria-hidden="true">
      <span class="scrubber__time">0:00</span>
      <span class="scrubber__track"><span class="scrubber__fill" /></span>
      <span class="scrubber__time">0:42</span>
    </div>
  </figure>
</template>

<style scoped>
.video-frame {
  position: relative;
  margin: 0;
  border: 2px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #cfe9f7;
}

.poster {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
}

.scrubber {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.scrubber__track {
  flex: 1;
  height: 4px;
  border-radius: var(--radius-pill);
  background: rgba(17, 19, 24, 0.22);
  overflow: hidden;
}

.scrubber__fill {
  display: block;
  width: 34%;
  height: 100%;
  border-radius: inherit;
  background: var(--ink);
}
</style>
