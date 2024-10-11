import { HumanMessage } from "@langchain/core/messages";
import BugReportAgentGraph from "@libs/bugReportAgents/bugReportAgent";
import { StateManager } from "@libs/bugReportAgents/stateManager";
import { UpstashHandler } from "@libs/upstash";
import { trace } from "console";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { StatementSync } from "node:sqlite";
import { userInfo } from "os";

// Define the schema for the request body
const bugReportSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    traceId: { type: "string" },
    userId: { type: "string" },
  },
  required: ["message", "traceId"],
  additionalProperties: false,
} as const;

type BugReportBody = FromSchema<typeof bugReportSchema>;

/**
 * Handles bug report submissions.
 * @param request - Fastify request object.
 * @param reply - Fastify reply object.
 */
async function handleBugReport(
  request: FastifyRequest<{ Body: BugReportBody }>,
  reply: FastifyReply
): Promise<void> {
  const { message, traceId, userId } = request.body as BugReportBody;

  if (!userId) {
    reply.code(500).send({
      status: "failure",
      result: "missing userId",
    });
    return;
  }

  const stateManager = new StateManager();
  let state = traceId ? await stateManager.fetchState(traceId) : null;

  if (!state) {
    state = await stateManager.createDefaultState(userId);
  }

  if (!state.messages.find((msg) => msg.content === message)) {
    state = await stateManager.addMessage(state, "HumanMessage", message);
  }

  console.log("state", state);

  // Create the bug report agent graph
  const agent = new BugReportAgentGraph();
  const bugReportGraph = agent.createBugReportAgentGraph();

  // // Run the graph and obtain the result state
  try {
    const resultState = await bugReportGraph.invoke(state, {
      configurable: {
        traceId: state.traceId,
      },
      metadata: {
        userInfo,
      },
    });
    const lastMessage = resultState.messages[resultState.messages.length - 1];
    reply.code(200).send({ results: lastMessage, traceId: state.traceId });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error:", error);
    reply.code(500).send({
      status: "failure",
      result: "something went wrong",
    });
  }
}

export default async function bugReportingPlugin(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{ Body: BugReportBody }>("/report-bug", {
    schema: {
      body: bugReportSchema,
    },
    handler: handleBugReport,
  });
}
