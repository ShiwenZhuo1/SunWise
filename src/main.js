/**
 * main.js — App entry. Mounts Vue app with router and global styles.
 */
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
