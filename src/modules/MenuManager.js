// modules/MenuManager.js
import * as THREE from 'three'
import AnimationUtils from './AnimationUtils'

export default class MenuManager {
  constructor(scene, position, settings) {
    this.scene = scene
    this.position = {
      x: position.x || 0,
      y: position.y || 0,
      z: position.z || 0
    }
    
    this.settings = settings
    this.layout = settings.menuLayout || 'fanCircular'
    this.primaryColorHex = settings.primaryColor || '#66ccff'
    
    this.menuGroup = null
    this.menuBackground = null
    this.menuItems = []
    this.originalCameraData = null
    
    this.init()
  }
  
  init() {
    // Create menu group
    this.menuGroup = new THREE.Group()
    this.menuGroup.position.set(this.position.x, this.position.y, this.position.z)
    this.menuGroup.visible = false
    this.scene.add(this.menuGroup)
    
    // Create menu background
    this.createMenuBackground()
    
    // Create menu items
    this.createMenuItems()
  }
  
  createMenuBackground() {
    const menuItems = [
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/collections/all' },
      { label: 'Cart', url: '/cart' },
      { label: 'Account', url: '/account' },
      { label: 'Search', url: '/search' }
    ]
    
    // Menu background
    const menuBg = new THREE.Mesh(
      new THREE.PlaneGeometry(8, menuItems.length * 1.2 + 1),
      new THREE.MeshPhysicalMaterial({
        color: 0x001133,
        transparent: true,
        opacity: 0.7,
        transmission: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        metalness: 0.2,
        roughness: 0.3,
        side: THREE.DoubleSide
      })
    )
    
    menuBg.position.z = -0.2
    menuBg.visible = false
    this.menuGroup.add(menuBg)
    this.menuBackground = menuBg
  }
  
