<template>
  <div ref="container" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera, cube
let animationId = null

// Set up and start animation
onMounted(() => {
  console.log('BasicThreeJS component mounted')
  
  if (container.value) {
    console.log('Container exists, setting up Three.js')
    
    // Initialize scene
    scene = new THREE.Scene()
    
    // Initialize camera
    camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    )
    camera.position.z = 5
    
    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)
    container.value.appendChild(renderer.domElement)
    
    // Create a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    
    // Add a light
    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    
    // Animation function
    const animate = () => {
      if (cube) {
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    // Start animation
    animate()
    
    console.log('Three.js setup complete')
  }
})

// Clean up resources
onUnmounted(() => {
  console.log('BasicThreeJS component unmounting')
  
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement)
    }
  }
})
</script>