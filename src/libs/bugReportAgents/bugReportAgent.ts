import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import { bugValidatorNode } from "./nodes/validation/bugValidatorNode";
import { bugEntryNode } from "./nodes/entryNode/entryNode";
import { answerQuestionNode } from "../genericAgent/answerNode";
import { bugPlausibilityNode } from "./nodes/plausabilityNode/bugPlausibilityNode";
import * as fs from 'fs';
import {graphFlowNode, graphFlowDecision} from "@libs/logging/flowLogger";

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
  }),
  plausabilityPass: Annotation<boolean>({
    reducer: (x, y) => y !== undefined ? y : x !== undefined ? x : false,
    default: () => false,
  }),
  plausabilityChecked: Annotation<boolean>({
    reducer: (x, y) => y !== undefined ? y : x !== undefined ? x : false,
    default: () => false,
  }),
  validationPass: Annotation<boolean>({
    reducer: (x, y) => y !== undefined ? y : x !== undefined ? x : false,
    default: () => false,
  })
});

/**
 * Determines the next node based on the askedQuestion state.
 */
const determineNextNode = (state: typeof AgentState.State) => {
  graphFlowNode('running determineNextNode')

  if (state.askedQuestion) {
    graphFlowDecision('going to answerQuestionNode')
    return "answerQuestionNode"
  } else {
    graphFlowDecision('going to bugPlausibilityNode')
    return "bugPlausibilityNode"
  }
};

const determinePlausabilityNext = (state: typeof AgentState.State) => {
  graphFlowNode('running determinePlausabilityNext')
  if (state.plausabilityPass === false) {
    graphFlowDecision('going to END')
    return 'end'
  } else {
    graphFlowDecision('going to bugValidatorNode')
    return "bugValidatorNode"
  }
}

/**
 * Main function to create the workflow graph.
 */
const createBugReportAgentGraph = () => {
  const workflow = new StateGraph(AgentState)
    .addNode("bugEntryNode", bugEntryNode)
    .addNode("answerQuestionNode", answerQuestionNode)
    .addNode("bugValidatorNode", bugValidatorNode)
    .addNode('bugPlausibilityNode', bugPlausibilityNode)
    .addEdge(START, "bugEntryNode")
    .addConditionalEdges("bugEntryNode", determineNextNode, {
      bugPlausibilityNode: "bugPlausibilityNode",
      bugValidatorNode: "bugValidatorNode",
      answerQuestionNode: "answerQuestionNode",
    })
    .addConditionalEdges("bugPlausibilityNode", determinePlausabilityNext, {
      bugValidatorNode: "bugValidatorNode",
      end: END
    })
    .addEdge("answerQuestionNode", END)
    .addEdge("bugValidatorNode", END)

  // Compile the workflow to create the graph
  const graph = workflow.compile();

  // Generate Mermaid representation
  const mermaidDiagram = graph.getGraph().drawMermaid()

  // Save the Mermaid diagram to a file
  fs.writeFileSync('bugReportAgentGraph.mmd', mermaidDiagram);


  return graph;
};

export { createBugReportAgentGraph, AgentState };
