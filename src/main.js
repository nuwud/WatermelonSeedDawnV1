import { createApp } from 'vue'
import App from './App.vue'
import * as THREE from 'three'

console.log('=== Starting application ===')

// Check Three.js availability
try {
  console.log('Three.js loaded successfully:', THREE.REVISION)
} catch (error) {
  console.error('Error loading Three.js:', error)
}

// Check if #app element exists
const appElement = document.getElementById('app')
console.log('App element exists:', !!appElement)

// Create and mount app with detailed error handling
try {
  console.log('Creating Vue app')
  const app = createApp(App)
  
  // Add error handler
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Error Info:', info)
    console.error('Component:', instance)
  }
  
  console.log('Mounting app to #app element')
  app.mount('#app')
  
  console.log('App mounted successfully')
} catch (error) {
  console.error('Critical error creating or mounting Vue app:', error)
}