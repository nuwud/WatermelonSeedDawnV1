import { createApp } from 'vue'
import App from './App.vue'
import * as THREE from 'three'
import AjaxPageLoader from './modules/AjaxPageLoader'

console.log('=== Starting 3D Navigation Application ===')

// Check Three.js availability
try {
  console.log('Three.js loaded successfully:', THREE.REVISION)
} catch (error) {
  console.error('Error loading Three.js:', error)
}

// Check for settings in the DOM
let threeJsSettings = {}
try {
  if (window.threeJsSettings) {
    threeJsSettings = window.threeJsSettings
    console.log('Loaded settings from DOM:', threeJsSettings)
  } else {
    // Try to read from metafields
    const metafields = JSON.parse(document.getElementById('metafields')?.textContent || '{}')
    if (metafields) {
      console.log('Loaded settings from metafields:', metafields)
      threeJsSettings = {
        enabled: true,
        primaryColor: metafields.button_color || '#66ccff',
        backgroundColor: '#000814',
        skyballTheme: metafields.skyball_theme || 'starry',
        menuLayout: 'fanCircular',
        buttonPosition: { x: 7, y: -4, z: 0 },
        transitionDuration: 0.8,
        enableAjax: true
      }
    }
  }
} catch (error) {
  console.error('Error loading settings:', error)
  // Default settings
  threeJsSettings = {
    enabled: true,
    primaryColor: '#66ccff',
    backgroundColor: '#000814',
    skyballTheme: 'starry',
    menuLayout: 'fanCircular',
    buttonPosition: { x: 7, y: -4, z: 0 },
    transitionDuration: 0.8,
    enableAjax: true
  }
}

// Create the Vue app if 3D navigation is enabled
if (threeJsSettings.enabled !== false) {
  // Check if #app element exists
  const appElement = document.getElementById('app')
  console.log('App element exists:', !!appElement)
  
  // Add class to body for CSS targeting
  document.body.classList.add('threejs-enabled')
  
  // Create and mount app with detailed error handling
  try {
    console.log('Creating Vue app')
    const app = createApp(App)
    
    // Add settings to app
    app.config.globalProperties.$threeJsSettings = threeJsSettings
    
    // Add error handler
    app.config.errorHandler = (err, instance, info) => {
      console.error('Vue Error:', err)
      console.error('Error Info:', info)
      console.error('Component:', instance)
    }
    
    // Mount the app if container exists
    if (appElement) {
      console.log('Mounting app to #app element')
      app.mount('#app')
      console.log('App mounted successfully')
      
      // Initialize AJAX page loader if enabled
      if (threeJsSettings.enableAjax) {
        initAjaxPageLoader()
      }
    } else {
      console.error('Could not mount app: #app element not found')
    }
  } catch (error) {
    console.error('Critical error creating or mounting Vue app:', error)
  }
}

// Initialize AJAX page loader
function initAjaxPageLoader() {
  try {
    const mainContent = document.querySelector('#MainContent')
    
    if (!mainContent) {
      console.error('Could not initialize AJAX page loader: #MainContent not found')
      return
    }
    
    console.log('Initializing AJAX page loader')
    
    const pageLoader = new AjaxPageLoader({
      container: '#MainContent',
      contentSelector: '#MainContent', // Using the same element as both container and content
      loadingClass: 'is-loading',
      animationDuration: threeJsSettings.transitionDuration || 0.8,
      
      // Callbacks to integrate with 3D transitions
      onBeforePageLoad: (url) => {
        console.log('Page transition starting:', url)
        
        // Show loading indicator
        document.querySelector('.loading-indicator')?.classList.add('active')
        
        // Return promise for page transition animation
        return new Promise((resolve) => {
          // Fade out content
          const content = document.querySelector('#MainContent')
          if (content) {
            content.style.opacity = '0'
            content.style.transform = 'translateY(-30px)'
          }
          
          // Tell the 3D environment about the transition
          if (window.triggerPageTransitionOut) {
            window.triggerPageTransitionOut().then(resolve)
          } else {
            // If 3D environment not ready, resolve after delay
            setTimeout(resolve, 500)
          }
        })
      },
      
      onTransitionComplete: (url) => {
        console.log('Page transition complete:', url)
        
        // Hide loading indicator
        document.querySelector('.loading-indicator')?.classList.remove('active')
        
        // Fade in content
        const content = document.querySelector('#MainContent')
        if (content) {
          content.style.opacity = '1'
          content.style.transform = 'translateY(0)'
        }
        
        // Tell the 3D environment the transition is complete
        if (window.triggerPageTransitionIn) {
          window.triggerPageTransitionIn()
        }
        
        // Update any cart counters
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            const cartCounters = document.querySelectorAll('.cart-count')
            cartCounters.forEach(counter => {
              counter.textContent = cart.item_count
            })
          })
          .catch(error => console.error('Error updating cart count:', error))
          
        // Re-initialize Shopify theme features if available
        if (window.Shopify && window.Shopify.theme && typeof window.Shopify.theme.reinitFeatures === 'function') {
          window.Shopify.theme.reinitFeatures()
        }
      },
      
      onError: (url) => {
        console.error('Page transition error:', url)
        
        // Hide loading indicator
        document.querySelector('.loading-indicator')?.classList.remove('active')
        
        // Show content again in case of error
        const content = document.querySelector('#MainContent')
        if (content) {
          content.style.opacity = '1'
          content.style.transform = 'translateY(0)'
        }
        
        // Fallback - navigate to URL directly
        window.location.href = url
      }
    })
    
    console.log('AJAX page loader initialized successfully')
  } catch (error) {
    console.error('Error initializing AJAX page loader:', error)
  }
}