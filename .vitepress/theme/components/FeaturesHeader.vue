<template>
  <div class="features-header">
    <h2 class="features-title">Plugins</h2>
    <a :href="getPluginsIndexPath()" class="view-all-link">View All Plugins →</a>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'

const { site } = useData()

const getPluginsIndexPath = () => {
  const base = site.value.base
  return `${base}plugins/`.replace(/\/+/g, '/')
}
</script>

<style scoped>
.features-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.features-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.view-all-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--vp-c-brand-2);
}
</style>

