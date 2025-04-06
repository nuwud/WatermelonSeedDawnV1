<template>
  <div id="app">
    <SkyballScene />
  </div>
</template>

<script setup>
import SkyballScene from './modules/SkyballScene.vue'
console.log('App mounted with SkyballScene component')
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
}
</style>