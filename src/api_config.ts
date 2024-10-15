import { Static, Type } from '@sinclair/typebox';
import fastifyAcceptsSerializer from '@fastify/accepts-serializer';
import { FastifyPluginCallback } from 'fastify';
import { ErrorReply, ErrorResponse, errorReply } from './api/errors';
import { Redis } from 'ioredis';
import { InvalidInputError, NotFoundError } from './utils/error';

export interface ApiConfigOptions {
  redisUrl: URL;
  defaultCacheAge: number;
}

export const ConfigObject = Type.Object({
  key: Type.String({ description: 'The key of the configuration object' }),
  value: Type.String({ description: 'The value of the configuration object' })
});
export type ConfigObject = Static<typeof ConfigObject>;
export const PageQuery = Type.Object({
  match: Type.Optional(Type.String()),
  offset: Type.Optional(Type.Number({ minimum: 0 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 }))
});
export type PageQuery = Static<typeof PageQuery>;
export const ConfigObjectList = Type.Object({
  offset: Type.Number(),
  limit: Type.Number(),
  total: Type.Number(),
  items: Type.Array(ConfigObject)
});
export type ConfigObjectList = Static<typeof ConfigObjectList>;
export const SuccessResponse = Type.Object({
  message: Type.String({ description: 'Success message' })
});
export type SuccessResponse = Static<typeof SuccessResponse>;

const apiConfig: FastifyPluginCallback<ApiConfigOptions> = (
  fastify,
  opts,
  next
) => {
  const redis = new Redis(opts.redisUrl.toString());

  fastify.setErrorHandler((error, request, reply) => {
    reply.code(500).send({ reason: error.message });
  });

  fastify.register(fastifyAcceptsSerializer);

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
    Querystring: PageQuery;
    Reply: ConfigObjectList | ErrorResponse;
  }>(
    '/config',
    {
      schema: {
        description: 'Get all configuration objects in a paginated list',
        querystring: PageQuery,
        response: {
          200: ConfigObjectList,
          500: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      try {
        const limit = request.query.limit || 20;
        const cursor = request.query.offset || 0;
        const [newCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          request.query.match || '*',
          'COUNT',
          limit
        );
        const total = await redis.dbsize();
        const items = [];
        for (const key of keys) {
          const value = await redis.get(key);
          if (value) {
            items.push({ key, value });
          }
        }
        reply.code(200).send({
          offset: parseInt(newCursor),
          limit: items.length > limit ? items.length : limit,
          total,
          items
        });
      } catch (err) {
        errorReply(reply as ErrorReply, err);
      }
    }
  );

  fastify.get<{
    Params: { key: string };
    Reply: ConfigObject | ErrorResponse;
  }>(
    '/config/:key',
    {
      config: {
        serializers: [
          {
            regex: /^text\/plain$/,
            serializer: (data: ConfigObject) => {
              return data.value;
            }
          }
        ]
      },
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
        reply
          .code(200)
          .header('Cache-Control', `max-age=${opts.defaultCacheAge}`)
          .send({ key: request.params.key, value });
      } catch (error) {
        errorReply(reply as ErrorReply, error);
      }
    }
  );

  fastify.delete<{
    Params: { key: string };
    Reply: SuccessResponse | ErrorResponse;
  }>(
    '/config/:key',
    {
      schema: {
        description: 'Delete a configuration object by key',
        response: {
          200: SuccessResponse,
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
        await redis.del(request.params.key);
        reply.code(200).send({ message: 'Deleted' });
      } catch (error) {
        errorReply(reply as ErrorReply, error);
      }
    }
  );

  next();
};

export default apiConfig;
