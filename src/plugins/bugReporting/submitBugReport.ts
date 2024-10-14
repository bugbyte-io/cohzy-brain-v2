import { StateManager } from '@libs/bugReportAgents/stateManager';
import { BugReportEval } from '@libs/bugReportAgents/types';
import { createNewThread } from '@libs/discord/createBugReportThread';
import { createBugReport } from '@libs/hasura';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface Files {
  url:string
}

interface saveRequest {
  traceId: string
  fileList: Files[]
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

      const { traceId, fileList } = request.body as saveRequest
    
      const stateManager = new StateManager()
      const state = await stateManager.fetchState(traceId)
      const lastMsg = state.messages[state.messages.length - 1]
      const bugData: BugReportEval = JSON.parse(lastMsg.content)

      bugData.bugReport.files = fileList
      
      const { threadId } = await createNewThread(bugData.bugReport, fileList)
      const saveData = await createBugReport(bugData, gameId, threadId ?? "")

      // Placeholder for bug report creation logic
      reply.code(201).send({bugReportData: saveData });

    } catch (error) {
      fastify.log.error('Failed to create bug report:', error);
      reply.code(500).send({ message: 'Failed to create bug report due to an internal error.' });
    }
  });
}
