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
      // Workflow Engine Module — Redis-backed. The default in-memory
      // provider loses workflow state on every container restart, which
      // breaks long-running workflows (e.g. abandoned-cart reminders,
      // scheduled jobs) across deploys. Redis persists transaction state
      // and enables distributed execution across multiple instances.
      // Resolves to Modules.WORKFLOW_ENGINE in container.
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          redisUrl: process.env.WE_REDIS_URL,
        },
      },
    },
    {
      // Caching Module — Redis-backed. The Caching Module (>= v2.11.0)
      // is the non-transactional cache layer used by Medusa internals and
      // by app code via `cache.getOrCompute` etc. Redis gives us shared
      // cache across instances and persistence across restarts.
      resolve: '@medusajs/medusa/caching',
      options: {
        providers: [
          {
            resolve: '@medusajs/caching-redis',
            id: 'caching-redis',
            is_default: true,
            options: {
              redisUrl: process.env.CACHE_REDIS_URL,
            },
          },
        ],
      },
    },
    {
      // Event Module — Redis-backed. Powers Medusa's pub/sub event bus
      // via BullMQ. Required for cross-instance event delivery (e.g.
      // subscribers firing on order.placed when the storefront and
      // backend are separate processes). The default in-memory provider
      // does not propagate events across instances.
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.EVENTS_REDIS_URL,
        // Keeps job history bounded so Redis doesn't grow unbounded.
        // Tune in production per traffic profile.
        jobOptions: {
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 3600,
            count: 1000,
          },
        },
      },
    },
    {
      // Locking Module — Redis-backed. Distributed locks (via
      // container.resolve(Modules.LOCKING)) coordinate work across
      // multiple backend instances. Required for safe concurrent
      // execution of workflows, scheduled jobs, and any flow that needs
      // exactly-once semantics.
      resolve: '@medusajs/medusa/locking',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/locking-redis',
            id: 'locking-redis',
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
    {
      // Analytics Module — PostHog provider (server-side commerce
      // events). The frontend SDK is initialised in
      // apps/storefront/instrumentation-client.ts and shares the
      // same project token, so server events (order.placed,
      // order.canceled, payment.captured/refunded) and browser
      // events land under the same PostHog project. The storefront
      // persists a PostHog distinct ID on every cart via
      // cart.metadata.posthog_distinct_id; the completeCartWorkflow
      // copies cart metadata to the order, so backend subscribers
      // resolve the same actor for refunds and cancellations as
      // they did for the original order. POSTHOG_EVENTS_API_KEY
      // must be the *events/project* key, not a personal API key.
      //
      // Dev fallback: if no key is configured, we register the
      // in-memory Local provider so the backend still boots and the
      // existing analytics subscriber code path can be exercised
      // (events log at debug level). The Subscriber list is
      // identical between providers, so swapping providers does
      // not require any code changes in subscribers.
      // Resolves to Modules.ANALYTICS in the container.
      resolve: '@medusajs/medusa/analytics',
      options: {
        providers: process.env.POSTHOG_EVENTS_API_KEY
          ? [
              {
                resolve: '@medusajs/analytics-posthog',
                id: 'posthog',
                options: {
                  posthogHost: process.env.POSTHOG_HOST,
                  posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
                },
              },
            ]
          : [
              {
                resolve: '@medusajs/analytics-local',
                id: 'local',
              },
            ],
      },
    },
    {
      // Notification Module — SendGrid provider (email channel).
      // Channels are mutually exclusive per channel id, so we register
      // SendGrid only. If SENDGRID_API_KEY is missing at boot, the
      // provider will fail to construct and Medusa will refuse to start
      // — empty keys are an operator error, not a soft fallback. To
      // run without real email, comment out this module block; Medusa
      // will fall back to its built-in 'local' logger.
      // Resolves to Modules.NOTIFICATION in the container.
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-sendgrid',
            id: 'sendgrid',
            options: {
              channels: ['email'],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
            },
          },
        ],
      },
    },
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