  createMenuItems() {
    const menuItems = [
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/collections/all' },
      { label: 'Cart', url: '/cart' },
      { label: 'Account', url: '/account' },
      { label: 'Search', url: '/search' }
    ]
    
    // Parse color
    const primaryColor = new THREE.Color(this.primaryColorHex)
    
    // Create each menu item
    menuItems.forEach((itemData, i) => {
      // Create item container
      const menuItem = new THREE.Group()
      menuItem.userData = {
        isInteractive: true,
        type: 'menuItem',
        url: itemData.url,
        label: itemData.label,
        hovered: false
      }
      
      // Set position based on layout
      const itemHeight = 1
      const spacing = 1.2
      const finalPosition = this.getItemPosition(i, menuItems.length, itemHeight, spacing)
      
      menuItem.position.set(finalPosition[0], finalPosition[1], finalPosition[2])
      
      // Create item background
      const btnWidth = 6
      const btnHeight = itemHeight
      const btnGeometry = new THREE.PlaneGeometry(btnWidth, btnHeight)
      const btnMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x001836,
        transparent: true,
        opacity: 0.6,
        transmission: 0.1,
        clearcoat: 0.8
      })
      
      const btnBackground = new THREE.Mesh(btnGeometry, btnMaterial)
      menuItem.add(btnBackground)
      
      // Create icon with color derived from primary color
      const iconSize = 0.4
      const iconGeometry = new THREE.BoxGeometry(iconSize, iconSize, iconSize / 4)
      
      // Get color for this item
      let itemColor;
      switch (i % 5) {
        case 0: // Primary color
          itemColor = new THREE.Color(this.primaryColorHex)
          break
        case 1: // Warmer
          itemColor = new THREE.Color(this.primaryColorHex).offsetHSL(0.1, 0, 0)
          break
        case 2: // Cooler
          itemColor = new THREE.Color(this.primaryColorHex).offsetHSL(-0.1, 0, 0)
          break
        case 3: // Brighter
          itemColor = new THREE.Color(this.primaryColorHex).offsetHSL(0, 0.2, 0.1)
          break
        case 4: // Darker
          itemColor = new THREE.Color(this.primaryColorHex).offsetHSL(0, 0.1, -0.1)
          break
      }
      
      const iconMaterial = new THREE.MeshPhysicalMaterial({
        color: itemColor,
        emissive: itemColor,
        emissiveIntensity: 0.3,
        clearcoat: 1.0
      })
      
      const icon = new THREE.Mesh(iconGeometry, iconMaterial)
      icon.position.set(-btnWidth / 2 + iconSize, 0, 0.05)
      menuItem.add(icon)
      
      // Create text label using canvas texture
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 128
      
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = '#aaccff'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(itemData.label, 20, canvas.height / 2)
      
      const texture = new THREE.CanvasTexture(canvas)
      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      })
      
      const textGeometry = new THREE.PlaneGeometry(btnWidth * 0.6, btnHeight * 0.6)
      const textMesh = new THREE.Mesh(textGeometry, textMaterial)
      textMesh.position.set(0.2, 0, 0.05)
      menuItem.add(textMesh)
      
      // Initial state
      menuItem.visible = false
      menuItem.scale.set(0.001, 0.001, 0.001)
      
      // Add to menu
      this.menuGroup.add(menuItem)
      this.menuItems.push(menuItem)
    })
  }
  
  getItemPosition(index, totalItems, itemHeight, spacing) {
    // Calculate position based on selected layout
    switch (this.layout) {
      case 'vertical':
        // Vertical stack
        return [0, (totalItems / 2 - index - 0.5) * spacing, 0]
        
      case 'horizontal':
        // Horizontal row
        return [(index - (totalItems - 1) / 2) * (6 * 1.1), 0, 0]
        
      case 'grid':
        // Grid layout (2 columns)
        const cols = 2
        const gridCol = index % cols
        const gridRow = Math.floor(index / cols)
        
        return [
          (gridCol - (cols - 1) / 2) * (6 * 1.1), 
          (-(gridRow) + 1) * spacing, 
          0
        ]
        
      case 'fanCircular':
      default:
        // Fan out in a semi-circle
        const fanRadius = 4
        const fanAngleSpread = Math.PI * 0.8
        const fanAngle = -fanAngleSpread/2 + (index / (totalItems - 1)) * fanAngleSpread
        
        return [
          Math.sin(fanAngle) * fanRadius,
          Math.cos(fanAngle) * fanRadius,
          0
        ]
    }
  }
  
  updatePosition(position) {
    if (position) {
      this.position = position
      this.menuGroup.position.set(position.x, position.y, position.z)
    }
  }
  
  show(camera, controls) {
    // Make menu visible
    this.menuGroup.visible = true
    
    // Disable orbit controls
    if (controls) {
      controls.enabled = false
    }
    
    // Store original camera data for restoration later
    this.originalCameraData = {
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
      rotation: {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
      }
    }
    
    // Animate camera to face menu
    const targetPosition = {
      x: this.menuGroup.position.x,
      y: this.menuGroup.position.y,
      z: this.menuGroup.position.z + 8
    }
    
    this.animateCameraToMenu(camera, targetPosition, 1.2, () => {
      this.showMenuItems()
    })
  }
  
  showMenuItems() {
    // Show background with animation
    if (this.menuBackground) {
      this.menuBackground.visible = true
      this.menuBackground.scale.set(0.001, 0.001, 0.001)
      
      AnimationUtils.animateScale(this.menuBackground, 1.0, 0.8)
      
      if (this.menuBackground.material) {
        this.menuBackground.material.opacity = 0
        AnimationUtils.animateProperty(this.menuBackground.material, 'opacity', 0.7, 0.8)
      }
    }
    
    // Animate in menu items with staggered delay
    if (this.menuItems.length > 0) {
      this.menuItems.forEach((item, i) => {
        item.visible = true
        item.scale.set(0.001, 0.001, 0.001)
        
        setTimeout(() => {
          AnimationUtils.animateScale(item, 1.0, 0.7)
        }, 300 + i * 100)
      })
    }
  }
  
  hide(camera, controls) {
    // Re-enable controls
    if (controls) {
      controls.enabled = true
    }
    
    // Hide menu items with staggered delay
    if (this.menuItems.length > 0) {
      this.menuItems.forEach((item, i) => {
        setTimeout(() => {
          AnimationUtils.animateScale(item, 0.001, 0.5, () => {
            item.visible = false
          })
        }, i * 70)
      })
    }
    
    // Hide background after items
    setTimeout(() => {
      if (this.menuBackground) {
        if (this.menuBackground.material) {
          AnimationUtils.animateProperty(this.menuBackground.material, 'opacity', 0, 0.5)
        }
        
        AnimationUtils.animateScale(this.menuBackground, 0.001, 0.5, () => {
          this.menuBackground.visible = false
        })
      }
    }, this.menuItems.length * 70)
    
    // Restore camera position
    setTimeout(() => {
      if (this.originalCameraData) {
        this.animateCameraToMenu(
          camera, 
          this.originalCameraData.position, 
          1.2, 
          () => {
            // Reset rotation
            camera.rotation.set(
              this.originalCameraData.rotation.x,
              this.originalCameraData.rotation.y,
              this.originalCameraData.rotation.z
            )
            
            // Hide menu completely
            this.menuGroup.visible = false
          }
        )
      } else {
        // No original position, just hide menu
        setTimeout(() => {
          this.menuGroup.visible = false
        }, 500)
      }
    }, this.menuItems.length * 70 + 200)
  }
  
  animateCameraToMenu(camera, targetPosition, duration, onComplete) {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    }
    
    const startTime = Date.now()
    const endTime = startTime + duration * 1000
    
    const updateCamera = () => {
      const now = Date.now()
      
      if (now >= endTime) {
        // Animation complete
        camera.position.set(
          targetPosition.x,
          targetPosition.y,
          targetPosition.z
        )
        
        // Look at menu
        camera.lookAt(
          this.menuGroup.position.x,
          this.menuGroup.position.y,
          this.menuGroup.position.z
        )
        
        if (onComplete) onComplete()
        return
      }
      
      // Calculate progress
      const progress = (now - startTime) / (endTime - startTime)
      const easedProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease out
      
      // Calculate current position
      const currentPosition = {
        x: startPosition.x + (targetPosition.x - startPosition.x) * easedProgress,
        y: startPosition.y + (targetPosition.y - startPosition.y) * easedProgress,
        z: startPosition.z + (targetPosition.z - startPosition.z) * easedProgress
      }
      
      // Update camera position
      camera.position.set(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z
      )
      
      // Look at menu during transition
      camera.lookAt(
        this.menuGroup.position.x,
        this.menuGroup.position.y,
        this.menuGroup.position.z
      )
      
      // Continue animation
      requestAnimationFrame(updateCamera)
    }
    
    // Start animation
    updateCamera()
  }
  
  setItemHovered(item, hovered) {
    if (item.userData.hovered !== hovered) {
      item.userData.hovered = hovered
      
      // Apply hover effects
      if (hovered) {
        // Scale the item slightly
        AnimationUtils.animateScale(item, 1.05, 0.3)
        
        // Update background opacity
        if (item.children[0] && item.children[0].material) {
          AnimationUtils.animateProperty(item.children[0].material, 'opacity', 0.8, 0.3)
        }
        
        // Update icon
        if (item.children[1] && item.children[1].material) {
          AnimationUtils.animateProperty(
            item.children[1].material, 'emissiveIntensity', 0.7, 0.3
          )
          AnimationUtils.animateScale(item.children[1], 1.2, 0.5)
        }
        
        // Update text color
        this.updateItemText(item, '#ffffff')
      } else {
        // Reset scale
        AnimationUtils.animateScale(item, 1.0, 0.3)
        
        // Reset background
        if (item.children[0] && item.children[0].material) {
          AnimationUtils.animateProperty(item.children[0].material, 'opacity', 0.6, 0.3)
        }
        
        // Reset icon
        if (item.children[1] && item.children[1].material) {
          AnimationUtils.animateProperty(
            item.children[1].material, 'emissiveIntensity', 0.3, 0.3
          )
          AnimationUtils.animateScale(item.children[1], 1.0, 0.3)
        }
        
        // Reset text color
        this.updateItemText(item, '#aaccff')
      }
    }
  }
  
  updateItemText(menuItem, color) {
    // Find the text mesh (3rd child)
    if (menuItem.children.length >= 3 && menuItem.children[2]) {
      const textMesh = menuItem.children[2]
      
      if (textMesh.material && textMesh.material.map) {
        // Get the current texture
        const currentTexture = textMesh.material.map
        
        // Create a new canvas with the same dimensions
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 128
        
        // Get text label from userData
        let textLabel = menuItem.userData.label || 'Menu Item'
        
        // Draw text with new color
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'transparent'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = 'bold 48px Arial'
        ctx.fillStyle = color
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(textLabel, 20, canvas.height / 2)
        
        // Create new texture
        const newTexture = new THREE.CanvasTexture(canvas)
        
        // Dispose of old texture
        currentTexture.dispose()
        
        // Assign new texture
        textMesh.material.map = newTexture
        textMesh.material.needsUpdate = true
      }
    }
  }
  
  update(time) {
    // Animate visible menu items
    if (this.menuGroup.visible) {
      this.menuItems.forEach((item, i) => {
        if (item.visible && item.scale.x > 0.1) {
          // Gentle floating movement
          item.position.y += Math.sin(time * 1.2 + i * 0.5) * 0.0005
          item.position.x += Math.sin(time * 0.8 + i * 0.7) * 0.0003
          
          // Subtle rotation
          item.rotation.z = Math.sin(time * 0.5 + i * 0.3) * 0.01
        }
      })
    }
  }
  
  dispose() {
    // Dispose of background
    if (this.menuBackground) {
      this.menuBackground.geometry.dispose()
      this.menuBackground.material.dispose()
    }
    
    // Dispose of menu items
    this.menuItems.forEach(item => {
      // Dispose of each child
      item.children.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (child.material.map) child.material.map.dispose()
          child.material.dispose()
        }
      })
    })
    
    // Remove from scene
    this.scene.remove(this.menuGroup)
  }
}