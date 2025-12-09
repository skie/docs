<template>
  <div v-if="prevArticle || nextArticle" class="article-navigation">
    <div v-if="prevArticle" class="nav-item nav-prev">
      <div class="nav-label">Previous Article</div>
      <a :href="getArticlePath(prevArticle.path)" class="nav-link">
        ← {{ prevArticle.title }}
      </a>
    </div>
    <div v-if="nextArticle" class="nav-item nav-next">
      <div class="nav-label">Next Article</div>
      <a :href="getArticlePath(nextArticle.path)" class="nav-link">
        {{ nextArticle.title }} →
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { site } = useData()
const articles = ref([])

onMounted(() => {
  loadArticles()
})

const loadArticles = async () => {
  try {
    const base = site.value.base
    const metadataPath = `${base}articles-metadata.json`.replace(/\/+/g, '/')
    const response = await fetch(metadataPath)

    if (response.ok) {
      const loadedArticles = await response.json()
      // Ensure articles are sorted by date (newest first)
      articles.value = loadedArticles.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  } catch (error) {
    console.error('Error loading articles:', error)
  }
}

const getArticlePath = (path) => {
  const base = site.value.base
  return `${base}${path}`.replace(/\/+/g, '/')
}

const currentArticleIndex = computed(() => {
  const currentPath = route.path
  // Remove base from current path for comparison
  const base = site.value.base
  const pathWithoutBase = currentPath.replace(new RegExp(`^${base.replace(/\/$/, '')}`), '')
  return articles.value.findIndex(article => {
    const articlePath = article.path.startsWith('/') ? article.path : `/${article.path}`
    return articlePath === pathWithoutBase || articlePath === currentPath
  })
})

const prevArticle = computed(() => {
  const index = currentArticleIndex.value
  if (index > 0) {
    return articles.value[index - 1]
  }
  return null
})

const nextArticle = computed(() => {
  const index = currentArticleIndex.value
  if (index >= 0 && index < articles.value.length - 1) {
    return articles.value[index + 1]
  }
  return null
})
</script>

<style scoped>
.article-navigation {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.nav-item {
  flex: 1;
  max-width: 50%;
}

.nav-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.nav-link {
  display: block;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  word-wrap: break-word;
}

.nav-link:hover {
  color: var(--vp-c-brand-2);
}

.nav-next {
  text-align: right;
}

@media (max-width: 768px) {
  .article-navigation {
    flex-direction: column;
    gap: 1.5rem;
  }

  .nav-item {
    max-width: 100%;
  }

  .nav-next {
    text-align: left;
  }
}
</style>

