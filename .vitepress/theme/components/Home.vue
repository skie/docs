<template>
  <div class="VPHome">
    <slot name="home-hero" />
    <div class="home-content-section">
      <slot name="home-articles" />
      <slot name="home-features" />
    </div>
  </div>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme-without-fonts'

const { VPHome } = DefaultTheme
</script>

<style scoped>
.home-content-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 3rem;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1.5rem;
}

@media (max-width: 960px) {
  .home-content-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>

