import DefaultTheme from 'vitepress/theme-without-fonts'
import Layout from './Layout.vue'
import DynamicGitHubLink from './components/DynamicGitHubLink.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.component('DynamicGitHubLink', DynamicGitHubLink)
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (window.renderMermaidDiagrams) {
          const unprocessedMermaid = document.querySelectorAll('.mermaid:not([data-processed])');
          if (unprocessedMermaid.length > 0) {
            window.renderMermaidDiagrams();
          }
        }
      }, 100);
    }
  }
}