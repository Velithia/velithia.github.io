import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Velithia's Blog",
  description: "Velithia's Personal Blog",
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/velithia' }
    ]
  }
})