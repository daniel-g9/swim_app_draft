// Routing only — no screen behaviour lives here.
import { createRouter, createWebHistory } from 'vue-router'

import AboutScreen from '../screens/AboutScreen.vue'
import AnalysisScreen from '../screens/AnalysisScreen.vue'
import FaqScreen from '../screens/FaqScreen.vue'
import HomeScreen from '../screens/HomeScreen.vue'
import ProfileScreen from '../screens/ProfileScreen.vue'
import UploadScreen from '../screens/UploadScreen.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeScreen },
    { path: '/upload', name: 'upload', component: UploadScreen },
    { path: '/analysis', name: 'analysis', component: AnalysisScreen },
    { path: '/about', name: 'about', component: AboutScreen },
    { path: '/faq', name: 'faq', component: FaqScreen },
    { path: '/profile', name: 'profile', component: ProfileScreen },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
