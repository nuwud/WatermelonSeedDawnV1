// modules/ButtonManagerHybrid.js
import * as THREE from 'three'
import AnimationUtils from './AnimationUtils'

export default class ButtonManager {
  constructor(scene, onClick) {
    this.scene = scene
    this.onClick = onClick
    this.hovered = false
    this.tetraMesh = null
    this.rotationSpeed = 0.01

    this.createButton()
  }

  createButton() {
    const geometry = new THREE.TetrahedronGeometry(0.6)
    const material = new THREE.MeshStandardMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 1,
      emissive: 0x66ccff,
      emissiveIntensity: 0.1,
      roughness: 0.3,
      metalness: 0.2
    })

    this.tetraMesh = new THREE.Mesh(geometry, material)
    this.tetraMesh.position.set(0, -1.5, 0) // center bottom

    this.tetraMesh.userData = {
      isInteractive: true,
      type: 'button'
    }

    this.scene.add(this.tetraMesh)
  }

  setHovered(state) {
    this.hovered = state
    if (this.tetraMesh && this.tetraMesh.material) {
      this.tetraMesh.material.opacity = state ? 1 : 0.8
      this.tetraMesh.material.emissiveIntensity = state ? 0.6 : 0.1
    }
  }

  animateClick() {
    if (this.tetraMesh) {
      AnimationUtils.animateScale(this.tetraMesh, 1.4, 0.2, () => {
        AnimationUtils.animateScale(this.tetraMesh, 1.0, 0.2)
      })
    }
  }

  update(deltaTime) {
    if (this.tetraMesh) {
        this.tetraMesh.rotation.y += 0.005
        this.tetraMesh.rotation.x += 0.0025
    }
  }

  dispose() {
    if (this.tetraMesh) {
      this.scene.remove(this.tetraMesh)
      this.tetraMesh.geometry.dispose()
      this.tetraMesh.material.dispose()
      this.tetraMesh = null
    }
  }
}
