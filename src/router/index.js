import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../App.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router