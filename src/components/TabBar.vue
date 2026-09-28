<!-- Bottom tab bar: add video / AI analysis / profile / help. -->
<template>
  <nav class="tabbar" aria-label="Main">
    <RouterLink class="tabbar__link" to="/upload">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span class="sr-only">Add video</span>
    </RouterLink>

    <RouterLink class="tabbar__link" to="/analysis">
      <!-- Robot, not a camera: this tab is the AI coach, not another upload. -->
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.2" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="7" width="17" height="12.5" rx="3" />
        <path d="M12 3.2v3.8" />
        <circle cx="12" cy="2.6" r="1.1" fill="currentColor" />
        <path d="M8.6 12.2v2.2M15.4 12.2v2.2" stroke-width="2.6" stroke-linecap="round" />
        <path d="M1.5 12v3M22.5 12v3" stroke-linecap="round" />
      </svg>
      <span class="sr-only">AI analysis</span>
    </RouterLink>

    <RouterLink class="tabbar__link" to="/profile">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="7.5" r="4.2" />
        <path d="M3.8 20.5c0-4.1 3.7-6.6 8.2-6.6s8.2 2.5 8.2 6.6z" />
      </svg>
      <span class="sr-only">Profile</span>
    </RouterLink>

    <RouterLink class="tabbar__link" to="/faq">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" />
        <path d="M9.3 9.2a2.8 2.8 0 1 1 3.4 2.9v1.6" />
        <path d="M12.1 17.1h.01" stroke-width="2.8" />
      </svg>
      <span class="sr-only">FAQ</span>
    </RouterLink>
  </nav>
</template>
