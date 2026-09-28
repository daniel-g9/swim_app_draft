<template>
  <main class="screen faq">
    <h1 class="screen-title screen-title--center">FAQ</h1>

    <!-- Each entry is written out on its own so the question and the answer can
         be edited independently. Native <details> — opens and closes with no script. -->
    <ul class="faq__list">
      <li>
        <details class="faq__item">
          <summary class="faq__question">
            What kind of video should I upload?
            <svg class="faq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="3" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <p class="faq__answer">Placeholder answer text.</p>
        </details>
      </li>

      <li>
        <details class="faq__item">
          <summary class="faq__question">
            How long does an analysis take?
            <svg class="faq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="3" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <p class="faq__answer">Placeholder answer text.</p>
        </details>
      </li>

      <li>
        <details class="faq__item">
          <summary class="faq__question">
            Which strokes and turns are supported?
            <svg class="faq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="3" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <p class="faq__answer">Placeholder answer text.</p>
        </details>
      </li>

      <li>
        <details class="faq__item">
          <summary class="faq__question">
            Who can see my videos?
            <svg class="faq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="3" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <p class="faq__answer">Placeholder answer text.</p>
        </details>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.faq__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq__item {
  border: 2px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--ink);
  overflow: hidden;
}

.faq__question {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  list-style: none;
}

/* Hide the default disclosure triangle in WebKit. */
.faq__question::-webkit-details-marker {
  display: none;
}

.faq__question:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: -3px;
}

.faq__chevron {
  margin-left: auto;
  flex: none;
  transition: transform 0.18s ease;
}

.faq__item[open] .faq__chevron {
  transform: rotate(180deg);
}

.faq__answer {
  padding: 0 16px 16px;
  font-size: 15px;
  color: var(--ink-soft);
}
</style>
