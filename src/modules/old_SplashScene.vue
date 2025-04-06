<template>
<Renderer ref="renderer" antialias alpha>
  <Camera :position="{ x: 0, y: 0, z: 8 }" />
  <Scene>
      <ambientLight :intensity="0.8" />
      <pointLight :intensity="1.2" :position="[10, 10, 10]" />
      
    <ClickableCube />
    <SceneOverlayManager />
  </Scene>
</Renderer>
</template>

<script setup>
import { Renderer, Camera, Scene, AmbientLight, PointLight } from 'troisjs'
import ClickableCube from './ClickableCube.vue'
import SceneOverlayManager from './SceneOverlayManager.vue'
</script>
