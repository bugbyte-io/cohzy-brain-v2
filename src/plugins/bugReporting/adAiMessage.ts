import { FastifyReply, FastifyRequest } from 'fastify';
import { StateManager } from '@libs/bugReportAgents/stateManager';
import { ChatData } from '@libs/upstash/types';
import { unknown } from 'zod';

/**
 * Route handler for adding an AI-generated message to the chat.
 * @param request - The Fastify request object, containing the chat data and message details.
 * @param reply - The Fastify reply object for sending responses.
 */
async function adAiMessageHandler(request: FastifyRequest<{ Body: { traceId: string; content: string; display: boolean } }>, reply: FastifyReply): Promise<void> {
  try {


    const { traceId, content, display } = request.body;

    console.log({ 'hello': 'world' })
    console.log('traceId', traceId)

    const stateManager = new StateManager();
    const currentState: ChatData = await stateManager.fetchState(traceId);

    if (!currentState) {
      const state = stateManager.createDefaultState('unknown',traceId)

      reply.status(404).send({ message: 'Chat state not found.' });
      return;
    }

    console.log("content", content)
    console.log('display', display)


    const updatedState = await stateManager.addMessage(currentState, 'AiMessage', content, display);

    reply.send({ message: 'AI message added successfully.', updatedState });
  } catch (error) {
    console.error('Failed to add AI message:', error);
    reply.status(500).send({ message: 'Failed to add AI message due to an internal error.' });
  }
}

// Register the route handler
export function registerAdAiMessageRoute(server: any): void {
  server.post('/ad-ai-message', adAiMessageHandler);
}
