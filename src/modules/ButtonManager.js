// modules/ButtonManager.js
import * as THREE from 'three'
import AnimationUtils from './AnimationUtils'

export default class ButtonManager {
  constructor(scene, position, colorHex) {
    this.scene = scene
    this.position = {
      x: position.x || 7,
      y: position.y || -4,
      z: position.z || 0
    }
    
    this.primaryColorHex = colorHex || '#66ccff'
    this.buttonGroup = null
    this.buttonMesh = null
    this.beam = null
    this.particles = []
    
    this.init()
  }
  
  init() {
    // Create button group
    this.buttonGroup = new THREE.Group()
    this.buttonGroup.position.set(this.position.x, this.position.y, this.position.z)
    this.scene.add(this.buttonGroup)
    
    // Create main button
    this.createButton()
    
    // Create beam under button
    this.createBeam()
    
    // Create particles around button
    this.createParticles()
  }
  
  createButton() {
    // Create geometry and materials
    const buttonGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2)
    
    // Parse color to THREE.Color
    const primaryColor = new THREE.Color(this.primaryColorHex)
    const secondaryColor = new THREE.Color(this.primaryColorHex).multiplyScalar(0.5)
    
    const buttonMaterial = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: secondaryColor,
      emissiveIntensity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0.8,
      roughness: 0.2
    })
    
    this.buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial)
    this.buttonMesh.userData = { 
      isInteractive: true, 
      type: 'button', 
      hovered: false
    }
    
    this.buttonGroup.add(this.buttonMesh)
  }
  
  createBeam() {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.3, 1.0, 8)
    const primaryColor = new THREE.Color(this.primaryColorHex)
    
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.7
    })
    
    this.beam = new THREE.Mesh(beamGeometry, beamMaterial)
    this.beam.position.set(0, -1.0, 0)
    this.beam.scale.set(0.5, 1, 0.5)
    
    this.buttonGroup.add(this.beam)
  }
  
  createParticles() {
    // Create particle group
    const particleGroup = new THREE.Group()
    this.buttonGroup.add(particleGroup)
    
    // Parse colors
    const primaryColor = new THREE.Color(this.primaryColorHex)
    const secondaryColor = new THREE.Color(this.primaryColorHex).multiplyScalar(0.5)
    
    // Create particles
    const particleCount = 12
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 1.5
      
      const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8)
      
      // Alternate colors
      const color = i % 3 === 0 ? 
        primaryColor.clone() : 
        (i % 3 === 1 ? secondaryColor.clone() : 
          new THREE.Color(this.primaryColorHex).multiplyScalar(0.8))
      
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
      })
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      
      // Position in a circle
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
      
      // Add animation data
      particle.userData = {
        basePosition: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: 0
        },
        speed: 0.3 + Math.random() * 0.3
      }
      
      particleGroup.add(particle)
      this.particles.push(particle)
    }
  }
  
  getPosition() {
    return {
      x: this.buttonGroup.position.x,
      y: this.buttonGroup.position.y,
      z: this.buttonGroup.position.z
    }
  }
  
  updatePosition(screenWidth, screenHeight) {
    const aspectRatio = screenWidth / screenHeight
    
    let targetX, targetY
    
    if (screenWidth < 768) {
      // Mobile positioning
      targetX = this.position.x * 0.7
      targetY = this.position.y * 0.8
    } else if (aspectRatio > 2) {
      // Ultrawide monitors
      targetX = this.position.x * 1.5
      targetY = this.position.y * 1.2
    } else {
      // Standard desktop
      targetX = this.position.x
      targetY = this.position.y
    }
    
    // Animate to new position
    AnimationUtils.animateProperty(this.buttonGroup.position, 'x', targetX, 0.5)
    AnimationUtils.animateProperty(this.buttonGroup.position, 'y', targetY, 0.5)
  }
  
  update(time) {
    // Gentle floating motion
    this.buttonGroup.position.y += Math.sin(time * 1.5) * 0.001
    
    // Subtle rotation
    this.buttonGroup.rotation.z = Math.sin(time * 0.7) * 0.05
    
    // Animate beam
    if (this.beam) {
      this.beam.scale.y = 1.0 + 0.1 * Math.sin(time * 3)
      this.beam.scale.x = this.beam.scale.z = 0.5 - 0.05 * Math.sin(time * 5)
      this.beam.position.y = -1.0 + 0.05 * Math.sin(time * 2)
    }
    
    // Animate particles
    this.particles.forEach((particle, i) => {
      const userData = particle.userData || {}
      
      if (userData.basePosition && userData.speed) {
        // Orbit animation
        const angle = time * userData.speed + (i / this.particles.length) * Math.PI * 2
        
        particle.position.x = userData.basePosition.x * Math.cos(angle) - 
                             userData.basePosition.y * Math.sin(angle)
        particle.position.y = userData.basePosition.x * Math.sin(angle) + 
                             userData.basePosition.y * Math.cos(angle)
        
        // Z-axis movement
        particle.position.z = Math.sin(time * 2 + i) * 0.2
        
        // Pulsing size
        const scale = 0.8 + 0.4 * Math.sin(time * 2 + i * 0.5)
        particle.scale.set(scale, scale, scale)
      }
    })
  }
  
  setHovered(hovered) {
    if (this.buttonMesh.userData.hovered !== hovered) {
      this.buttonMesh.userData.hovered = hovered
      
      if (hovered) {
        // Scale up
        AnimationUtils.animateScale(this.buttonMesh, 1.1, 0.3)
        
        // Increase emission
        if (this.buttonMesh.material && 
            this.buttonMesh.material.emissiveIntensity !== undefined) {
          AnimationUtils.animateProperty(
            this.buttonMesh.material, 'emissiveIntensity', 0.8, 0.3
          )
        }
      } else {
        // Scale down
        AnimationUtils.animateScale(this.buttonMesh, 1.0, 0.3)
        
        // Decrease emission
        if (this.buttonMesh.material && 
            this.buttonMesh.material.emissiveIntensity !== undefined) {
          AnimationUtils.animateProperty(
            this.buttonMesh.material, 'emissiveIntensity', 0.5, 0.3
          )
        }
      }
    }
  }
  
  animateClick() {
    // Quick scale down and up
    AnimationUtils.animateScale(this.buttonMesh, 0.9, 0.15, () => {
      AnimationUtils.animateScale(this.buttonMesh, this.buttonMesh.userData.hovered ? 1.1 : 1.0, 0.3)
    })
    
    // Pulse the beam
    if (this.beam && this.beam.material) {
      const startOpacity = this.beam.material.opacity
      
      // Brighten
      AnimationUtils.animateProperty(this.beam.material, 'opacity', 1.0, 0.15, () => {
        // Return to original opacity
        AnimationUtils.animateProperty(
          this.beam.material, 'opacity', startOpacity, 0.3
        )
      })
    }
  }
  
  dispose() {
    // Dispose of geometries and materials
    if (this.buttonMesh) {
      this.buttonMesh.geometry.dispose()
      this.buttonMesh.material.dispose()
    }
    
    if (this.beam) {
      this.beam.geometry.dispose()
      this.beam.material.dispose()
    }
    
    this.particles.forEach(particle => {
      particle.geometry.dispose()
      particle.material.dispose()
    })
    
    // Remove from scene
    this.scene.remove(this.buttonGroup)
  }
}