import { FastifyPluginAsync } from 'fastify';

const healthcheck: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      availableMemory: process.availableMemory()
    };
  });
};

export default healthcheck;