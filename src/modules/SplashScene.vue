<!-- modules/SplashScene.vue -->
<template>
  <Renderer ref="renderer" antialias :orbit-ctrl="true" resize>
    <Camera :position="{ z: 5 }" />
    <Scene>
      <AmbientLight :intensity="0.4" />
      <PointLight :position="{ x: 5, y: 5, z: 5 }" />
      <Box :rotation="{ x: 1, y: 1, z: 0 }">
        <StandardMaterial :color="0x66ccff" />
      </Box>
    </Scene>
  </Renderer>
</template>

<script setup>
import {
  Renderer,
  Camera,
  Scene,
  Box,
  StandardMaterial,
  PointLight,
  AmbientLight
} from 'troisjs'

// Load metafields if needed later
const raw = document.getElementById('metafields')?.textContent
const metafields = raw ? JSON.parse(raw) : {}
console.log('🍉 Loaded Metafields in SplashScene Module:', metafields)
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100vh !important;
  display: block;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
