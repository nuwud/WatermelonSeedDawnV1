<template>
  <Renderer antialias :orbit-ctrl="false" ref="renderer" resize>
    <Camera :position="{ z: 5 }" />
    <Scene>
      <AmbientLight :intensity="0.4" />
      <PointLight :position="{ x: 10, y: 10, z: 10 }" />

      <Box :position="{ x: 0, y: 0, z: 0 }" :rotation="rotation">
        <StandardMaterial color="#66ccff" />
      </Box>
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Renderer,
  Camera,
  Scene,
  Box,
  StandardMaterial,
  PointLight,
  AmbientLight
} from 'troisjs'

const rotation = ref({ x: 0, y: 0, z: 0 })

let frameId
const animate = () => {
  rotation.value.y += 0.01
  rotation.value.x += 0.005
  frameId = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  display: block;
  background: black;
}
</style>
