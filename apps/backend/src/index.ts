import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { env } from './lib/env.js';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/context.js';

const server = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
  disableRequestLogging: false,
  requestIdLogLabel: 'reqId',
});

async function main() {
  try {
    await server.register(helmet, {
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    });

    await server.register(cors, {
      origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: true,
    });

    await server.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_MAX, 10),
      timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    });

    await server.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext,
        onError({ path, error }) {
          server.log.error(`Error in tRPC handler on path '${path}':`, error);
        },
      },
    });

    server.get('/', async (request, reply) => {
      return {
        name: 'File RAG Scanner API',
        version: '0.0.0',
        endpoints: {
          health: '/health',
          trpc: '/trpc',
        },
        documentation: 'See README.md for API documentation',
      };
    });

    server.get('/health', async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    server.setErrorHandler((error, request, reply) => {
      server.log.error(error);
      reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || 'Internal Server Error',
          statusCode: error.statusCode || 500,
        },
      });
    });

    const port = parseInt(env.PORT, 10);
    await server.listen({ port, host: env.HOST });

    server.log.info(`Server listening at http://${env.HOST}:${port}`);
    server.log.info(`tRPC endpoint: http://${env.HOST}:${port}/trpc`);
    server.log.info(`Health check: http://${env.HOST}:${port}/health`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
