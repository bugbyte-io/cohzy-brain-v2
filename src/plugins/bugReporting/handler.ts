import { HumanMessage } from '@langchain/core/messages';
import { createBugReportAgentGraph } from '../../libs/bugReportAgents/bugReportAgent.js';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

// Define the schema for the request body
const bugReportSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    traceId: { type: 'string' }
  },
  required: ['message', 'traceId'],
  additionalProperties: false
} as const;

type BugReportBody = FromSchema<typeof bugReportSchema>;

/**
 * Handles bug report submissions.
 * @param request - Fastify request object.
 * @param reply - Fastify reply object.
 */
async function handleBugReport(request: FastifyRequest<{ Body: BugReportBody }>, reply: FastifyReply): Promise<void> {
  const { message, traceId } = request.body;

  console.log('fire')
  // Create the bug report agent graph
  const bugReportGraph = createBugReportAgentGraph();

  // Define initial state for the graph
  const initialState = {
    messages: [new HumanMessage('This is a test message')],
    userInfo: traceId
  };

  // Run the graph and obtain the result state
  try {
    const resultState = await bugReportGraph.invoke(initialState);
    reply.code(200).send({
      status: 'success',
      result: resultState.messages
    });
  } catch (error) {
  
    console.log('error', error)
    reply.code(500).send({
      status: 'failure',
      result: 'something went wrong'
    });

  }

}

export default async function bugReportingPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: BugReportBody }>('/report-bug', {
    schema: {
      body: bugReportSchema
    },
    handler: handleBugReport
  });
}