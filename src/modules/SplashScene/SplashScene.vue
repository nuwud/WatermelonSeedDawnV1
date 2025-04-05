<template>
  <Renderer ref="renderer" antialias alpha :orbit-ctrl="{ enableDamping: true }">
    <Camera :position="{ z: 5 }" />
    <Scene>
      <AmbientLight :intensity="0.5" />
      <PointLight :position="{ x: 10, y: 10, z: 10 }" />
      <Box :rotation="{ x: angle, y: angle, z: 0 }">
        <StandardMaterial :color="color" />
      </Box>
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Renderer, Camera, Scene, Box, StandardMaterial, AmbientLight, PointLight } from 'troisjs'

const angle = ref(0)
const color = 0xff66cc

onMounted(() => {
  const loop = () => {
    angle.value += 0.01
    requestAnimationFrame(loop)
  }
  loop()
})
</script>

<style scoped>
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>