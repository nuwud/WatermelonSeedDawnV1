<template>
  <div id="app">
    <!-- Three.js container for 3D navigation -->
    <div id="threejs-container" ref="threeContainer">
      <!-- Three.js scene will be rendered here -->
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import SceneManager from './modules/SceneManager'

export default {
  name: 'App',
  
  setup() {
    // Refs
    const threeContainer = ref(null)
    const sceneManager = ref(null)
    
    // Get instance to access global properties
    const instance = getCurrentInstance()
    
    onMounted(() => {
      // Get settings from global properties
      const settings = instance?.proxy?.$threeJsSettings || {
        primaryColor: '#66ccff',
        backgroundColor: '#000814',
        skyballTheme: 'starry',
        menuLayout: 'fanCircular',
        buttonPosition: { x: 7, y: -4, z: 0 },
        transitionDuration: 0.8
      }
      
      // Initialize scene manager
      if (threeContainer.value) {
        sceneManager.value = new SceneManager(threeContainer.value, settings)
        
        // Add global methods for page transitions
        window.triggerPageTransitionOut = sceneManager.value.animatePageTransitionOut
        window.triggerPageTransitionIn = sceneManager.value.animatePageTransitionIn
      }
    })
    
    onUnmounted(() => {
      // Clean up
      if (sceneManager.value) {
        sceneManager.value.dispose()
      }
      
      // Clear global references
      window.triggerPageTransitionOut = null
      window.triggerPageTransitionIn = null
    })
    
    return {
      threeContainer
    }
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
}

#threejs-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

#threejs-container canvas {
  pointer-events: auto;
}
</style>