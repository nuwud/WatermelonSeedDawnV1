<template>
  <nav class="hud-menu">
    <ul>
      <li><a href="/collections/all">All Products</a></li>
      <li><a href="/">Home</a></li>
      <li><a href="/cart">Cart</a></li>
    </ul>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.hud-menu {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid #66ccff;
  border-radius: 8px;
  padding: 1rem;
  pointer-events: auto;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}
.hud-menu ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.hud-menu a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}
.hud-menu a:hover {
  color: #66ccff;
}
</style>
