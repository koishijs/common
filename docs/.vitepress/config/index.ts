import { defineConfig } from '@koishijs/vitepress'

const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

export default defineConfig({
  title: '@koishijs/common',

  head: [
    ['link', { rel: 'icon', href: 'https://koishi.chat/logo.png' }],
    ['link', { rel: 'manifest', href: '/zh-CN/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#5546a3' }]
  ],

  locales: {
    'zh-CN': require('./zh-CN'),
    ...(isDev ? {
    } : {}),
  },

  themeConfig: {
    indexName: 'common',
    logo: 'https://koishi.chat/logo.png',

    socialLinks: {
      github: 'https://github.com/koishijs/common',
    },
  },
})
