import api from './api';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => {
      return {
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn().mockResolvedValue('value')
      };
    })
  };
});

describe('api', () => {
  it('responds with hello, world!', async () => {
    const server = api({
      title: 'my awesome service',
      redisUrl: new URL('redis://localhost:6379')
    });
    const response = await server.inject({
      method: 'GET',
      url: '/api'
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello, world! I am my awesome service');
  });
});
