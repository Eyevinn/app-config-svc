import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginCallback } from 'fastify';
import { ErrorReply, ErrorResponse, errorReply } from './api/errors';
import { Redis } from 'ioredis';
import { InvalidInputError, NotFoundError } from './utils/error';

export interface ApiConfigOptions {
  redisUrl: URL;
}

export const ConfigObject = Type.Object({
  key: Type.String({ description: 'The key of the configuration object' }),
  value: Type.String({ description: 'The value of the configuration object' })
});
export type ConfigObject = Static<typeof ConfigObject>;

const apiConfig: FastifyPluginCallback<ApiConfigOptions> = (
  fastify,
  opts,
  next
) => {
  const redis = new Redis(opts.redisUrl.toString());

  fastify.setErrorHandler((error, request, reply) => {
    reply.code(500).send({ reason: error.message });
  });

  fastify.post<{ Body: ConfigObject; Reply: ConfigObject | ErrorResponse }>(
    '/config',
    {
      schema: {
        description: 'Create a new configuration object',
        body: ConfigObject,
        response: {
          200: ConfigObject,
          400: ErrorResponse,
          500: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      try {
        const res = await redis.set(request.body.key, request.body.value);
        if (res !== 'OK') {
          throw new InvalidInputError({ reason: 'Failed to set value' });
        }
        reply.code(200).send(request.body);
      } catch (error) {
        errorReply(reply as ErrorReply, error);
      }
    }
  );

  fastify.get<{
    Params: { key: string };
    Reply: ConfigObject | ErrorResponse;
  }>(
    '/config/:key',
    {
      schema: {
        description: 'Get a configuration object by key',
        response: {
          200: ConfigObject,
          404: ErrorResponse,
          500: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      try {
        const value = await redis.get(request.params.key);
        if (!value) {
          throw new NotFoundError({ id: request.params.key });
        }
        reply.code(200).send({ key: request.params.key, value });
      } catch (error) {
        errorReply(reply as ErrorReply, error);
      }
    }
  );

  next();
};

export default apiConfig;
