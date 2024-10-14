import { StateManager } from '@libs/bugReportAgents/stateManager';
import { BugReportEval } from '@libs/bugReportAgents/types';
import { createBugReport } from '@libs/hasura';
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
      
      const gameId = '2641339a-4129-406b-80da-b06281a1b2f6'

      console.log('data', request.body)

      const {traceId} = request.body as saveRequest

      const stateManager = new StateManager()
      const state = await stateManager.fetchState(traceId)
      const lastMsg = state.messages[state.messages.length - 1]
      const bugData: BugReportEval = JSON.parse(lastMsg.content)

      const saveData = await createBugReport(bugData, gameId)

      // Placeholder for bug report creation logic
      reply.code(201).send({bugReportData: saveData });
    } catch (error) {
      fastify.log.error('Failed to create bug report:', error);
      reply.code(500).send({ message: 'Failed to create bug report due to an internal error.' });
    }
  });
}
