<template>
  <button
    v-show="hasSidebar"
    type="button"
    class="sidebar-toggle"
    :class="{ collapsed: isCollapsed }"
    @click="toggleSidebar"
    :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    title="Toggle sidebar"
  >
    <svg
      v-if="!isCollapsed"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isCollapsed = ref(false)
const hasSidebar = ref(false)

const STORAGE_KEY = 'vitepress-sidebar-collapsed'
const ROOT_CLASS = 'sidebar-collapsed'

const syncHasSidebar = () => {
  if (typeof document === 'undefined') {
    return
  }
  hasSidebar.value = document.querySelector('.VPSidebar') !== null
}

const applyCollapseState = () => {
  if (typeof document === 'undefined') {
    return
  }

  syncHasSidebar()

  const root = document.documentElement
  const sidebar = document.querySelector('.VPSidebar')
  const content = document.querySelector('.VPContent')

  if (!hasSidebar.value) {
    root.classList.remove(ROOT_CLASS)
    sidebar?.classList.remove('collapsed')
    content?.classList.remove('sidebar-collapsed')
    return
  }

  root.classList.toggle(ROOT_CLASS, isCollapsed.value)
  sidebar?.classList.toggle('collapsed', isCollapsed.value)
  content?.classList.toggle('sidebar-collapsed', isCollapsed.value)
}

const loadState = () => {
  if (typeof window === 'undefined') {
    return
  }
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }
  applyCollapseState()
}

const saveState = () => {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, isCollapsed.value.toString())
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  saveState()
  applyCollapseState()
}

let routeTimer = null

onMounted(() => {
  loadState()
  watch(
    () => route.path,
    async () => {
      await nextTick()
      clearTimeout(routeTimer)
      routeTimer = setTimeout(applyCollapseState, 50)
    }
  )
})

onUnmounted(() => {
  clearTimeout(routeTimer)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove(ROOT_CLASS)
  }
})
</script>

<style scoped>
.sidebar-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  margin-right: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s, border-color 0.2s;
}

.sidebar-toggle:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.sidebar-toggle svg {
  color: var(--vp-c-text-2);
}

.sidebar-toggle:hover svg {
  color: var(--vp-c-brand-1);
}

@media (max-width: 959px) {
  .sidebar-toggle {
    display: none;
  }
}
</style>
