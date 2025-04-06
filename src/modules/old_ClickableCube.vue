<template>
  <mesh
    :position="[3, 3, 0]"
    @pointerover="hovered = true"
    @pointerout="hovered = false"
    @click="toggleHUD"
  >
    <boxGeometry :args="[0.5, 0.5, 0.5]" />
    <meshStandardMaterial :color="hovered ? '#66ccff' : '#115577'" :emissive="'#003344'" :emissiveIntensity="0.3" />
  </mesh>
</template>

<script setup>
import { ref } from 'vue'
import { useEventBus } from '@vueuse/core'

const hovered = ref(false)
const bus = useEventBus('hud-toggle')

function toggleHUD() {
  bus.emit(true)
}
</script>
