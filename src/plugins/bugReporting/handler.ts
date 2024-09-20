import { FastifyPluginAsync } from 'fastify';

const bugReporting: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/bug-report/create', async (request, reply) => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    };
  });
};

export default bugReporting;