<template>
  <div class="shopify-hud">
    <ShopifyHUDMenu />
  </div>
</template>

<script setup>
import ShopifyHUDMenu from './ShopifyHUDMenu.vue'
</script>

<style scoped>
.shopify-hud {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
}
</style>
