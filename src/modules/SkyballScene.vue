<template>
  <div ref="container" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera
let skyball, button, menuGroup
let animationId = null
let handleResize = null
let handleMouseMove = null
let handleClick = null

// Menu state
const menuVisible = ref(false)
const menuItems = [
  { label: 'All Products', url: '/collections/all', color: '#ff9966' },
  { label: 'Home', url: '/', color: '#66ccff' },
  { label: 'Cart', url: '/cart', color: '#99ff99' },
  { label: 'Account', url: '/account', color: '#ff99cc' },
  { label: 'Search', url: '/search', color: '#ffff99' }
]

// Set up and start animation
onMounted(() => {
  console.log('SkyballScene component mounted')
  
  if (container.value) {
    console.log('Container exists, setting up Three.js')
    
    // Initialize scene
    scene = new THREE.Scene()
    
    // Initialize camera
    camera = new THREE.PerspectiveCamera(
      90, // Wider field of view for immersion
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    )
    camera.position.set(0, 0, 0) // Camera at center of skyball
    
    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)
    container.value.appendChild(renderer.domElement)
    
    // Create skyball (geodesic dome) - with camera inside
    const skyballGeometry = new THREE.IcosahedronGeometry(50, 3) // Higher detail
    const skyballMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a2a, // Deeper, more pleasing blue
      emissive: 0x000022,
      emissiveIntensity: 0.5,
      side: THREE.BackSide,
      flatShading: true
    })
    skyball = new THREE.Mesh(skyballGeometry, skyballMaterial)
    scene.add(skyball)
    
    // Add stars to skyball
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 3000 // More stars
    const positions = new Float32Array(starsCount * 3)
    const starSizes = new Float32Array(starsCount)
    const starColors = new Float32Array(starsCount * 3)
    
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      const radius = 45 // Inside the skyball, near the surface
      
      positions[i3] = radius * Math.sin(theta) * Math.cos(phi)
      positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      positions[i3 + 2] = radius * Math.cos(theta)
      
      // Vary star sizes
      starSizes[i] = Math.random() * 0.2 + 0.05
      
      // Vary star colors (white with slight variations)
      const r = 0.9 + Math.random() * 0.1
      const g = 0.9 + Math.random() * 0.1
      const b = 0.9 + Math.random() * 0.1
      
      starColors[i3] = r
      starColors[i3 + 1] = g
      starColors[i3 + 2] = b
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.15,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.5
    })
    
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)
    
    // Create a nebula effect in the background
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x3333ff,
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide
    })
    
    const nebulaGeometry = new THREE.IcosahedronGeometry(48, 2)
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
    scene.add(nebula)
    
    // Create interactive button (resembling the CodePen example)
    // Create container for button
    const buttonGroup = new THREE.Group()
    buttonGroup.position.set(0, 0, 0)
    
    // Create base/platform for the button
    const platformRadius = 0.8
    const platformGeometry = new THREE.CylinderGeometry(platformRadius, platformRadius, 0.1, 32)
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x111111,
      emissiveIntensity: 0.5
    })
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial)
    platform.rotation.x = Math.PI / 2 // Rotate to make it horizontal
    platform.position.y = -0.05 // Slight vertical positioning
    buttonGroup.add(platform)
    
    // Create main floating energy orb (like in the CodePen)
    const orbRadius = 0.5
    const orbGeometry = new THREE.SphereGeometry(orbRadius, 32, 32)
    const orbMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00aaff,
      emissive: 0x0055aa,
      emissiveIntensity: 0.5,
      transparent: true,
      transmission: 0.3, // Glass-like transparency
      thickness: 0.5, // Refraction thickness
      clearcoat: 1.0, // Glossy coating
      clearcoatRoughness: 0.1,
      metalness: 0.0,
      roughness: 0.0
    })
    
    button = new THREE.Mesh(orbGeometry, orbMaterial)
    button.position.y = 0.6 // Float above the platform
    buttonGroup.add(button)
    
    // Inner energy core
    const coreRadius = orbRadius * 0.6
    const coreGeometry = new THREE.SphereGeometry(coreRadius, 24, 24)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x55ccff,
      transparent: true,
      opacity: 0.7
    })
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    button.add(core)
    
    // Create energy beam between platform and orb
    const beamGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.6, 8)
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x55ccff,
      transparent: true,
      opacity: 0.7
    })
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial)
    beam.position.y = 0.25 // Position between platform and orb
    buttonGroup.add(beam)
    
    // Add ring around the button
    const ringGeometry = new THREE.TorusGeometry(orbRadius * 1.2, 0.03, 16, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x55ccff,
      transparent: true,
      opacity: 0.7
    })
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2 // Rotate to make it horizontal
    button.add(ring)
    
    // Add second ring at an angle
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial)
    ring2.rotation.x = Math.PI / 4 // Angled rotation
    ring2.rotation.y = Math.PI / 4 // Angled rotation
    button.add(ring2)
    
    // Add particles around the button
    const particleCount = 24
    const particleGroup = new THREE.Group()
    button.add(particleGroup)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = orbRadius * 1.5
      
      const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8)
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x55ccff : 0x00aaff,
        transparent: true,
        opacity: 0.7
      })
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
      
      particle.userData = {
        orbitSpeed: 0.2 + Math.random() * 0.3,
        basePosition: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: 0
        }
      }
      
      particleGroup.add(particle)
    }
    
    // Position the button in the lower right corner
    buttonGroup.position.set(7, -4, -10) // Will be adjusted based on screen size
    buttonGroup.userData = { hovered: false }
    scene.add(buttonGroup)
    
    // Store button reference
    button = buttonGroup
    
    // Create menu group (initially hidden)
    menuGroup = new THREE.Group()
    menuGroup.position.set(7, -4, -10) // Position near the button
    menuGroup.visible = false
    scene.add(menuGroup)
    
    // Add menu items (will fan out from behind the button)
    menuItems.forEach((item, index) => {
      // Create menu item container
      const itemGroup = new THREE.Group()
      
      // Starting position (all stacked behind the button)
      itemGroup.position.set(0, 0, -0.1)
      
      // Background panel
      const panelGeometry = new THREE.PlaneGeometry(4, 0.8)
      const panelMaterial = new THREE.MeshBasicMaterial({
        color: 0x001133,
        transparent: true,
        opacity: 0.8
      })
      const panel = new THREE.Mesh(panelGeometry, panelMaterial)
      itemGroup.add(panel)
      
      // Create text using canvas texture
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 128
      
      context.fillStyle = 'transparent'
      context.fillRect(0, 0, canvas.width, canvas.height)
      
      context.font = 'bold 80px Arial'
      context.textAlign = 'center'
      context.fillStyle = 'white'
      context.fillText(item.label, canvas.width/2, canvas.height/2 + 20)
      
      const texture = new THREE.CanvasTexture(canvas)
      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      })
      const textGeometry = new THREE.PlaneGeometry(3.8, 0.7)
      const textMesh = new THREE.Mesh(textGeometry, textMaterial)
      textMesh.position.z = 0.01 // Slight offset to prevent z-fighting
      
      itemGroup.add(textMesh)
      
      // Add icon
      const iconGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1)
      const iconMaterial = new THREE.MeshBasicMaterial({ color: item.color })
      const icon = new THREE.Mesh(iconGeometry, iconMaterial)
      icon.position.set(-1.8, 0, 0.05)
      
      itemGroup.add(icon)
      
      // Make clickable
      itemGroup.userData = {
        url: item.url,
        isMenuItem: true,
        originalScale: new THREE.Vector3(1, 1, 1),
        hovered: false,
        index: index
      }
      
      menuGroup.add(itemGroup)
    })
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0)
    pointLight.position.set(0, 0, 0) // Light at camera position
    camera.add(pointLight)
    scene.add(camera) // Need to add camera to scene for its children (lights)
    
    // Add directional light for button
    const buttonLight = new THREE.DirectionalLight(0xffffff, 1.0)
    buttonLight.position.set(-1, 2, -1)
    scene.add(buttonLight)
    
    // Handle click events with raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    handleMouseMove = (event) => {
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera)
      
      // Check intersections with button
      const intersects = raycaster.intersectObject(button, true)
      
      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer'
        
        // Scale button slightly when hovered (if not already hovered)
        if (!button.userData.hovered) {
          button.userData.hovered = true
          button.scale.set(1.1, 1.1, 1.1)
        }
      } else {
        // Check intersections with menu items
        const menuIntersects = raycaster.intersectObjects(menuGroup.children, true)
        
        if (menuIntersects.length > 0) {
          document.body.style.cursor = 'pointer'
          
          // Find the parent menu item
          let parentItem = menuIntersects[0].object
          while (parentItem && !parentItem.userData.isMenuItem) {
            parentItem = parentItem.parent
          }
          
          if (parentItem && !parentItem.userData.hovered) {
            // Scale menu item slightly when hovered
            parentItem.userData.hovered = true
            parentItem.scale.set(1.05, 1.05, 1.05)
            
            // Reset other menu items
            menuGroup.children.forEach(item => {
              if (item !== parentItem && item.userData.hovered) {
                item.userData.hovered = false
                item.scale.copy(item.userData.originalScale)
              }
            })
          }
        } else {
          document.body.style.cursor = 'default'
          
          // Reset button scale if not hovered
          if (button.userData.hovered) {
            button.userData.hovered = false
            button.scale.set(1, 1, 1)
          }
          
          // Reset all menu items
          menuGroup.children.forEach(item => {
            if (item.userData.hovered) {
              item.userData.hovered = false
              item.scale.copy(item.userData.originalScale)
            }
          })
        }
      }
    }
    
    handleClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera)
      
      // Check intersections with button
      const buttonIntersects = raycaster.intersectObject(button, true)
      
      if (buttonIntersects.length > 0) {
        // Toggle menu visibility
        menuVisible.value = !menuVisible.value
        menuGroup.visible = menuVisible.value
        
        if (menuVisible.value) {
          // Animation effect for menu appearance - fan out from behind button
          menuGroup.children.forEach((item, index) => {
            // Reset position first
            item.position.set(0, 0, -0.1)
            item.scale.set(0.001, 0.001, 0.001)
            
            // Calculate final position based on fan pattern
            const totalItems = menuGroup.children.length
            const angle = (-Math.PI / 3) + (index / (totalItems - 1)) * (2 * Math.PI / 3)
            const radius = 5
            
            const targetX = Math.sin(angle) * radius
            const targetY = Math.cos(angle) * radius
            
            // Staggered animation with fan-out pattern
            setTimeout(() => {
              // Animate to final position
              const duration = 30
              let step = 0
              
              const animate = () => {
                step++
                
                const progress = step / duration
                const easeOutProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease out
                
                // Position interpolation
                item.position.x = easeOutProgress * targetX
                item.position.y = easeOutProgress * targetY
                
                // Scale interpolation
                const currentScale = 0.001 + (1 - 0.001) * easeOutProgress
                item.scale.set(currentScale, currentScale, currentScale)
                
                if (step < duration) {
                  requestAnimationFrame(animate)
                }
              }
              
              animate()
            }, index * 80) // Staggered timing
          })
          
          // Snap camera to face the menu for better visibility
          snapCameraToMenu()
        } else {
          // Animation effect for menu disappearance - collapse back to button
          menuGroup.children.forEach((item, index) => {
            // Staggered collapse animation
            setTimeout(() => {
              // Animate back to button
              const duration = 20
              let step = 0
              
              const animate = () => {
                step++
                
                const progress = step / duration
                const easeInProgress = progress * progress // Quadratic ease in
                
                // Position interpolation
                item.position.x = item.position.x * (1 - easeInProgress)
                item.position.y = item.position.y * (1 - easeInProgress)
                
                // Scale interpolation
                const currentScale = 1 - (1 - 0.001) * easeInProgress
                item.scale.set(currentScale, currentScale, currentScale)
                
                if (step < duration) {
                  requestAnimationFrame(animate)
                }
              }
              
              animate()
            }, (menuGroup.children.length - index - 1) * 50) // Reverse staggered timing
          })
          
          // Restore camera rotation
          restoreCamera()
        }
      } else if (menuVisible.value) {
        // Check for clicks on menu items
        const menuIntersects = raycaster.intersectObjects(menuGroup.children, true)
        
        if (menuIntersects.length > 0) {
          // Find the parent menu item
          let parentItem = menuIntersects[0].object
          while (parentItem && !parentItem.userData.isMenuItem) {
            parentItem = parentItem.parent
          }
          
          if (parentItem && parentItem.userData.url) {
            // Navigate to the URL
            window.location.href = parentItem.userData.url
          }
        }
      }
    }
    
    // Store original camera rotation for restoration
    const originalCameraRotation = new THREE.Euler().copy(camera.rotation)
    
    // Function to snap camera to face the menu
    function snapCameraToMenu() {
      // Save current rotation
      originalCameraRotation.copy(camera.rotation)
      
      // Calculate direction to button
      const direction = new THREE.Vector3()
      direction.subVectors(button.position, camera.position).normalize()
      
      // Set camera rotation to look at menu
      camera.lookAt(button.position)
    }
    
    // Function to restore original camera rotation
    function restoreCamera() {
      // Animate back to original rotation
      const duration = 30
      let step = 0
      
      const targetRotation = new THREE.Euler().copy(originalCameraRotation)
      const startRotation = new THREE.Euler().copy(camera.rotation)
      
      const animate = () => {
        step++
        
        const progress = step / duration
        const easeOutProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease out
        
        // Interpolate rotation
        camera.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeOutProgress
        camera.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easeOutProgress
        camera.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easeOutProgress
        
        if (step < duration) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    
    // Responsive positioning
    handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      
      // Adjust button and menu position based on screen size
      if (width < 768) {
        // Mobile positioning
        button.position.set(3, -3, -10)
        menuGroup.position.copy(button.position)
      } else if (width / height > 2) {
        // Ultrawide monitors
        button.position.set(10, -4, -10)
        menuGroup.position.copy(button.position)
      } else {
        // Standard desktop
        button.position.set(7, -4, -10)
        menuGroup.position.copy(button.position)
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial positioning
    
    // Animation variables
    let time = 0
    
    // Animation function
    const animate = () => {
      time += 0.016 // Approximately 60fps
      
      // Animate skyball rotation
      if (skyball) {
        skyball.rotation.y += 0.0005 // Slow rotation
        skyball.rotation.x = Math.sin(time * 0.1) * 0.01 // Slight wobble
      }
      
      // Animate nebula
      if (nebula) {
        nebula.rotation.y -= 0.0002 // Counter-rotate nebula
        nebula.rotation.z = Math.sin(time * 0.05) * 0.02
      }
      
      // Animate stars
      if (stars) {
        stars.rotation.y += 0.0001
      }
      
      // Animate button with floating effect
      if (button) {
        // Vertical floating
        button.position.y += Math.sin(time * 1.5) * 0.004
        
        // Subtle rotation
        button.rotation.z = Math.sin(time * 0.7) * 0.03
        
        // Animate rings
        if (button.children[0].children[2]) { // First ring
          button.children[0].children[2].rotation.z += 0.01
        }
        
        if (button.children[0].children[3]) { // Second ring
          button.children[0].children[3].rotation.z -= 0.01
        }
        
        // Pulse the core
        if (button.children[0].children[1]) { // Core
          const scale = 1 + 0.1 * Math.sin(time * 3)
          button.children[0].children[1].scale.set(scale, scale, scale)
        }
        
        // Animate beam
        if (button.children[1]) { // Beam
          const scaleY = 1 + 0.1 * Math.sin(time * 2)
          const scaleX = 1 - 0.05 * Math.sin(time * 3)
          button.children[1].scale.set(scaleX, scaleY, scaleX)
          
          // Pulse the beam opacity
          button.children[1].material.opacity = 0.5 + 0.3 * Math.sin(time * 3)
        }
        
        // Animate particles
        if (button.children[0].children.length > 4) { // Particles group
          const particleGroup = button.children[0].children[4]
          
          particleGroup.children.forEach((particle, i) => {
            const userData = particle.userData
            if (userData && userData.basePosition && userData.orbitSpeed) {
              const angle = time * userData.orbitSpeed + (i / particleGroup.children.length) * Math.PI * 2
              
              // Orbit movement
              particle.position.x = userData.basePosition.x * Math.cos(angle) - userData.basePosition.y * Math.sin(angle)
              particle.position.y = userData.basePosition.x * Math.sin(angle) + userData.basePosition.y * Math.cos(angle)
              
              // Up/down movement
              particle.position.z = Math.sin(time * 3 + i) * 0.1
              
              // Pulse size
              const scale = 0.8 + 0.4 * Math.sin(time * 2 + i)
              particle.scale.set(scale, scale, scale)
            }
          })
        }
      }
      
      // Animate menu items when visible
      if (menuGroup && menuGroup.visible) {
        menuGroup.children.forEach((item, i) => {
          // Gentle floating
          const floatOffset = Math.sin(time * 1.5 + i * 0.5) * 0.05
          const origY = item.position.y - (item.userData.lastFloatOffset || 0)
          item.position.y = origY + floatOffset
          item.userData.lastFloatOffset = floatOffset
          
          // Gentle rotation
          item.rotation.z = Math.sin(time * 0.7 + i * 0.3) * 0.02
        })
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
  console.log('SkyballScene component unmounting')
  
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // Remove event listeners
  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }
  
  if (handleMouseMove) {
    window.removeEventListener('mousemove', handleMouseMove)
  }
  
  if (handleClick) {
    window.removeEventListener('click', handleClick)
  }
  
  // Dispose of Three.js resources
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement)
    }
  }
})
</script>