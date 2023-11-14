import { defineConfig } from '@koishijs/vitepress'

const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

export default defineConfig({
  title: '@koishijs/common',

  locales: {
    'zh-CN': require('./zh-CN'),
    ...(isDev ? {
    } : {}),
  },

  themeConfig: {
    indexName: 'koishi-common',
    logo: 'https://koishi.chat/logo.png',

    socialLinks: {
      github: 'https://github.com/koishijs/common',
    },
  },
})
