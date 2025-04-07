<template>
  <group ref="menuContainer" :position="menuPosition" :visible="visible">
    <!-- Menu background panel with glass effect -->
    <mesh 
      ref="menuBackground" 
      :position="[0, 0, -0.2]" 
      :scale="[menuWidth, menuHeight, 1]"
      :visible="backgroundVisible"
    >
      <planeGeometry />
      <meshPhysicalMaterial 
        :color="backgroundColorValue" 
        :transparent="true" 
        :opacity="0.6"
        :transmission="0.2"
        :thickness="0.5"
        :clearcoat="1.0"
        :clearcoatRoughness="0.1"
        :metalness="0.2"
        :roughness="0.2"
        side="DoubleSide"
      />
    </mesh>
    
    <!-- Menu Items -->
    <group v-for="(item, i) in menuItems" :key="i" ref="itemRefs">
      <!-- Item Container -->
      <group 
        :position="getItemPosition(i)" 
        :scale="item.scale"
        @click="() => handleItemClick(item)"
        @pointerover="() => handleItemHover(i, true)"
        @pointerout="() => handleItemHover(i, false)"
      >
        <!-- Background for the menu item -->
        <mesh :position="[0, 0, 0]" :scale="[itemWidth, itemHeight, 1]">
          <planeGeometry />
          <meshPhysicalMaterial 
            :color="item.hovered ? item.hoverColor : menuItemColorValue" 
            :transparent="true" 
            :opacity="item.hovered ? 0.8 : 0.6"
            :transmission="0.1"
            :clearcoat="0.8"
          />
        </mesh>
        
        <!-- Icon -->
        <mesh :position="[-itemWidth/2 + 0.5, 0, 0.1]" :scale="item.iconScale">
          <boxGeometry :args="[0.4, 0.4, 0.1]" />
          <meshPhysicalMaterial 
            :color="item.iconColor" 
            :emissive="item.iconColor" 
            :emissiveIntensity="item.hovered ? 0.7 : 0.3"
            :clearcoat="1.0"
          />
        </mesh>
        
        <!-- Label -->
        <group :position="[0.2, 0, 0.1]">
          <mesh :scale="[itemWidth * 0.6, itemHeight * 0.6, 0.1]">
            <planeGeometry />
            <meshBasicMaterial :map="item.textTexture" transparent />
          </mesh>
        </group>
        
        <!-- Particle effects for hovered items -->
        <group v-if="item.hovered">
          <template v-for="j in 6" :key="j">
            <mesh 
              :position="[
                (Math.random() - 0.5) * itemWidth, 
                (Math.random() - 0.5) * itemHeight,
                0.05
              ]"
              :scale="[0.05, 0.05, 0.05]"
            >
              <sphereGeometry />
              <meshBasicMaterial :color="item.iconColor" :transparent="true" :opacity="0.7" />
            </mesh>
          </template>
        </group>
      </group>
    </group>
  </group>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Vector3, CanvasTexture } from 'three'

