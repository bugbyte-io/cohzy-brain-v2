import { StateManager } from '@libs/bugReportAgents/stateManager';
import { BugReportEval } from '@libs/bugReportAgents/types';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

interface saveRequest {
  traceId: string
}

interface BugReportState {

}

/**
 * Registers the createBugReport endpoint.
 * @param fastify - The Fastify instance to register the route on.
 */
export function registerCreateBugReportRoute(fastify: FastifyInstance): void {
  fastify.post('/bugReport/create-bug-report', async (request: FastifyRequest, reply: FastifyReply) => {
    try {

      console.log('data', request.body)

      const {traceId} = request.body as saveRequest

      const stateManager = new StateManager()
      const state = await stateManager.fetchState(traceId)
      const lastMsg = state.messages[state.messages.length - 1]
      const bugData: BugReportEval = JSON.parse(lastMsg.content)

      console.log('bugData', bugData)


      // Placeholder for bug report creation logic
      reply.code(201).send({ message: 'Bug report created successfully.' });
    } catch (error) {
      fastify.log.error('Failed to create bug report:', error);
      reply.code(500).send({ message: 'Failed to create bug report due to an internal error.' });
    }
  });
}
