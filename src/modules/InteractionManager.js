// modules/InteractionManager.js
import * as THREE from 'three'
import AnimationUtils from './AnimationUtils'

export default class InteractionManager {
  constructor(scene, camera, buttonManager, menuManager, toggleMenuCallback, navigateCallback) {
    this.scene = scene
    this.camera = camera
    this.buttonManager = buttonManager
    this.menuManager = menuManager
    this.toggleMenu = toggleMenuCallback
    this.navigateTo = navigateCallback
    
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    
    this.init()
  }
  
  init() {
    // Add event listeners
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('click', this.onClick.bind(this))
  }
  
  onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // Find intersections with interactive objects
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    
    let foundInteractive = false
    
    // Check for hovering over interactive objects
    for (let i = 0; i < intersects.length; i++) {
      const object = this.findInteractiveParent(intersects[i].object)
      
      if (object && object.userData && object.userData.isInteractive) {
        foundInteractive = true
        
        // Handle hover effects
        if (object.userData.type === 'button') {
          document.body.style.cursor = 'pointer'
          this.buttonManager.setHovered(true)
        } 
        else if (object.userData.type === 'menuItem') {
          document.body.style.cursor = 'pointer'
          this.menuManager.setItemHovered(object, true)
        }
        
        break
      }
    }
    
    // Reset hover states if not hovering over anything
    if (!foundInteractive) {
      document.body.style.cursor = 'default'
      
      // Reset button
      this.buttonManager.setHovered(false)
      
      // Reset menu items
      if (this.menuManager.menuItems) {
        this.menuManager.menuItems.forEach(item => {
          if (item.userData && item.userData.hovered) {
            this.menuManager.setItemHovered(item, false)
          }
        })
      }
    }
  }
  
  onClick(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // Find intersections with interactive objects
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    
    // Check for clicks on interactive objects
    for (let i = 0; i < intersects.length; i++) {
      const object = this.findInteractiveParent(intersects[i].object)
      
      if (object && object.userData && object.userData.isInteractive) {
        // Handle click actions
        if (object.userData.type === 'button') {
          this.buttonManager.animateClick()
          this.toggleMenu()
        } 
        else if (object.userData.type === 'menuItem' && object.userData.url) {
          // Animate click effect
          AnimationUtils.animateScale(object, 1.2, 0.15, () => {
            AnimationUtils.animateScale(object, 0.8, 0.15, () => {
              // Navigate to URL
              this.navigateTo(object.userData.url)
            })
          })
        }
        
        break
      }
    }
  }
  
  findInteractiveParent(object) {
    let current = object
    
    while (current) {
      if (current.userData && current.userData.isInteractive) {
        return current
      }
      
      current = current.parent
    }
    
    return null
  }
  
  dispose() {
    // Remove event listeners
    window.removeEventListener('mousemove', this.onMouseMove.bind(this))
    window.removeEventListener('click', this.onClick.bind(this))
  }
}