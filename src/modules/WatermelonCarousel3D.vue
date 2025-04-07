<template>
  <group v-if="visible">
    <!-- Main Carousel -->
    <group ref="carouselGroup">
      <group
        v-for="(item, index) in items"
        :key="item.id"
        :position="getCircularPosition(index, items.length, item.radius || 2.5)"
        @click="onClickItem(item)"
        @pointerover="() => setHovered(item, true)"
        @pointerout="() => setHovered(item, false)"
      >
        <!-- Icon (Left of Text) -->
        <mesh :position="[-0.6, 0, 0]">
          <box-geometry :args="[0.3, 0.3, 0.1]" />
          <meshStandardMaterial color="#fff" />
        </mesh>

        <!-- Text Label -->
        <text-geometry :args="[item.label, textOptions]" />
        <meshStandardMaterial :color="item.hovered ? '#ff66aa' : '#66ccff'" />
      </group>
    </group>

    <!-- Close Button -->
    <mesh
      :position="[0, -2.5, 0]"
      @click="closeMenu"
      @pointerover="hoverClose = true"
      @pointerout="hoverClose = false"
    >
      <circle-geometry :args="[0.2, 32]" />
      <meshStandardMaterial :color="hoverClose ? '#ff3333' : '#ff6666'" />
    </mesh>
  </group>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const visible = ref(false)
const hoverClose = ref(false)

const textOptions = {
  font: '/helvetiker_regular.typeface.json',
  size: 0.25,
  height: 0.05
}

const items = reactive([
  { id: 'home', label: 'Home', hovered: false, radius: 2.5 },
  { id: 'shop', label: 'Shop', hovered: false, radius: 2.5 },
  { id: 'about', label: 'About', hovered: false, radius: 2.5 },
  { id: 'cart', label: 'Cart', hovered: false, radius: 2.5 },
  { id: 'search', label: 'Search', hovered: false, radius: 2.5 },
])

function getCircularPosition(index, total, radius) {
  const angle = (index / total) * Math.PI * 2
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  return [x, y, 0]
}

function onClickItem(item) {
  console.log('Clicked item:', item.id)
  window.dispatchEvent(new CustomEvent('watermelonSubmenu', { detail: { id: item.id } }))
}

function closeMenu() {
  visible.value = false
}

function setHovered(item, state) {
  item.hovered = state
}

onMounted(() => {
  window.addEventListener('openWatermelonCarousel3D
    visible.value = true
  })
})
</script>

<style scoped>
/* TODO: Add glow/shadow hover effects */
</style>