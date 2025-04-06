<template>
  <div>
    <ShopifyHUD v-if="hudVisible" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEventBus } from '@vueuse/core'
import ShopifyHUD from './ShopifyHUD.vue'

const hudVisible = ref(false)
const bus = useEventBus('hud-toggle')

onMounted(() => {
  bus.on(() => {
    hudVisible.value = !hudVisible.value
  })
})
</script>

<style scoped>
.scene-overlay-manager {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
</style>
