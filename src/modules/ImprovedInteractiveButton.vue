<template>
  <group :position="buttonPosition" ref="buttonGroup">
    <!-- Main button mesh with raymarched cube effect -->
    <mesh
      @click="handleClick"
      @pointerover="handlePointerOver"
      @pointerout="handlePointerOut"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      ref="buttonMesh"
    >
      <!-- Using a custom shader material to recreate the raymarched cube effect -->
      <boxGeometry :args="[1.2, 1.2, 1.2]" />
      <shaderMaterial 
        :vertexShader="vertexShader" 
        :fragmentShader="fragmentShader" 
        :uniforms="uniforms"
        transparent
      />
    </mesh>
    
    <!-- Energy beam underneath -->
    <mesh :position="[0, -1.0, 0]" :scale="beamScale" ref="beam">
      <cylinderGeometry :args="[0.1, 0.3, 1.0, 8]" />
      <meshBasicMaterial :color="beamColor" :transparent="true" :opacity="beamOpacity" />
    </mesh>
    
    <!-- Orbiting particles -->
    <group ref="particleGroup">
      <template v-for="(particle, i) in particles" :key="i">
        <mesh :position="particle.position" :scale="particle.scale">
          <sphereGeometry :args="[0.08, 8, 8]" />
          <meshBasicMaterial :color="particle.color" :transparent="true" :opacity="0.8" />
        </mesh>
      </template>
    </group>
  </group>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Vector3 } from 'three'

