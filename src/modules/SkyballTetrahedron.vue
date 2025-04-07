<!-- SkyballTetrahedron.vue -->
<template>
  <group :position="[2, -1.5, 0]">
    <mesh
      @click="emitClick"
      :rotation="rotation"
      :scale="[1.2, 1.2, 1.2]"
      ref="tetra"
    >
      <tetrahedron-geometry :args="[0.4]" />
      <meshStandardMaterial :color="buttonColor" />
    </mesh>
  </group>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tetra = ref(null)
const buttonColor = '#66ccff'
const rotation = ref([0, 0, 0])

onMounted(() => {
  console.log('Tetrahedron mounted!')
  animate()
})

function emitClick() {
  console.log('Tetrahedron clicked!')
  window.dispatchEvent(new CustomEvent('openWatermelonCarousel3D
}

function animate() {
  requestAnimationFrame(animate)
  if (tetra.value) {
    tetra.value.rotation.y += 0.01
    tetra.value.rotation.x += 0.005
  }
}
</script>
