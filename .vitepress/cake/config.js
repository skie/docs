/**
 * CakePHP Documentation Configuration
 *
 * Centralized configuration for versions, locales, and other settings.
 * This file contains all the main configuration arrays that can be easily
 * updated to add new versions or languages.
 */

// Supported locales configuration
// To add a new language:
// 1. Add the locale code here (e.g., 'fr', 'de', 'zh')
// 2. Create corresponding sidebar files in .vitepress/cake/{locale}/
// 3. Add locale configuration in localizedVersions object below
// 4. Add locale configuration in config.js locales section
export const supportedLocales = ['en']

// Plugin configuration
export const versions = [
  {
    version: 'plugins',
    label: 'Plugins',
    displayName: 'Evgeny\'s CakePHP Plugins',
    path: '/',
    publicPath: '/',
    isCurrentVersion: true,
    sidebarFile: 'sidebar.json',
    phpVersion: '8.4',
    minPhpVersion: '8.1'
  }
]

// Localized versions for Japanese
export const localizedVersions = {
}

// Sidebar configuration
export const sidebarConfig = {
  baseDir: 'cake',
  updateLinksForCurrentVersion: true
}