export default {
  name: 'SmoothTransitionMenu',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0, z: -10 })
    },
    layout: {
      type: String,
      default: 'fanCircular' // 'vertical', 'horizontal', 'fanCircular', 'grid'
    },
    // Primary color to match button
    primaryColor: {
      type: String,
      default: '#66ccff'
    },
    // Background color
    backgroundColor: {
      type: String,
      default: '#001133'
    },
    menuItemColor: {
      type: String,
      default: '#001836'
    }
  },
  
  emits: ['close', 'navigate'],
  
  setup(props, { emit }) {
    // Convert hex to color value
    const backgroundColorValue = computed(() => parseInt(props.backgroundColor.replace('#', '0x')))
    const menuItemColorValue = computed(() => parseInt(props.menuItemColor.replace('#', '0x')))
    
    // Refs for animation
    const menuContainer = ref(null)
    const menuBackground = ref(null)
    const itemRefs = ref([])
    const backgroundVisible = ref(false)
    
    // Menu position
    const menuPosition = reactive({
      x: props.position.x,
      y: props.position.y,
      z: props.position.z
    })
    
    // Menu dimensions
    const menuWidth = ref(8)
    const menuHeight = computed(() => menuItems.length * 1.2 + 1)
    const itemWidth = ref(6)
    const itemHeight = ref(0.8)
    
    // Create text textures
    function createTextTexture(text, color = '#aaccff') {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 128
      
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 20, canvas.height / 2)
      
      const texture = new CanvasTexture(canvas)
      texture.needsUpdate = true
      
      return texture
    }
    
    // Function to lighten or darken hex color
    function adjustColor(color, amount) {
      return '#' + color.replace('#', '').replace(/../g, color => 
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      )
    }
    
    // Menu items
    const menuItems = reactive([
      { 
        label: 'Home', 
        url: '/', 
        hovered: false,
        iconColor: props.primaryColor,
        hoverColor: adjustColor(props.primaryColor, -50),
        position: new Vector3(0, 0, 0),
        scale: new Vector3(0, 0, 0),
        iconScale: new Vector3(1, 1, 1),
        textTexture: createTextTexture('Home'),
        spring: { velocity: 0, target: 0, current: 0 }
      },
      { 
        label: 'Products', 
        url: '/collections/all', 
        hovered: false,
        iconColor: adjustColor(props.primaryColor, 100),
        hoverColor: adjustColor(adjustColor(props.primaryColor, 100), -50),
        position: new Vector3(0, 0, 0),
        scale: new Vector3(0, 0, 0),
        iconScale: new Vector3(1, 1, 1),
        textTexture: createTextTexture('Products'),
        spring: { velocity: 0, target: 0, current: 0 }
      },
      { 
        label: 'Cart', 
        url: '/cart', 
        hovered: false,
        iconColor: adjustColor(props.primaryColor, -50),
        hoverColor: adjustColor(adjustColor(props.primaryColor, -50), -50),
        position: new Vector3(0, 0, 0),
        scale: new Vector3(0, 0, 0),
        iconScale: new Vector3(1, 1, 1),
        textTexture: createTextTexture('Cart'),
        spring: { velocity: 0, target: 0, current: 0 }
      },
      { 
        label: 'Account', 
        url: '/account', 
        hovered: false,
        iconColor: adjustColor(props.primaryColor, 150),
        hoverColor: adjustColor(adjustColor(props.primaryColor, 150), -50),
        position: new Vector3(0, 0, 0),
        scale: new Vector3(0, 0, 0),
        iconScale: new Vector3(1, 1, 1),
        textTexture: createTextTexture('Account'),
        spring: { velocity: 0, target: 0, current: 0 }
      },
      { 
        label: 'Search', 
        url: '/search', 
        hovered: false,
        iconColor: adjustColor(props.primaryColor, 50),
        hoverColor: adjustColor(adjustColor(props.primaryColor, 50), -50),
        position: new Vector3(0, 0, 0),
        scale: new Vector3(0, 0, 0),
        iconScale: new Vector3(1, 1, 1),
        textTexture: createTextTexture('Search'),
        spring: { velocity: 0, target: 0, current: 0 }
      }
    ])
    
    // Watch for color prop changes
    watch(() => props.primaryColor, (newColor) => {
      updateMenuColors(newColor)
    })
    
    // Update colors based on primary color
    function updateMenuColors(color) {
      const colors = [
        color, // Primary
        adjustColor(color, 100), // Warmer
        adjustColor(color, -50), // Cooler
        adjustColor(color, 150), // Very warm
        adjustColor(color, 50)  // Slight warm
      ]
      
      menuItems.forEach((item, i) => {
        item.iconColor = colors[i % colors.length]
        item.hoverColor = adjustColor(colors[i % colors.length], -50)
        
        // Update text texture with new colors
        item.textTexture = createTextTexture(item.label, item.hovered ? '#ffffff' : '#aaccff')
      })
    }