export default {
  name: 'ImprovedInteractiveButton',
  
  props: {
    // Button position can be customized
    position: {
      type: Object,
      default: () => ({ x: 4, y: -3, z: 0 })
    },
    // Primary color can be customized
    color: {
      type: String,
      default: '#66ccff'
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit }) {
    // Button position
    const buttonPosition = reactive({
      x: props.position.x,
      y: props.position.y,
      z: props.position.z
    })
    
    // Button state
    const isHovered = ref(false)
    const isPressed = ref(false)
    const buttonMesh = ref(null)
    const buttonGroup = ref(null)
    const particleGroup = ref(null)
    const beam = ref(null)
    
    // Convert hex color to RGB for shader
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      ] : [0, 0.4, 0.8]
    }
    
    // Dynamic colors
    const primaryColor = computed(() => props.color)
    const primaryColorRGB = computed(() => hexToRgb(primaryColor.value))
    const secondaryColorRGB = computed(() => {
      const rgb = [...primaryColorRGB.value]
      // Create a darker version for secondary color
      return rgb.map(c => Math.max(0, c - 0.3))
    })
    
    const beamColor = computed(() => isHovered.value ? lightenHexColor(primaryColor.value, 20) : primaryColor.value)
    const beamOpacity = ref(0.7)
    const beamScale = reactive({ x: 0.5, y: 1, z: 0.5 })
    
    // Function to lighten hex color
    function lightenHexColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1)
    }
    
    // Spring animation values for smooth movement
    const spring = reactive({
      velocity: 0,
      target: 1.0,
      current: 1.0,
      stiffness: 0.08,
      damping: 0.75
    })
    
    // Create particles around the button
    const particles = reactive(Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 1.5
      return {
        position: new Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ),
        basePosition: new Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ),
        color: i % 3 === 0 ? lightenHexColor(primaryColor.value, 20) : 
               (i % 3 === 1 ? primaryColor.value : darkenHexColor(primaryColor.value, 20)),
        speed: 0.3 + Math.random() * 0.3,
        scale: new Vector3(1, 1, 1)
      }
    }))
    
    // Function to darken hex color
    function darkenHexColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) - amt
      const G = (num >> 8 & 0x00FF) - amt
      const B = (num & 0x0000FF) - amt
      return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1)
    }
    
    // Watch for color prop changes
    watch(() => props.color, (newColor) => {
      updateColors(newColor)
    })
    
    // Update all colors based on primary color
    function updateColors(newColor) {
      // Update particles colors
      particles.forEach((particle, i) => {
        particle.color = i % 3 === 0 ? lightenHexColor(newColor, 20) : 
                         (i % 3 === 1 ? newColor : darkenHexColor(newColor, 20))
      })
      
      // Update uniforms for shader
      uniforms.u_color1.value = primaryColorRGB.value
      uniforms.u_color2.value = secondaryColorRGB.value
    }
    
    // Shader uniforms for the raymarched-style effect
    const uniforms = reactive({
      u_time: { value: 0 },
      u_resolution: { value: [800, 600] },
      u_hover: { value: 0 },
      u_color1: { value: primaryColorRGB.value },
      u_color2: { value: secondaryColorRGB.value }
    })
    
    // Watch for hover state changes to update shader
    watch(isHovered, (newValue) => {
      uniforms.u_hover.value = newValue ? 1.0 : 0.0
    })
    
    // Vertex shader - passes vertices through
    const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    
    // Fragment shader that mimics the raymarched cube effect from CodePen
    const fragmentShader = `
      uniform float u_time;
      uniform float u_hover;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      varying vec2 vUv;

      // Smooth minimum function for blending shapes
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Smooth maximum function
      float smax(float a, float b, float k) {
        return -smin(-a, -b, k);
      }

      // SDF for a rounded cube
      float sdRoundedBox(vec3 p, vec3 b, float r) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
      }

      // Main fragment shader
      void main() {
        // Convert UVs to centered coordinates
        vec2 uv = vUv * 2.0 - 1.0;
        
        // Create a simple raymarching setup
        vec3 ro = vec3(0.0, 0.0, 3.0 - u_hover * 0.5); // Ray origin (camera position)
        vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction
        
        float t = 0.0; // Ray distance
        float d = 0.0; // SDF value
        vec3 p = ro; // Current point
        
        // Animation parameters
        float time = u_time * 0.5;
        float wobble = sin(time) * 0.1;
        
        // Simple raymarching loop
        for (int i = 0; i < 32; i++) {
          p = ro + rd * t;
          
          // Rotating cube with smooth edges
          vec3 q = p;
          q.x = p.x * cos(time) - p.z * sin(time);
          q.z = p.x * sin(time) + p.z * cos(time);
          q.y = p.y * cos(time * 0.7) - p.z * sin(time * 0.7);
          q.z = p.y * sin(time * 0.7) + p.z * cos(time * 0.7);
          
          // Create primary cube
          float cube1 = sdRoundedBox(q, vec3(0.8 + wobble), 0.1);
          
          // Secondary cube for smooth blending (union effect)
          float cube2 = sdRoundedBox(q + vec3(sin(time * 0.8) * 0.5, cos(time * 0.5) * 0.5, 0.0), 
                                vec3(0.4 + wobble * 0.5), 0.05);
          
          // Blend the cubes with smooth minimum
          d = smin(cube1, cube2, 0.5);
          
          if (d < 0.001) break; // Hit something
          t += d * 0.5; // Step along the ray
          
          if (t > 10.0) break; // Missed everything
        }
        
        // Coloring and shading
        vec3 color = mix(u_color1, u_color2, 0.5 + 0.5 * sin(time + p.x * 2.0));
        
        // Add glow
        float glow = 0.02 / (0.01 + d * d);
        color += glow * mix(u_color2, vec3(1.0), 0.5);
        
        // Edge highlighting
        if (d < 0.02) {
          color += vec3(1.0, 1.0, 1.0) * (1.0 - d / 0.02);
        }
        
        // Add pulsing edge effect
        float pulse = 0.5 + 0.5 * sin(time * 3.0);
        color += vec3(u_color1) * pulse * glow * 0.5;
        
        // Apply hover effect
        color = mix(color, color * 1.3, u_hover * 0.5);
        
        // Assign the final color with transparency
        float alpha = min(1.0, glow * 2.0);
        if (d < 0.001) alpha = 1.0; // Solid for the actual cube
        
        gl_FragColor = vec4(color, alpha);
      }
    `
    
    // Event handlers
    function handlePointerOver() {
      isHovered.value = true
      spring.target = 1.1
      beamOpacity.value = 0.9
    }
    
    function handlePointerOut() {
      isHovered.value = false
      spring.target = 1.0
      beamOpacity.value = 0.7
    }
    
    function handlePointerDown() {
      isPressed.value = true
      spring.target = 0.9
      beamOpacity.value = 1.0
    }
    
    function handlePointerUp() {
      isPressed.value = false
      spring.target = isHovered.value ? 1.1 : 1.0
      beamOpacity.value = isHovered.value ? 0.9 : 0.7
    }
    
    function handleClick() {
      // Emit click event
      emit('click')
      
      // Add pulse animation
      spring.velocity += 0.5
      
      // Pulse the beam
      beamOpacity.value = 1.0
      setTimeout(() => {
        beamOpacity.value = isHovered.value ? 0.9 : 0.7
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
        buttonPosition.x = props.position.x * 0.7
        buttonPosition.y = props.position.y * 0.8
      } else if (aspectRatio > 2) {
        // Ultrawide monitors
        buttonPosition.x = props.position.x * 1.5
        buttonPosition.y = props.position.y * 1.2
      } else {
        // Standard desktop - use props as is
        buttonPosition.x = props.position.x
        buttonPosition.y = props.position.y
      }
    }
    
    // Animation variables
    let animationFrameId = null
    let time = 0
    
    // Animation loop function
    const animate = () => {
      time += 0.016 // Approximately 60fps
      
      // Update uniforms for the shader
      uniforms.u_time.value = time
      
      // Update spring physics
      spring.velocity += (spring.target - spring.current) * spring.stiffness
      spring.velocity *= spring.damping
      spring.current += spring.velocity
      
      // Apply springy scale
      if (buttonMesh.value?.scale) {
        buttonMesh.value.scale.set(spring.current, spring.current, spring.current)
      }
      
      // Animate the beam
      if (beam.value) {
        const pulseScale = 1.0 + 0.1 * Math.sin(time * 3)
        beamScale.y = pulseScale
        beamScale.x = beamScale.z = 0.5 - 0.05 * Math.sin(time * 5)
      }
      
      // Gentle floating animation
      if (buttonGroup.value) {
        buttonGroup.value.position.y = buttonPosition.y + Math.sin(time * 1.5) * 0.1
        buttonGroup.value.rotation.z = Math.sin(time * 0.8) * 0.05
      }
      
      // Animate particles
      if (particleGroup.value) {
        particles.forEach((particle, i) => {
          // Orbit around the button
          const angle = time * particle.speed + (i / particles.length) * Math.PI * 2
          particle.position.x = particle.basePosition.x * Math.cos(angle) - particle.basePosition.y * Math.sin(angle)
          particle.position.y = particle.basePosition.x * Math.sin(angle) + particle.basePosition.y * Math.cos(angle)
          
          // Add subtle z movement
          particle.position.z = Math.sin(time * 2 + i) * 0.2
          
          // Pulse the particle size
          const pulseScale = 0.8 + 0.4 * Math.sin(time * 2 + i * 0.5)
          particle.scale.x = particle.scale.y = particle.scale.z = pulseScale
        })
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    onMounted(() => {
      // Set initial resolution
      uniforms.u_resolution.value = [window.innerWidth, window.innerHeight]
      
      // Update position based on screen size
      updatePosition()
      window.addEventListener('resize', () => {
        updatePosition()
        uniforms.u_resolution.value = [window.innerWidth, window.innerHeight]
      })
      
      // Start animation
      animate()
      
      // Read button color from metafields if available
      try {
        const metafields = JSON.parse(document.getElementById('metafields')?.textContent || '{}')
        if (metafields.button_color) {
          updateColors(metafields.button_color)
        }
      } catch (error) {
        console.error('Error reading metafields:', error)
      }
    })
    
    // Cleanup on unmount
    onUnmounted(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('resize', updatePosition)
    })
    
    return {
      buttonPosition,
      buttonMesh,
      buttonGroup,
      beam,
      beamColor,
      beamOpacity,
      beamScale,
      particleGroup,
      particles,
      isHovered,
      isPressed,
      uniforms,
      spring,
      vertexShader,
      fragmentShader,
      handlePointerOver,
      handlePointerOut,
      handlePointerDown,
      handlePointerUp,
      handleClick
    }
  }
}
</script>