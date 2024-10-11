import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StateManager } from '../../libs/bugReportAgents/stateManager';

/**
 * Fetches the state for a given traceId.
 *
 * @param fastify - The Fastify instance.
 */
export async function fetchStateHandler(fastify: FastifyInstance) {
  fastify.get<{
    Params: { traceId: string };
  }>('/fetch-state/:traceId', async (request: FastifyRequest<{ Params: { traceId: string } }>, reply: FastifyReply) => {
    const { traceId } = request.params;

    try {
      const stateManager = new StateManager();
      const state = await stateManager.fetchState(traceId);

      if (!state) {
        reply.code(404).send({ error: 'State not found' });
        return;
      }

      reply.send(state);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}
