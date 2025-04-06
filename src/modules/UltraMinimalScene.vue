<template>
  <div class="trois-container" style="width: 100%; height: 100%;">
    <Renderer ref="renderer">
      <Camera :position="[0, 0, 5]" />
      <Scene>
        <AmbientLight />
        <Box />
      </Scene>
    </Renderer>
  </div>
</template>

<script setup>
import { Renderer, Camera, Scene, Box, AmbientLight } from 'troisjs'
</script>