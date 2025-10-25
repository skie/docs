export function mermaidPlugin() {
  return {
    name: 'mermaid-plugin',
    transformIndexHtml(html) {
      console.log('Mermaid plugin: transformIndexHtml called')

      // Just inject the script for now
      return html.replace(
        /<head>/,
        `<head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Mermaid script loaded');
              mermaid.initialize({
                startOnLoad: true,
                theme: 'default'
              });
            });
          </script>`
      )
    }
  }
}
