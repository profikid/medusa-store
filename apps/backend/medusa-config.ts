import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false,
      sslmode: 'disable',
    },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  admin: {
    vite: (config) => {
      return {
        ...config,
        server: {
          host: '0.0.0.0',
          // Allow all hosts when running in Docker (development mode)
          // In production, this should be more restrictive
          allowedHosts: [
            'localhost',
            '.localhost',
            '127.0.0.1',
            'medusa.tracecore.profikid.nl',
            'store.medusa.tracecore.profikid.nl',
          ],
          hmr: {
            // HMR websocket port inside container
            port: 5173,
            // Port browser connects to (exposed in docker-compose.yml)
            clientPort: 5173,
            // HMR needs to talk back through Traefik on the same hostname
            protocol: 'wss',
            clientHost: 'medusa.tracecore.profikid.nl',
          },
        },
      }
    },
  },
  modules: [
    {
      // Stripe Module Provider — included by default in @medusajs/medusa.
      // Provides Payment Element checkout (cards, iDEAL, Bancontact, SEPA, Apple Pay, Google Pay).
      // Provider ID is "stripe" — Medusa exposes it as "pp_stripe_stripe" in the storefront.
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
  ],
})
