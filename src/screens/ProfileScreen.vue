<script setup>
import AnalysisThumb from '../components/AnalysisThumb.vue'

// Stand-in for the saved analyses the app will load per user. The template
// renders one .analysis-card per entry, so this list is the only thing to
// swap once storage is real. `technique` holds whatever was picked on the
// upload screen — a stroke, a turn or the dive.
const analyses = [
  {
    id: 1,
    title: 'Previous analysis 1',
    date: '12 Sep',
    technique: 'Freestyle',
    improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
  },
  {
    id: 2,
    title: 'Previous analysis 2',
    date: '8 Sep',
    technique: 'Flip turn',
    improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
  },
  {
    id: 3,
    title: 'Previous analysis 3',
    date: '2 Sep',
    technique: 'Breaststroke',
    improvements: ['Improvement 1', 'Improvement 2'],
  },
  {
    id: 4,
    title: 'Previous analysis 4',
    date: '26 Aug',
    technique: 'Dive',
    improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
  },
  {
    id: 5,
    title: 'Previous analysis 5',
    date: '19 Aug',
    technique: 'Open turn',
    improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
  },
]
</script>

<template>
  <main class="screen screen--flush profile">
    <!-- Full-bleed white band, as in the wireframe — now with an avatar and a
         one-line summary of what's saved below. -->
    <header class="profile__header">
      <span class="profile__avatar" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8.4" r="4" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      </span>
      <h1 class="profile__name">Profile name</h1>
      <p class="profile__meta">{{ analyses.length }} saved analyses</p>
    </header>

    <div class="profile__body">
      <h2 class="profile__section">Previous analyses</h2>

      <!-- One saved analysis per card: still frame on the left, its
           improvement checklist on the right. -->
      <article v-for="(item, i) in analyses" :key="item.id" class="analysis-card">
        <header class="analysis-card__head">
          <h3 class="analysis-card__title">{{ item.title }}</h3>
          <span class="analysis-card__date">{{ item.date }}</span>
        </header>

        <div class="analysis-card__row">
          <AnalysisThumb :variant="i" :label="`Still from ${item.title}`" />

          <div class="analysis-card__detail">
            <p class="analysis-card__technique">{{ item.technique }}</p>

            <ul class="improvements">
              <li v-for="(text, n) in item.improvements" :key="n">
                <label class="improvement">
                  <span class="improvement__text">{{ text }}</span>
                  <input class="checkbox checkbox--sm" type="checkbox" />
                </label>
              </li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.profile {
  gap: 0;
  padding-top: 0;
}

.profile__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  color: var(--ink);
  padding: 26px 22px 24px;
  text-align: center;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  box-shadow: 0 10px 24px rgba(8, 40, 66, 0.18);
}

.profile__avatar {
  display: grid;
  place-content: center;
  width: 62px;
  height: 62px;
  border-radius: var(--radius-pill);
  border: 2px solid var(--line);
  background: var(--panel-mute);
  color: var(--ink);
}

.profile__name {
  font-size: 19px;
  font-weight: 600;
}

.profile__meta {
  font-size: 13px;
  color: var(--ink-soft);
}

.profile__body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile__section {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--on-brand);
  opacity: 0.9;
}

.analysis-card {
  padding: 14px;
  border-radius: var(--radius-lg);
  /* Frosted white rather than flat grey, so the brand gradient shows through. */
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink);
  box-shadow: 0 10px 22px rgba(8, 40, 66, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(8, 40, 66, 0.26);
}

.analysis-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.analysis-card__title {
  font-size: 16px;
  font-weight: 700;
}

.analysis-card__date {
  flex: none;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: rgba(17, 19, 24, 0.08);
  color: var(--ink-soft);
}

/* Picture left, checklist right. */
.analysis-card__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.analysis-card__detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-card__technique {
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
}

.improvements {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Right-aligned rows, matching the wireframe's indented list. */
.improvement {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.12s ease;
}

.improvement:hover {
  background: rgba(17, 19, 24, 0.06);
}

/* Ticked-off items fade back, so what's left to work on reads first. */
.improvement:has(.checkbox:checked) .improvement__text {
  color: var(--ink-soft);
  text-decoration: line-through;
}

.improvement__text {
  text-align: right;
}

.checkbox--sm {
  width: 15px;
  height: 15px;
  border-width: 1.5px;
}

.checkbox--sm::after {
  width: 7px;
  height: 4px;
  border-left-width: 2px;
  border-bottom-width: 2px;
}
</style>
