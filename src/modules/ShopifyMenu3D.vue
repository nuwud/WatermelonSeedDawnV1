<template>
  <group ref="menuGroup">
    <!-- Menu Title -->
    <Text3D
      v-if="fontLoaded"
      :position="[0, 3, 0]"
      :font="font"
      :size="0.5"
      :height="0.1"
      :curveSegments="12"
    >
      <meshPhongMaterial :color="'#ffffff'" :emissive="'#66ccff'" :emissiveIntensity="0.5" />
      Shop
    </Text3D>
    
    <!-- Menu Items -->
    <group v-for="(item, i) in menuItems" :key="i">
      <group 
        :position="getItemPosition(i)" 
        @click="navigateTo(item.url)"
        @pointerover="handleItemHover(i, true)"
        @pointerout="handleItemHover(i, false)"
        ref="itemRefs"
      >
        <!-- Text -->
        <Text3D
          v-if="fontLoaded"
          :position="[0, 0, 0]"
          :font="font"
          :size="0.25"
          :height="0.05"
          :curveSegments="4"
        >
          <meshPhongMaterial :color="item.hovered ? '#66ccff' : '#ffffff'" :emissive="'#003344'" :emissiveIntensity="0.3" />
          {{ item.label }}
        </Text3D>
        
        <!-- Fallback plane for text (used before font loads) -->
        <mesh v-else :position="[0, 0, 0]">
          <planeGeometry :args="[2, 0.5]" />
          <meshBasicMaterial :color="item.hovered ? '#66ccff' : '#ffffff'" />
        </mesh>
        
        <!-- Icon -->
        <mesh :position="[-1, 0, 0]" :scale="item.iconScale">
          <boxGeometry :args="[0.3, 0.3, 0.3]" />
          <meshPhongMaterial :color="item.iconColor" :emissive="item.iconColor" :emissiveIntensity="0.3" />
        </mesh>
      </group>
    </group>
  </group>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { Vector3 } from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Text3D from './Text3D.vue' // Fixed import - no curly braces

// Font loading
const font = ref(null)
const fontLoaded = ref(false)

// Menu items for Shopify
const menuItems = reactive([
  { 
    label: 'All Products', 
    url: '/collections/all', 
    hovered: false,
    iconColor: '#ff9966',
    iconScale: { x: 1, y: 1, z: 1 },
    spring: { velocity: 0, target: 0, current: 0 }
  },
  { 
    label: 'Home', 
    url: '/', 
    hovered: false,
    iconColor: '#66ccff',
    iconScale: { x: 1, y: 1, z: 1 },
    spring: { velocity: 0, target: 0, current: 0 }
  },
  { 
    label: 'Cart', 
    url: '/cart', 
    hovered: false,
    iconColor: '#99ff99',
    iconScale: { x: 1, y: 1, z: 1 },
    spring: { velocity: 0, target: 0, current: 0 }
  },
  { 
    label: 'Account', 
    url: '/account', 
    hovered: false,
    iconColor: '#ff99cc',
    iconScale: { x: 1, y: 1, z: 1 },
    spring: { velocity: 0, target: 0, current: 0 }
  },
  { 
    label: 'Search', 
    url: '/search', 
    hovered: false,
    iconColor: '#ffff99',
    iconScale: { x: 1, y: 1, z: 1 },
    spring: { velocity: 0, target: 0, current: 0 }
  }
])

const menuGroup = ref(null)
const itemRefs = ref([])

// Load font
function loadFont() {
  const loader = new FontLoader()
  // Use full asset URL with Shopify's asset_url filter 
  // This will be available through window.themeAssetURLs if you add it to theme.liquid
  const fontUrl = window.themeAssetURLs?.helvetikerFont || '/helvetiker_regular.typeface.json'
  
  loader.load(fontUrl, (loadedFont) => {
    font.value = loadedFont
    fontLoaded.value = true
  })
}

// Calculate positions in a vertical list
function getItemPosition(index) {
  return [0, 2 - index * 0.8, 0]
}

// Event handlers
function handleItemHover(index, isHovered) {
  menuItems[index].hovered = isHovered
  menuItems[index].spring.target = isHovered ? 1.3 : 1.0
}

// Navigation
function navigateTo(url) {
  window.location.href = url
}

// Animation variables
let animationFrameId = null
let time = 0

// Animation loop for floating effect and spring physics
const animate = () => {
  time += 0.016 // Approximately 60fps
  
  // Gentle floating animation for the entire menu
  if (menuGroup.value) {
    menuGroup.value.position.y = Math.sin(time * 0.5) * 0.05
    menuGroup.value.rotation.y = Math.sin(time * 0.3) * 0.03
  }
  
  // Update spring physics for each menu item
  menuItems.forEach((item, i) => {
    // Update spring values
    item.spring.velocity += (item.spring.target - item.spring.current) * 0.1
    item.spring.velocity *= 0.8
    item.spring.current += item.spring.velocity
    
    // Apply scale
    item.iconScale.x = item.iconScale.y = item.iconScale.z = item.spring.current
    
    // Extra floating effect per item
    if (itemRefs.value[i]) {
      itemRefs.value[i].position.y += Math.sin(time * (1 + i * 0.1) + i) * 0.0015
    }
  })
  
  animationFrameId = requestAnimationFrame(animate)
}

// Staggered entrance animation on mount
onMounted(() => {
  menuItems.forEach((item, i) => {
    // Start all items shrunken
    item.iconScale.x = item.iconScale.y = item.iconScale.z = 0.01
    
    // Staggered animation
    setTimeout(() => {
      item.spring.target = 1.0
      item.spring.velocity = 0.2
    }, i * 100)
  })
  
  // Load font
  loadFont()
  
  // Start animation
  animate()
})

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>