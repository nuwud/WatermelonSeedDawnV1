import { createApp } from 'vue'
import App from './App.vue'

// ✅ Metafield JSON bridge from theme.liquid
const raw = document.getElementById('metafields')?.textContent
const metafields = raw ? JSON.parse(raw) : {}

console.log('🍉 Metafields loaded:', metafields)

createApp(App, { metafields }).mount('#app')
