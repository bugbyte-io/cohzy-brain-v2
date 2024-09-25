import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import { bugValidatorNode } from "./nodes/bugValidatorNode.js";

/**
 * Annotation for agent state containing messages and user information
 */
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  userInfo: Annotation<string | undefined>({
    reducer: (x, y) => y || x || "N/A",
    default: () => "N/A",
  })
});


/**
 * Main function to create the workflow graph
 */
const createBugReportAgentGraph = () => {
  const workflow = new StateGraph(AgentState)
    .addNode("bugValidatorNode", bugValidatorNode)
    .addEdge(START, "bugValidatorNode")
    .addEdge("bugValidatorNode", END);

  return workflow.compile();
};

export { createBugReportAgentGraph, AgentState };
