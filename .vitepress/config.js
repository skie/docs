import { defineConfig } from 'vitepress'
import { generateSidebars } from './sidebar.js'
import { versionReplacer } from './plugins/version-replacer.js'

export default defineConfig({
    srcDir: 'docs',
    base: '/docs-test/', // Set to your repository name for GitHub Pages
    title: 'Evgeny Tomenko - CakePHP Plugins',
    description: 'Professional CakePHP plugins by Evgeny Tomenko - Admin, RuleFlow, Scheduling, and SignalHandler plugins',
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
    ],
    rewrites: {
        ':version/:slug*': ':version/:slug*'
    },
    themeConfig: {
        logo: '/logo.svg',
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
            "/RuleFlow/": [
                {
                    "text": "RuleFlow Plugin",
                    "collapsed": false,
                    "items": [
                        { "text": "Overview", "link": "/RuleFlow/" },
                        { "text": "Custom Rules Guide", "link": "/RuleFlow/custom-rules-guide" },
                        { "text": "JSON Logic Operations", "link": "/RuleFlow/JsonLogic-Operations-Reference" },
                        { "text": "Regex Compatibility", "link": "/RuleFlow/regex-compatibility" }
                    ]
                }
            ],
            "/Scheduling/": [
                {
                    "text": "Scheduling Plugin",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Scheduling/" },
                        { "text": "Installation", "link": "/Scheduling/Installation" },
                        { "text": "Integration", "link": "/Scheduling/Integration" },
                        { "text": "API Reference", "link": "/Scheduling/API-Reference" },
                        { "text": "Versions", "link": "/Scheduling/Versions" }
                    ]
                }
            ],
            "/SignalHandler/": [
                {
                    "text": "SignalHandler Plugin",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/SignalHandler/" },
                        { "text": "Installation", "link": "/SignalHandler/Installation" },
                        { "text": "Integration", "link": "/SignalHandler/Integration" },
                        { "text": "API Reference", "link": "/SignalHandler/API-Reference" }
                    ]
                }
            ],
            "/Rhythm/": [
                {
                    "text": "Rhythm Plugin",
                    "collapsed": false,
                    "items": [
                        { "text": "Home", "link": "/Rhythm/" },
                        { "text": "Configuration", "link": "/Rhythm/configuration" },
                        { "text": "Rhythm User Guide", "link": "/Rhythm/rhythm" },
                    ]
                }
            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/skie' },
        ],

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
            copyright: 'Copyright © 2010-2025 Evgeny Tomenko'
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
                            { text: 'SignalHandler Plugin', link: '/SignalHandler/' }
                        ]
                    }
                ],
            }
        }
    }
})
