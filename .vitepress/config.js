import { defineConfig } from 'vitepress'
import { generateSidebars } from './sidebar.js'
import { versionReplacer } from './plugins/version-replacer.js'
import { mermaidPlugin } from './plugins/mermaid-simple.js'

export default defineConfig({
    srcDir: 'docs',
    // base: '/docs-test/', // Set to your repository name for GitHub Pages
    base: '/docs/', // Set to your repository name for GitHub Pages
    // base: '/', // Set to your repository name for GitHub Pages
    title: 'Evgeny Tomenko - CakePHP Plugins',
    description: 'Professional CakePHP plugins by Evgeny Tomenko',
    ignoreDeadLinks: true,
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' }],
        ['link', { rel: 'shortcut icon', href: '/favicon/favicon.ico' }],
        ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' }],
        ['meta', { name: 'apple-mobile-web-app-title', content: 'CakePHP' }],
        ['link', { rel: 'manifest', href: '/favicon/site.webmanifest' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
        ['link', { href: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap', rel: 'stylesheet' }],
        ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@11.0.0/dist/mermaid.min.js' }],
    ['script', {}, `
      // Global variables for Mermaid
      window.mermaidOriginalContents = new Map();
      window.mermaidInitialized = false;

      function initMermaid() {
        const isDark = document.documentElement.classList.contains('dark');

        mermaid.initialize({
          startOnLoad: false, // We'll manually trigger rendering
          theme: isDark ? 'dark' : 'base',
          themeVariables: isDark ? {
            primaryBorderColor: '#2D7EA4',
          } : {
            primaryColor: '#2D7EA4',
            primaryTextColor: '#333333',
            primaryBorderColor: '#2D7EA4',
            lineColor: '#666666',
            secondaryColor: '#f8f9fa',
            tertiaryColor: '#e3f2fd',
            background: '#ffffff',
            mainBkg: '#ffffff',
            secondBkg: '#f8f9fa',
            tertiaryBkg: '#e3f2fd',
            textColor: '#333333',
            actorBkg: '#f8f9fa',
            actorBorder: '#2D7EA4',
            actorTextColor: '#333333',
            actorLineColor: '#999999',
            messageLineColor: '#666666',
            messageTextColor: '#333333',
            sectionBkgColor: '#f8f9fa',
            altSectionBkgColor: '#ffffff',
            gridColor: '#cccccc',
            section0: '#f8f9fa',
            section1: '#e3f2fd',
            section2: '#ffffff',
            section3: '#f8f9fa'
          },
          securityLevel: 'loose',
          logLevel: 'error'
        });
        window.mermaidInitialized = true;
      }

      function renderMermaidDiagrams() {
        if (!window.mermaidInitialized) {
          initMermaid();
        }

        // Store original content and render diagrams
        document.querySelectorAll('.mermaid').forEach((el, index) => {
          if (!el.hasAttribute('data-processed')) {
            window.mermaidOriginalContents.set(index, el.textContent);
            mermaid.run({ nodes: [el] });
          }
        });
      }

      function reRenderMermaidDiagrams() {
        if (!window.mermaidInitialized) {
          initMermaid();
        }

        // Clear and restore original content
        document.querySelectorAll('.mermaid').forEach((el, index) => {
          el.removeAttribute('data-processed');
          if (window.mermaidOriginalContents.has(index)) {
            el.innerHTML = window.mermaidOriginalContents.get(index);
          }
        });

        // Re-render with new theme
        mermaid.run();
      }

      // Initial load
      document.addEventListener('DOMContentLoaded', function() {
        renderMermaidDiagrams();
      });

      // Theme change observer
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            setTimeout(() => {
              reRenderMermaidDiagrams();
            }, 100);
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Expose function for VitePress navigation
      window.renderMermaidDiagrams = renderMermaidDiagrams;

      function processEdgeLabels() {
        document.querySelectorAll('.mermaid g.edgeLabel').forEach(edgeLabel => {
          const span = edgeLabel.querySelector('span');
          if (!span) {
            edgeLabel.style.display = 'none';
            return;
          }

          const spanText = span.textContent.trim();
          const pText = span.querySelector('p')?.textContent.trim() || '';
          const divText = span.querySelector('div')?.textContent.trim() || '';
          const hasContent = spanText || pText || divText;

          if (!hasContent) {
            edgeLabel.style.display = 'none';
          } else {
            edgeLabel.style.setProperty('display', 'block', 'important');

            const allElements = edgeLabel.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.style.display === 'none') {
                el.style.setProperty('display', '', 'important');
              }
            });
            if (span) {
              span.style.setProperty('display', '', 'important');
            }
          }
        });
      }

      setTimeout(processEdgeLabels, 100);
      setTimeout(processEdgeLabels, 500);
      setTimeout(processEdgeLabels, 2000);
    `]
    ],
    rewrites: {
        ':version/:slug*': ':version/:slug*'
    },
    themeConfig: {
        logo: '/logo.svg',
        // start-sidebar
        sidebar: {
            "/": [
                {
                    "text": "Evgeny's CakePHP Plugins",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/" }
                    ]
                }
            ],
            "/Broadcasting/": [
                {
                    "text": "Broadcasting",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Broadcasting/" }
                    ]
                }
            ],
            "/BroadcastingNotification/": [
                {
                    "text": "BroadcastingNotification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/BroadcastingNotification/" }
                    ]
                }
            ],
            "/Notification/": [
                {
                    "text": "Notification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Notification/" },
                    ]
                }
            ],
            "/NotificationUI/": [
                {
                    "text": "NotificationUI",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/NotificationUI/" }
                    ]
                }
            ],
            "/Rhythm/": [
                {
                    "text": "Rhythm Plugin",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Rhythm/" },
                        { "text": "Rhythm Plugin", "link": "/Rhythm/rhythm" },
                        { "text": "Configuration", "link": "/Rhythm/configuration" },
                    ]
                }
            ],
            "/RocketChatNotification/": [
                {
                    "text": "RocketChatNotification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/RocketChatNotification/" }
                    ]
                }
            ],
            "/RuleFlow/": [
                {
                    "text": "RuleFlow",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/RuleFlow/" },
                        { "text": "Custom Rules Guide", "link": "/RuleFlow/custom-rules-guide" },
                        { "text": "JsonLogic Operations Reference", "link": "/RuleFlow/JsonLogic-Operations-Reference" },
                        { "text": "Regex Compatibility", "link": "/RuleFlow/regex-compatibility" },
                    ]
                }
            ],
            "/Scheduling/": [
                {
                    "text": "Scheduling",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Scheduling/" },
                        { "text": "Installation", "link": "/Scheduling/Installation" },
                        { "text": "Integration", "link": "/Scheduling/Integration" },
                        { "text": "API Reference", "link": "/Scheduling/API-Reference" },
                    ]
                }
            ],
            "/SevenNotification/": [
                {
                    "text": "SevenNotification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/SevenNotification/" }
                    ]
                }
            ],
            "/SignalHandler/": [
                {
                    "text": "SignalHandler",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/SignalHandler/Home" },
                        { "text": "Installation", "link": "/SignalHandler/Installation" },
                        { "text": "Integration", "link": "/SignalHandler/Integration" },
                        { "text": "API Reference", "link": "/SignalHandler/API-Reference" },
                    ]
                }
            ],
            "/SlackNotification/": [
                {
                    "text": "SlackNotification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/SlackNotification/" }
                    ]
                }
            ],
            "/TelegramNotification/": [
                {
                    "text": "TelegramNotification",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/TelegramNotification/" }
                    ]
                }
            ]
        },
        // end-sidebar
        // socialLinks: [
        //     { icon: 'github', link: 'https://github.com/skie' },
        // ],

        // Let's only index latest version in search to speed up indexing.
        search: {
            provider: 'local',
            options: {
                async _render(src, env, md) {
                        const html = await md.render(src, env)

                        return html
                }
            }
        },
        // editLink: {
            // pattern: 'https://github.com/skie/cakephp-plugins-docs/edit/main/:path',
            // text: 'Edit this page on GitHub'
        // },
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2008-2025 Evgeny Tomenko'
        },
        lastUpdated: {
            text: 'Updated at',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'framework': ['vue']
                }
            }
        }
    },
    markdown: {
        lineNumbers: true,
        config: (md) => {
            md.use(versionReplacer)

            // Handle Mermaid code blocks
            const fence = md.renderer.rules.fence
            md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
                const token = tokens[idx]
                const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
                const langName = info ? info.split(/\s+/g)[0] : ''

                if (langName === 'mermaid') {
                    // Clean up the content and preserve line breaks
                    const content = token.content
                        .replace(/&gt;/g, '>')
                        .replace(/&lt;/g, '<')
                        .replace(/&amp;/g, '&')
                        .trim()

                    return `<pre class="mermaid">${content}</pre>`
                }

                return fence(tokens, idx, options, env, renderer)
            }
        }
    },
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    {
                        text: 'Plugins',
                        items: [
                            { text: 'RuleFlow Plugin', link: '/RuleFlow/' },
                            { text: 'Scheduling Plugin', link: '/Scheduling/' },
                            { text: 'SignalHandler Plugin', link: '/SignalHandler/Home' },
                            { text: 'Rhythm Plugin', link: '/Rhythm/' },
                            { text: 'Notification Plugin', link: '/Notification/' },
                            { text: 'Broadcasting Plugin', link: '/Broadcasting/' },
                            { text: 'BroadcastingNotification', link: '/BroadcastingNotification/' },
                            { text: 'NotificationUI', link: '/NotificationUI/' },
                            { text: 'RocketChatNotification', link: '/RocketChatNotification/' },
                            { text: 'SevenNotification', link: '/SevenNotification/' },
                            { text: 'SlackNotification', link: '/SlackNotification/' },
                            { text: 'TelegramNotification', link: '/TelegramNotification/' },
                        ]
                    }
                ],
            }
        }
    }
})
