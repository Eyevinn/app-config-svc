import api from './api';
import { KEY_PREFIX } from './api_config';

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue('value'),
  del: jest.fn().mockResolvedValue(1),
  scan: jest.fn().mockResolvedValue(['0', []]),
  keys: jest.fn().mockResolvedValue([])
};

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => mockRedis)
  };
});

describe('api_config key prefix isolation', () => {
  let server: ReturnType<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    server = api({
      title: 'test',
      redisUrl: new URL('redis://localhost:6379')
    });
  });

  describe('POST /api/v1/config', () => {
    it('stores keys with osc:params: prefix', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/config',
        payload: { key: 'mykey', value: 'myvalue' }
      });

      expect(response.statusCode).toBe(200);
      expect(mockRedis.set).toHaveBeenCalledWith(
        KEY_PREFIX + 'mykey',
        'myvalue'
      );
    });

    it('returns the original key (without prefix) in response', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/config',
        payload: { key: 'mykey', value: 'myvalue' }
      });

      const body = JSON.parse(response.body);
      expect(body.key).toBe('mykey');
    });
  });

  describe('GET /api/v1/config/:key', () => {
    it('reads keys with osc:params: prefix', async () => {
      mockRedis.get.mockResolvedValue('myvalue');

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/config/mykey'
      });

      expect(response.statusCode).toBe(200);
      expect(mockRedis.get).toHaveBeenCalledWith(KEY_PREFIX + 'mykey');
    });

    it('returns the original key (without prefix) in response', async () => {
      mockRedis.get.mockResolvedValue('myvalue');

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/config/mykey'
      });

      const body = JSON.parse(response.body);
      expect(body.key).toBe('mykey');
      expect(body.value).toBe('myvalue');
    });

    it('returns 404 when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/config/nonexistent'
      });

      expect(response.statusCode).toBe(404);
      expect(mockRedis.get).toHaveBeenCalledWith(KEY_PREFIX + 'nonexistent');
    });
  });

  describe('DELETE /api/v1/config/:key', () => {
    it('deletes keys with osc:params: prefix', async () => {
      mockRedis.get.mockResolvedValue('myvalue');
      mockRedis.del.mockResolvedValue(1);

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/v1/config/mykey'
      });

      expect(response.statusCode).toBe(200);
      expect(mockRedis.get).toHaveBeenCalledWith(KEY_PREFIX + 'mykey');
      expect(mockRedis.del).toHaveBeenCalledWith(KEY_PREFIX + 'mykey');
    });

    it('returns 404 when deleting a key that does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/v1/config/nonexistent'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/config', () => {
    it('scans only keys matching the osc:params: prefix', async () => {
      mockRedis.scan.mockResolvedValue(['0', [KEY_PREFIX + 'k1']]);
      mockRedis.keys.mockResolvedValue([KEY_PREFIX + 'k1']);
      mockRedis.get.mockResolvedValue('v1');

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/config'
      });

      expect(response.statusCode).toBe(200);
      expect(mockRedis.scan).toHaveBeenCalledWith(
        0,
        'MATCH',
        KEY_PREFIX + '*',
        'COUNT',
        20
      );
    });

    it('strips prefix from keys returned in listing', async () => {
      mockRedis.scan.mockResolvedValue(['0', [KEY_PREFIX + 'k1']]);
      mockRedis.keys.mockResolvedValue([KEY_PREFIX + 'k1']);
      mockRedis.get.mockResolvedValue('v1');

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/config'
      });

      const body = JSON.parse(response.body);
      expect(body.items[0].key).toBe('k1');
    });

    it('applies match pattern with prefix prepended', async () => {
      mockRedis.scan.mockResolvedValue(['0', []]);
      mockRedis.keys.mockResolvedValue([]);

      await server.inject({
        method: 'GET',
        url: '/api/v1/config?match=foo*'
      });

      expect(mockRedis.scan).toHaveBeenCalledWith(
        0,
        'MATCH',
        KEY_PREFIX + 'foo*',
        'COUNT',
        20
      );
    });
  });
});
