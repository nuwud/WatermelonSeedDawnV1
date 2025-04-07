<template>
  <TresCanvas :alpha="true" :shadowMapEnabled="true">
    <OrbitControls :enableZoom="true" :enablePan="true" />
    <PerspectiveCamera :position="[0, 0, 5]" />

    <!-- Background -->
    <Sky :sunPosition="[100, 20, 100]" />
    <Stars :radius="100" :depth="50" :count="5000" :factor="4" />

    <!-- Tetrahedron Button -->
    <group ref="tetraGroup">
      <primitive :object="tetraMesh" />
    </group>

    <!-- Watermelon Menu Mount -->
    <WatermelonCarousel3D />
  </TresCanvas>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { PerspectiveCamera, OrbitControls, Sky, Stars } from '@tresjs/cientos'
import * as THREE from 'three'
import WatermelonCarousel3D from '@/modules/WatermelonCarousel3D.vue'

const tetraGroup = ref()
let tetraMesh
let menuCooldown = false
let menuLoaded = false

onMounted(() => {
  const geometry = new THREE.TetrahedronGeometry(0.3)
  const material = new THREE.MeshStandardMaterial({
    color: '#66ccff',
    emissive: '#113355',
    emissiveIntensity: 0.5
  })
  tetraMesh = new THREE.Mesh(geometry, material)
  tetraMesh.position.set(0, 0, 0)
  tetraMesh.userData = { clickable: true }

  if (tetraGroup.value) {
    tetraGroup.value.add(tetraMesh)
    tetraGroup.value.position.set(1.75, -1.5, 0)
  }

  function animate() {
    requestAnimationFrame(animate)
    tetraMesh.rotation.y += 0.005
    tetraMesh.rotation.x += 0.0025
    if (tetraMesh.material && tetraMesh.material.emissiveIntensity) {
      tetraMesh.material.emissiveIntensity = 0.5 + 0.25 * Math.sin(Date.now() * 0.002)
    }
  }
  animate()

  window.addEventListener('click', (e) => {
  if (menuCooldown || menuLoaded) return
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, window._tres_camera)
  const intersects = raycaster.intersectObject(tetraMesh)

  if (intersects.length > 0) {
    menuCooldown = true
    window.dispatchEvent(new CustomEvent('openWatermelonCarousel3D'))

    // Visual feedback while loading
    tetraMesh.material.emissive.set('#00ffcc')
    tetraMesh.scale.set(1.2, 1.2, 1.2)

    setTimeout(() => {
      menuCooldown = false
      menuLoaded = true
      tetraMesh.material.emissive.set('#113355')
      tetraMesh.scale.set(1, 1, 1)
    }, 
      1500) // simulate loading time
    }
  })

})
</script>

<style scoped>
#skyball-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.skyball-tetrahedron {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  width: 100px;
  height: 100px;
  pointer-events: auto;
}

.watermelon-menu-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: auto;
}

/* Transition for WatermelonCarousel3D appearance */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
