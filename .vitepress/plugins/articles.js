import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import matter from 'gray-matter'

/**
 * VitePress plugin to scan articles and generate metadata
 * Articles should be in docs/articles/ directory
 */
export function articlesPlugin(recentCount = 5) {
  return {
    name: 'articles-plugin',
    configureServer(server) {
      // Generate articles metadata on server start
      generateArticlesMetadata(recentCount)
    },
    buildStart() {
      // Generate articles metadata on build start
      generateArticlesMetadata(recentCount)
    }
  }
}

/**
 * Generate articles metadata from markdown files
 * @param {number} recentCount - Number of recent articles to include in recent articles file (default: 5)
 * @returns {Array} Array of article metadata
 */
export function generateArticlesMetadata(recentCount = 5) {
  const articlesDir = join(process.cwd(), 'docs', 'articles')
  const articles = []
  const fs = require('fs')

  try {
    if (!fs.existsSync(articlesDir) || !statSync(articlesDir).isDirectory()) {
      return articles
    }

    const files = readdirSync(articlesDir)

    for (const file of files) {
      if (extname(file) !== '.md') continue
      // Skip index.md as it's the listing page
      if (basename(file, '.md') === 'index') continue

      const filePath = join(articlesDir, file)
      const fileContent = readFileSync(filePath, 'utf-8')
      const { data: frontmatter, content } = matter(fileContent)

      // Extract short description from content if not in frontmatter
      let description = frontmatter.description || ''
      if (!description && content) {
        // Get first paragraph or first 200 characters
        const firstParagraph = content.split('\n\n').find(p => p.trim().length > 0) || ''
        description = firstParagraph.trim().substring(0, 200)
        if (firstParagraph.length > 200) {
          description += '...'
        }
      }

      const slug = basename(file, '.md')

      // URL-encode the slug for paths (spaces become %20)
      const encodedSlug = encodeURIComponent(slug).replace(/'/g, '%27')

      // Normalize date to YYYY-MM-DD format
      let articleDate = frontmatter.date || new Date().toISOString().split('T')[0]
      if (articleDate instanceof Date) {
        articleDate = articleDate.toISOString().split('T')[0]
      } else if (typeof articleDate === 'string' && articleDate.includes('T')) {
        articleDate = articleDate.split('T')[0]
      }

      articles.push({
        title: frontmatter.title || slug,
        date: articleDate,
        description: description,
        tags: frontmatter.tags || [],
        slug: slug,
        path: `/articles/${encodedSlug}`,
        file: file
      })
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Write metadata to a JSON file that can be imported
    const metadataPath = join(process.cwd(), '.vitepress', 'articles-metadata.json')
    const publicMetadataPath = join(process.cwd(), 'docs', 'public', 'articles-metadata.json')

    // Ensure public directory exists
    const publicDir = join(process.cwd(), 'docs', 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    fs.writeFileSync(metadataPath, JSON.stringify(articles, null, 2))
    fs.writeFileSync(publicMetadataPath, JSON.stringify(articles, null, 2))

    // Generate recent articles file (limited to recentCount)
    const recentArticles = articles.slice(0, recentCount)
    const recentArticlesPath = join(process.cwd(), 'docs', 'public', 'recent-articles.json')
    fs.writeFileSync(recentArticlesPath, JSON.stringify(recentArticles, null, 2))

    return articles
  } catch (error) {
    console.warn('Articles directory not found or error reading articles:', error.message)
    return []
  }
}

/**
 * Get articles metadata (for use in components)
 * @returns {Array} Array of article metadata
 */
export function getArticlesMetadata() {
  try {
    const metadataPath = join(process.cwd(), '.vitepress', 'articles-metadata.json')
    const fs = require('fs')
    const data = fs.readFileSync(metadataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

