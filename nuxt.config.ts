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
      ],
    }
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-11-01',
})