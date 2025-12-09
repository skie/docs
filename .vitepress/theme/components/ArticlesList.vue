<template>
  <div class="articles-list">
    <div v-if="loading" class="loading">Loading articles...</div>
    <div v-else-if="articles.length === 0" class="no-articles">
      <p>No articles found.</p>
    </div>
    <div v-else>
      <div class="articles-grid">
        <article
          v-for="article in paginatedArticles"
          :key="article.slug"
          class="article-card"
        >
          <h2 class="article-title">
            <a :href="article.path">{{ article.title }}</a>
          </h2>
          <div class="article-meta">
            <time :datetime="article.date">{{ formatDate(article.date) }}</time>
          </div>
          <p class="article-description">{{ article.description }}</p>
          <div v-if="article.tags && article.tags.length > 0" class="article-tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="article-tag"
            >{{ tag }}</span>
          </div>
          <a :href="article.path" class="article-link">Read more →</a>
        </article>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vitepress'

const route = useRoute()
const router = useRouter()

const articles = ref([])
const loading = ref(true)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Get page from query parameter
onMounted(() => {
  const pageParam = route.query.page
  if (pageParam) {
    currentPage.value = parseInt(pageParam) || 1
  }
  loadArticles()
})

const loadArticles = async () => {
  try {
    // Try to load from the generated metadata file in public directory
    const metadataPath = '/articles-metadata.json'
    const response = await fetch(metadataPath)

    if (response.ok) {
      const loadedArticles = await response.json()
      // Ensure articles are sorted by date (newest first)
      articles.value = loadedArticles.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else {
      // Fallback: try to load from a data file
      console.warn('Could not load articles metadata')
      articles.value = []
    }
  } catch (error) {
    console.error('Error loading articles:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => {
  return Math.ceil(articles.value.length / itemsPerPage.value)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return articles.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Update URL without reload
    const url = new URL(window.location)
    if (page === 1) {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', page.toString())
    }
    window.history.pushState({}, '', url)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.articles-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading,
.no-articles {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-2);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.article-card {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--vp-c-divider);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.article-title a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}

.article-title a:hover {
  color: var(--vp-c-brand-2);
}

.article-meta {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.article-meta time {
  font-weight: 500;
}

.article-description {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  line-height: 1.6;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.article-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.article-link {
  display: inline-block;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.article-link:hover {
  color: var(--vp-c-brand-2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

