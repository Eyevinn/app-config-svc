import api from './api';

const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
const server = api({ title: 'Application Configuration Service', redisUrl });

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    throw err;
  }
  console.log(`Server listening on ${address}`);
});

export default server;
