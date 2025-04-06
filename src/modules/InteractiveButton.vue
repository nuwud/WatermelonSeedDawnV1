<template>
  <group :position="buttonPosition" ref="buttonGroup">
    <mesh
      @click="handleClick"
      @pointerover="handlePointerOver"
      @pointerout="handlePointerOut"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      ref="buttonMesh"
    >
      <sphereGeometry :args="[0.6, 32, 32]" />
      <meshPhysicalMaterial 
        :color="buttonColor" 
        :roughness="0.2"
        :metalness="0.8"
        :clearcoat="1.0"
        :clearcoatRoughness="0.1"
      />
    </mesh>
    
    <!-- Inner glowing core -->
    <mesh :scale="innerScale">
      <sphereGeometry :args="[0.4, 24, 24]" />
      <meshBasicMaterial :color="innerColor" :transparent="true" :opacity="innerOpacity" />
    </mesh>
    
    <!-- Particles orbiting around the button -->
    <group ref="particleGroup">
      <template v-for="(particle, i) in particles" :key="i">
        <mesh :position="particle.position">
          <sphereGeometry :args="[0.05, 8, 8]" />
          <meshBasicMaterial :color="particle.color" :transparent="true" :opacity="0.7" />
        </mesh>
      </template>
    </group>
  </group>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { Vector3, MathUtils } from 'three'

const emit = defineEmits(['click'])

// Responsive positioning based on screen size
const buttonPosition = reactive({
  x: 4, // Default position - will be adjusted
  y: -3,
  z: 0
})

// Button state
const isHovered = ref(false)
const isPressed = ref(false)
const innerScale = ref(0.9)
const innerOpacity = ref(0.6)
const buttonMesh = ref(null)
const buttonGroup = ref(null)
const particleGroup = ref(null)

// Dynamic colors
const buttonColor = computed(() => isHovered.value ? '#66ccff' : '#115577')
const innerColor = computed(() => isHovered.value ? '#99eeff' : '#66ccff')

// Spring animation values
const spring = reactive({
  velocity: 0,
  target: 0,
  current: 0,
  stiffness: 0.05,
  damping: 0.5
})

// Particle system
const particles = reactive(Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  return {
    position: new Vector3(
      Math.cos(angle) * 0.8,
      Math.sin(angle) * 0.8,
      0
    ),
    basePosition: new Vector3(
      Math.cos(angle) * 0.8,
      Math.sin(angle) * 0.8,
      0
    ),
    color: i % 2 === 0 ? '#99eeff' : '#66ccff',
    speed: 0.5 + Math.random() * 0.5
  }
}))

// Event handlers
function handlePointerOver() {
  isHovered.value = true
  spring.target = 1.2
}

function handlePointerOut() {
  isHovered.value = false
  spring.target = 1.0
}

function handlePointerDown() {
  isPressed.value = true
  spring.target = 0.9
}

function handlePointerUp() {
  isPressed.value = false
  spring.target = isHovered.value ? 1.2 : 1.0
}

function handleClick() {
  // Emit click event
  emit('click')
  
  // Add pulse animation
  spring.velocity += 0.5
  
  // Glow effect
  innerScale.value = 1.2
  innerOpacity.value = 0.9
  
  // Reset after pulse
  setTimeout(() => {
    innerScale.value = 0.9
    innerOpacity.value = 0.6
  }, 300)
}

// Adjust position based on screen size
function updatePosition() {
  const width = window.innerWidth
  const height = window.innerHeight
  
  // Calculate position based on aspect ratio
  const aspectRatio = width / height
  
  if (width < 768) {
    // Mobile positioning
    buttonPosition.x = 2.8
    buttonPosition.y = -2.5
  } else if (aspectRatio > 2) {
    // Ultrawide monitors (like 49")
    buttonPosition.x = 7
    buttonPosition.y = -3.5
  } else {
    // Standard desktop
    buttonPosition.x = 5
    buttonPosition.y = -3
  }
}

// Animation variables
let animationFrameId = null
let time = 0

// Animation loop function
const animate = () => {
  time += 0.016 // Approximately 60fps
  
  // Update spring physics
  spring.velocity += (spring.target - spring.current) * spring.stiffness
  spring.velocity *= spring.damping
  spring.current += spring.velocity
  
  // Apply springy scale
  if (buttonMesh.value?.scale) {
    buttonMesh.value.scale.set(spring.current, spring.current, spring.current)
  }
  
  // Gentle floating animation
  if (buttonGroup.value) {
    buttonGroup.value.position.y += Math.sin(time * 2) * 0.002
    buttonGroup.value.rotation.z = Math.sin(time * 0.5) * 0.03
  }
  
  // Animate particles
  if (particleGroup.value) {
    particles.forEach((particle, i) => {
      // Orbit around the button
      const angle = time * particle.speed + (i / particles.length) * Math.PI * 2
      particle.position.x = particle.basePosition.x * Math.cos(angle) - particle.basePosition.y * Math.sin(angle)
      particle.position.y = particle.basePosition.x * Math.sin(angle) + particle.basePosition.y * Math.cos(angle)
      
      // Add subtle up/down movement
      particle.position.z = Math.sin(time * 3 + i) * 0.1
    })
  }
  
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  updatePosition()
  window.addEventListener('resize', updatePosition)
  
  // Start animation
  animate()
})

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', updatePosition)
})
</script>