<template>
  <group>
    <!-- Geodesic dome / skyball -->
    <mesh>
      <icosahedronGeometry :args="[10, 2]" />
      <shaderMaterial :vertexShader="vertexShader" :fragmentShader="fragmentShader" :uniforms="uniforms" side="BackSide" transparent />
    </mesh>
  </group>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, onUnmounted } from 'vue'
import { Clock } from 'three'

const props = defineProps({
  theme: {
    type: String, 
    default: 'starry'
  }
})

// Create a clock for animations
const clock = new Clock()

// Uniforms for shader
const uniforms = reactive({
  time: { value: 0 },
  resolution: { value: [window.innerWidth, window.innerHeight] },
  theme: { value: 0 }, // 0: starry, 1: sunny, 2: sunset, etc.
  flutterIntensity: { value: 0.02 },
  flutterSpeed: { value: 0.5 }
})

// Theme mapping
const themeValue = computed(() => {
  switch(props.theme) {
    case 'starry': return 0
    case 'sunny': return 1
    case 'sunset': return 2
    default: return 0
  }
})

// Update uniforms when theme changes
watch(() => props.theme, () => {
  uniforms.theme.value = themeValue.value
})

// Vertex shader with gentle flutter effect
const vertexShader = `
  uniform float time;
  uniform float flutterIntensity;
  uniform float flutterSpeed;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Flutter effect - gentle movement like a breeze
    float flutter = sin(position.x * 2.0 + time * flutterSpeed) * 
                    sin(position.y * 2.0 + time * flutterSpeed) * 
                    sin(position.z * 2.0 + time * flutterSpeed);
    
    vec3 pos = position + normal * flutter * flutterIntensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// Fragment shader for different sky themes
const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform float theme;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Starry sky function
  vec4 starry() {
    // Base dark blue color
    vec3 color = vec3(0.0, 0.02, 0.1);
    
    // Stars
    vec3 p = normalize(vPosition);
    float stars = pow(fract(sin(dot(p * 100.0, vec3(12.9898, 78.233, 45.543))) * 43758.5453), 20.0);
    
    // Occasional twinkling
    stars *= 0.8 + 0.2 * sin(time * 0.5 + p.x * 100.0);
    
    // Add stars to base color
    color += stars;
    
    // Add subtle blue nebula
    float nebula = pow(fract(sin(dot(p * 5.0, vec3(12.9898, 78.233, 45.543))) * 43758.5453), 3.0);
    color += vec3(0.0, 0.0, nebula * 0.1);
    
    return vec4(color, 0.95);
  }
  
  // Sunny sky function
  vec4 sunny() {
    vec3 p = normalize(vPosition);
    
    // Gradient from blue to lighter blue
    float gradient = smoothstep(-1.0, 1.0, p.y);
    vec3 color = mix(vec3(0.4, 0.7, 1.0), vec3(0.1, 0.4, 0.8), gradient);
    
    // Add subtle sun glow in upper hemisphere
    float sun = pow(max(0.0, dot(p, normalize(vec3(0.5, 0.8, 0.0)))), 10.0);
    color += vec3(1.0, 0.8, 0.4) * sun;
    
    // Add subtle clouds
    float clouds = pow(fract(sin(dot(p * 3.0, vec3(12.9898, 78.233, 45.543))) * 43758.5453), 5.0);
    clouds *= smoothstep(-0.2, 0.4, p.y); // Clouds mostly in the middle
    color = mix(color, vec3(1.0), clouds * 0.2);
    
    return vec4(color, 0.95);
  }
  
  // Sunset sky function
  vec4 sunset() {
    vec3 p = normalize(vPosition);
    
    // Gradient from deep orange to purple
    float gradient = smoothstep(-1.0, 1.0, p.y);
    vec3 color = mix(vec3(0.8, 0.3, 0.1), vec3(0.1, 0.1, 0.4), gradient);
    
    // Add sun glow on the horizon
    float sun = pow(max(0.0, dot(p, normalize(vec3(0.8, 0.0, 0.0)))), 10.0);
    color += vec3(1.0, 0.6, 0.2) * sun;
    
    return vec4(color, 0.95);
  }
  
  void main() {
    // Choose theme based on uniform
    vec4 color;
    if (theme < 0.5) {
      color = starry();
    } else if (theme < 1.5) {
      color = sunny();
    } else {
      color = sunset();
    }
    
    gl_FragColor = color;
  }
`

// Animation variables
let animationFrameId = null

// Use requestAnimationFrame for animation instead of useRenderLoop
const animate = () => {
  uniforms.time.value = clock.getElapsedTime()
  animationFrameId = requestAnimationFrame(animate)
}

// Handle window resize and animation lifecycle
onMounted(() => {
  window.addEventListener('resize', () => {
    uniforms.resolution.value = [window.innerWidth, window.innerHeight]
  })
  
  // Start animation
  animate()
})

// Cleanup on component unmount
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  window.removeEventListener('resize', () => {
    uniforms.resolution.value = [window.innerWidth, window.innerHeight]
  })
})
</script>