/**
 * router.js — Vue Router config. Routes: / (Home), /learn (Learn), /advise (Advise).
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import LearnView from './views/LearnView.vue'
import AdviseView from './views/AdviseView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/learn', name: 'learn', component: LearnView },
  { path: '/advise', name: 'advise', component: AdviseView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
