// modules/SceneManager.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BackgroundManager from './BackgroundManager'
import ButtonManager from './ButtonManager'
import MenuManager from './MenuManager'
import InteractionManager from './InteractionManager'

export default class SceneManager {
  constructor(container, settings) {
    this.container = container
    this.settings = settings
    
    // Three.js components
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    
    // Managers
    this.backgroundManager = null
    this.buttonManager = null
    this.menuManager = null
    this.interactionManager = null
    
    // State
    this.isMenuVisible = false
    this.isPageLoading = false
    
    this.init()
  }
  
  init() {
    this.createScene()
    this.addManagers()
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this))
    
    // Start animation loop
    this.animate()
  }
  
  createScene() {
    // Create scene
    this.scene = new THREE.Scene()
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    )
    this.camera.position.z = 10
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x000000, 0) // Transparent background
    this.renderer.setPixelRatio(window.devicePixelRatio)
    
    // Add to DOM
    this.container.appendChild(this.renderer.domElement)
    
    // Set up camera controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = false
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5
    
    // Add basic lighting
    this.addLighting()
  }
  
  addLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)
    
    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    this.scene.add(directionalLight)
    
    // Point light near camera for button illumination
    const pointLight = new THREE.PointLight(0x3366ff, 0.8, 20)
    pointLight.position.set(0, 0, 5)
    this.scene.add(pointLight)
  }
  
  addManagers() {
    // Create background (stars, nebula)
    this.backgroundManager = new BackgroundManager(this.scene, this.settings)
    
    // Create button
    this.buttonManager = new ButtonManager(
      this.scene, 
      this.settings.buttonPosition,
      this.settings.primaryColor
    )
    
    // Create menu
    this.menuManager = new MenuManager(
      this.scene,
      this.buttonManager.getPosition(),
      this.settings
    )
    
    // Setup interactions
    this.interactionManager = new InteractionManager(
      this.scene,
      this.camera,
      this.buttonManager,
      this.menuManager,
      this.toggleMenu.bind(this),
      this.navigateTo.bind(this)
    )
  }
  
  toggleMenu(state = null) {
    // If state is provided, use it; otherwise toggle current state
    this.isMenuVisible = state !== null ? state : !this.isMenuVisible
    
    if (this.isMenuVisible) {
      // Show menu with animation
      this.menuManager.show(this.camera, this.controls)
    } else {
      // Hide menu with animation
      this.menuManager.hide(this.camera, this.controls)
    }
  }
  
  navigateTo(url) {
    // Start loading animation
    this.isPageLoading = true
    
    // Check for external URLs
    if (url.indexOf('://') !== -1 && url.indexOf(window.location.host) === -1) {
      // External URL - open in new tab
      window.open(url, '_blank')
      this.isPageLoading = false
      return
    }
    
    // Show loading animation in 3D space
    this.animatePageTransitionOut().then(() => {
      // Navigate to URL
      window.location.href = url
    })
  }
  
  animatePageTransitionOut() {
    return new Promise((resolve) => {
      // Animate camera slightly forward
      const currentZ = this.camera.position.z
      this.animateProperty(this.camera.position, 'z', currentZ - 3, 0.8)
      
      // Resolve after animation
      setTimeout(resolve, 800)
    })
  }
  
  animatePageTransitionIn() {
    // Animate camera back
    const currentZ = this.camera.position.z
    this.animateProperty(this.camera.position, 'z', currentZ + 3, 1.0)
    
    // Reset page loading state
    this.isPageLoading = false
  }
  
  animateProperty(object, property, targetValue, duration = 0.3) {
    if (!object || object[property] === undefined) return
    
    const startValue = object[property]
    const startTime = Date.now()
    const endTime = startTime + duration * 1000
    
    const updateProperty = () => {
      const now = Date.now()
      
      if (now >= endTime) {
        // Animation complete
        object[property] = targetValue
        return
      }
      
      // Calculate progress and apply easing
      const progress = (now - startTime) / (endTime - startTime)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (targetValue - startValue) * easedProgress
      
      // Apply value
      object[property] = currentValue
      
      // Continue animation
      requestAnimationFrame(updateProperty)
    }
    
    // Start the animation
    updateProperty()
  }
  
  handleResize() {
    if (this.camera && this.renderer) {
      // Update camera aspect ratio
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      
      // Update renderer size
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      
      // Update button position
      this.buttonManager.updatePosition(window.innerWidth, window.innerHeight)
      
      // Update menu position to match button
      this.menuManager.updatePosition(this.buttonManager.getPosition())
    }
  }
  
  animate() {
    // Request next frame
    requestAnimationFrame(this.animate.bind(this))
    
    // Update time for animations
    const time = performance.now() * 0.001 // time in seconds
    
    // Update controls
    if (this.controls) {
      this.controls.update()
    }
    
    // Update managers
    this.backgroundManager.update(time)
    this.buttonManager.update(time)
    this.menuManager.update(time)
    
    // Render the scene
    this.renderer.render(this.scene, this.camera)
  }
  
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    // Dispose of Three.js resources
    if (this.renderer) {
      this.renderer.dispose()
      this.container.removeChild(this.renderer.domElement)
    }
    
    // Dispose managers
    this.backgroundManager.dispose()
    this.buttonManager.dispose()
    this.menuManager.dispose()
    this.interactionManager.dispose()
  }
}