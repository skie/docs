<template>
  <Layout>
    <template #nav-bar-content-after>
      <DynamicGitHubLink />
    </template>
    <template #home-features-before>
      <div class="home-content-wrapper">
        <div class="home-articles-column">
          <RecentArticles />
        </div>
        <div class="home-plugins-column">
          <RecentPlugins />
        </div>
      </div>
    </template>
    <template #doc-after>
      <ArticleNavigation v-if="isArticlePage" />
    </template>
  </Layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import DynamicGitHubLink from './components/DynamicGitHubLink.vue'
import ArticleNavigation from './components/ArticleNavigation.vue'
import RecentArticles from './components/RecentArticles.vue'
import RecentPlugins from './components/RecentPlugins.vue'

const { Layout } = DefaultTheme
const route = useRoute()

const isArticlePage = computed(() => {
  return route.path.startsWith('/articles/') && route.path !== '/articles/'
})
</script>
