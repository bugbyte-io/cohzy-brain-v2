import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import { bugValidatorNode } from "./nodes/bugValidatorNode";
import { bugEntryNode } from "./nodes/entryNode";

/**
 * Annotation for agent state containing messages, user information, and whether a question was asked.
 */
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  userInfo: Annotation<string | undefined>({
    reducer: (x, y) => y || x || "N/A",
    default: () => "N/A",
  }),
  askedQuestion: Annotation<boolean>({
    reducer: (x, y) => y !== undefined ? y : x !== undefined ? x : false,
    default: () => false,
  })
});

/**
 * Determines the next node based on the askedQuestion state.
 */
const determineNextNode = (state: typeof AgentState.State): "bugValidatorNode" | typeof END => {
  return state.askedQuestion ? END : "bugValidatorNode";
};

/**
 * Main function to create the workflow graph.
 */
const createBugReportAgentGraph = () => {
  const workflow = new StateGraph(AgentState)
    .addNode("bugEntryNode", bugEntryNode)
    .addNode("bugValidatorNode", bugValidatorNode)
    .addEdge(START, "bugEntryNode")
    .addConditionalEdges("bugEntryNode", determineNextNode, {
      bugValidatorNode: "bugValidatorNode",
      [END]: END,
    })
    .addEdge("bugValidatorNode", END);

  return workflow.compile();
};

export { createBugReportAgentGraph, AgentState };
