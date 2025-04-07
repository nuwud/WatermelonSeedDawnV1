<template>
  <Renderer>
    <Camera :position="[0, 1, 6]" />
    <Scene>
      <!-- Lighting -->
      <ambient-light :intensity="0.4" />
      <directional-light :position="[5, 5, 5]" :intensity="0.6" />

      <!-- Calm Background Sky -->
      <mesh :position="[0, -5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
        <plane-geometry :args="[100, 100]" />
        <meshStandardMaterial color="#080c1a" />
      </mesh>

      <!-- Stable Tetrahedron Loader -->
      <SkyballTetrahedron />
    </Scene>
  </Renderer>
</template>

<script setup>
import SkyballTetrahedron from './SkyballTetrahedron.vue'
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100vh;
  display: block;
  background-color: #000;
}
</style>
