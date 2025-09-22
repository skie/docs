import DefaultTheme from 'vitepress/theme-without-fonts'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
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