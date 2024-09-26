import { HumanMessage } from '@langchain/core/messages';
import { createBugReportAgentGraph } from '../../libs/bugReportAgents/bugReportAgent';
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
// async function handleBugReport(request: FastifyRequest<{ Body: BugReportBody }>, reply: FastifyReply): Promise<void> {
async function handleBugReport(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { message, traceId } = request.body as BugReportBody;

  // Create the bug report agent graph
  const bugReportGraph = createBugReportAgentGraph();

  // Define initial state for the graph
  const initialState = {
    messages: [new HumanMessage(message)], // Use the incoming message
    userInfo: traceId
  };

  // Run the graph and obtain the result state
  try {
    const resultState = await bugReportGraph.invoke(initialState);
    const lastMessage = resultState.messages[resultState.messages.length - 1];
    reply.code(200).send({
      status: 'success',
      result: lastMessage
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error:', error);
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