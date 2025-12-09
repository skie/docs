<template>
  <div class="recent-articles">
    <div class="recent-articles-header">
      <h2 class="recent-articles-title">Recent Articles</h2>
      <a href="/articles/" class="view-all-link">View All Articles →</a>
    </div>
    <div v-if="loading" class="loading">Loading articles...</div>
    <div v-else-if="articles.length === 0" class="no-articles">
      <p>No articles found.</p>
    </div>
    <div v-else class="articles-list">
      <article
        v-for="article in articles"
        :key="article.slug"
        class="article-item"
      >
        <div class="article-header">
          <h3 class="article-title">
            <a :href="getArticlePath(article.path)">{{ article.title }}</a>
          </h3>
          <time :datetime="article.date" class="article-date">{{ formatDate(article.date) }}</time>
        </div>
        <p class="article-description">{{ article.description }}</p>
        <div v-if="article.tags && article.tags.length > 0" class="article-tags">
          <span
            v-for="tag in article.tags.slice(0, 3)"
            :key="tag"
            class="article-tag"
          >{{ tag }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'

const { site } = useData()
const articles = ref([])
const loading = ref(true)

onMounted(() => {
  loadRecentArticles()
})

const loadRecentArticles = async () => {
  try {
    const base = site.value.base
    const metadataPath = `${base}recent-articles.json`.replace(/\/+/g, '/')
    const response = await fetch(metadataPath)

    if (response.ok) {
      articles.value = await response.json()
    } else {
      console.warn('Could not load recent articles metadata')
      articles.value = []
    }
  } catch (error) {
    console.error('Error loading recent articles:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getArticlePath = (path) => {
  const base = site.value.base
  return `${base}${path}`.replace(/\/+/g, '/')
}
</script>

<style scoped>
.recent-articles {
  margin-bottom: 2rem;
}

.recent-articles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recent-articles-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
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

.loading,
.no-articles {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--vp-c-text-2);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-item {
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.article-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  flex: 1;
}

.article-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.article-title a:hover {
  color: var(--vp-c-brand-1);
}

.article-date {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  font-weight: 500;
}

.article-description {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

@media (max-width: 768px) {
  .recent-articles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .article-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

