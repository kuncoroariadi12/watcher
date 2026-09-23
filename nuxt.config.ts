export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss'],

  tailwindcss: {
    quiet: true,
  },

  routeRules: {
  '/api/n8n/**': {
    proxy: 'https://n8n.devss.my.id/**'
  }
},

  typescript: {
    typeCheck: false,
    shim: false,
  },

  app: {
    head: {
      title: 'Watcher - MDM Email Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F03131' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preload', href: '/fonts/montserrat-800-watcher.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      ],
    }
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-11-01',
})