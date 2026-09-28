<script setup>
import BackgroundToggle from './components/BackgroundToggle.vue'
import TabBar from './components/TabBar.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="screen-fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <BackgroundToggle />
  <TabBar />
</template>
