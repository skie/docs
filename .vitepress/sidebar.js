/**
 * Sidebar Generation Module for CakePHP Documentation
 * 
 * Handles loading and processing of version-specific sidebar configurations
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { versions, getCurrentVersion, sidebarConfig, localizedVersions, getVersionsByLocale } from './cake.js'

// Get current directory for JSON imports
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Load all version-specific sidebar configurations
 * @param {string} locale - The locale to load sidebars for ('en' or 'ja')
 * @returns {Object} Object containing all sidebar configurations keyed by version
 */
export function loadSidebarConfigurations(locale = 'en') {
  const sidebars = {}
  const versionList = getVersionsByLocale(locale)

  for (const version of versionList) {
    try {
      const filePath = join(__dirname, sidebarConfig.baseDir, version.sidebarFile)
      const sidebarData = JSON.parse(readFileSync(filePath, 'utf8'))
      sidebars[version.version] = sidebarData
    } catch (error) {
      console.warn(`Warning: Could not load sidebar for version ${version.version} (${locale}):`, error.message)
    }
  }

  return sidebars
}

/**
 * Update links in sidebar items to match target path structure
 * @param {Object|Array} item - Sidebar item or array of items
 * @param {string} fromPath - Original path prefix to replace
 * @param {string} toPath - New path prefix
 * @returns {Object|Array} Updated sidebar item(s)
 */
export function updateLinks(item, fromPath, toPath) {
  if (Array.isArray(item)) {
    return item.map(subItem => updateLinks(subItem, fromPath, toPath))
  }
  
  if (typeof item !== 'object' || item === null) {
    return item
  }
  
  const updatedItem = { ...item }
  
  // Update direct links
  if (updatedItem.link) {
    updatedItem.link = updatedItem.link.replace(fromPath, toPath)
  }
  
  // Recursively update nested items
  if (updatedItem.items) {
    updatedItem.items = updateLinks(updatedItem.items, fromPath, toPath)
  }
  
  return updatedItem
}

/**
 * Generate the complete sidebar configuration for VitePress
 * @returns {Object} Complete sidebar configuration object
 */
export function generateSidebars() {
  const result = {}

  // Generate sidebars for English versions
  const englishSidebars = loadSidebarConfigurations('en')
  for (const version of versions) {
    const versionSidebar = englishSidebars[version.version]

    if (!versionSidebar) {
      console.warn(`Skipping sidebar generation for version ${version.version} - no sidebar data found`)
      continue
    }

    // Get the sidebar data for this version's path
    const sidebarData = versionSidebar[version.path]

    if (!sidebarData) {
      console.warn(`No sidebar data found for path ${version.path} in version ${version.version}`)
      continue
    }

    // Add the version-specific sidebar
    result[version.publicPath] = sidebarData

    // For the current version, also create a mapping with updated links
    if (version.isCurrentVersion && sidebarConfig.updateLinksForCurrentVersion) {
      const currentVersionSidebar = updateLinks(sidebarData, version.path, version.publicPath)
      result[version.publicPath] = currentVersionSidebar
    }
  }

  // Generate sidebars for Japanese versions
  if (localizedVersions.ja) {
    const japaneseSidebars = loadSidebarConfigurations('ja')
    for (const version of localizedVersions.ja) {
      const versionSidebar = japaneseSidebars[version.version]

      if (!versionSidebar) {
        console.warn(`Skipping sidebar generation for Japanese version ${version.version} - no sidebar data found`)
        continue
      }

      // Get the sidebar data for this version's path
      const sidebarData = versionSidebar[version.path]

      if (!sidebarData) {
        console.warn(`No sidebar data found for path ${version.path} in Japanese version ${version.version}`)
        continue
      }

      // Add the version-specific sidebar
      result[version.publicPath] = sidebarData

      // For the current version, also create a mapping with updated links
      if (version.isCurrentVersion && sidebarConfig.updateLinksForCurrentVersion) {
        const currentVersionSidebar = updateLinks(sidebarData, version.path, version.publicPath)
        result[version.publicPath] = currentVersionSidebar
      }
    }
  }

  return result
}

/**
 * Get sidebar configuration for a specific version
 * @param {string} versionNumber - Version number (e.g., '5', '4')
 * @param {string} locale - The locale ('en' or 'ja')
 * @returns {Object|null} Sidebar configuration for the version
 */
export function getSidebarForVersion(versionNumber, locale = 'en') {
  const versionList = getVersionsByLocale(locale)
  const version = versionList.find(v => v.version === versionNumber)
  if (!version) return null

  const sidebars = loadSidebarConfigurations(locale)
  const versionSidebar = sidebars[versionNumber]

  return versionSidebar ? versionSidebar[version.path] : null
}

/**
 * Validate that all required sidebar files exist
 * @param {string} locale - The locale to validate ('en', 'ja', or 'all')
 * @returns {Array} Array of missing sidebar files
 */
export function validateSidebarFiles(locale = 'all') {
  const missing = []

  // Validate English sidebars
  if (locale === 'en' || locale === 'all') {
    for (const version of versions) {
      try {
        const filePath = join(__dirname, sidebarConfig.baseDir, version.sidebarFile)
        readFileSync(filePath, 'utf8')
      } catch (error) {
        missing.push({
          locale: 'en',
          version: version.version,
          file: version.sidebarFile,
          error: error.message
        })
      }
    }
  }

  // Validate Japanese sidebars
  if ((locale === 'ja' || locale === 'all') && localizedVersions.ja) {
    for (const version of localizedVersions.ja) {
      try {
        const filePath = join(__dirname, sidebarConfig.baseDir, version.sidebarFile)
        readFileSync(filePath, 'utf8')
      } catch (error) {
        missing.push({
          locale: 'ja',
          version: version.version,
          file: version.sidebarFile,
          error: error.message
        })
      }
    }
  }

  return missing
}

export default {
  loadSidebarConfigurations,
  updateLinks,
  generateSidebars,
  getSidebarForVersion,
  validateSidebarFiles
}