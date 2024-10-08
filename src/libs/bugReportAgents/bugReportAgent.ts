import { Annotation, BinaryOperatorAggregate } from "@langchain/langgraph";
import type { AnnotationRoot } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import { bugValidatorNode } from "./nodes/validation";
import { bugEntryNode } from "./nodes/entryNode/entryNode";
import { answerQuestionNode } from "../genericAgent/answerNode";
import { bugPlausibilityNode } from "./nodes/plausabilityNode";
import * as fs from "fs";
import { graphFlowNode, graphFlowDecision } from "@libs/logging/flowLogger";
import { bugBiulderNode } from "./nodes/bugBuilderNode";

class BugReportAgentGraph {
  private AgentState: any;
  private compiledGraph: any;
  constructor() {
    this.createAgentState();
    this.createBugReportAgentGraph();
  }

  private createAgentState = () => {
    const AgentState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
      userInfo: Annotation<string | undefined>({
        reducer: (x, y) => y || x || "N/A",
        default: () => "N/A",
      }),
      askedQuestion: Annotation<boolean>({
        reducer: (x, y) => (y !== undefined ? y : x !== undefined ? x : false),
        default: () => false,
      }),
      plausabilityPass: Annotation<boolean>({
        reducer: (x, y) => (y !== undefined ? y : x !== undefined ? x : false),
        default: () => false,
      }),
      plausabilityChecked: Annotation<boolean>({
        reducer: (x, y) => (y !== undefined ? y : x !== undefined ? x : false),
        default: () => false,
      }),
      validationPass: Annotation<boolean>({
        reducer: (x, y) => (y !== undefined ? y : x !== undefined ? x : false),
        default: () => false,
      }),
      traceId: Annotation<string | undefined>({
        reducer: (x, y) => y || x || "",
        default: () => "",
      }),
    });
    this.AgentState = AgentState;
  };

  private determineNextNode = (state: typeof this.AgentState.State) => {
    graphFlowNode("running determineNextNode");

    if (state.askedQuestion) {
      graphFlowDecision("going to answerQuestionNode");
      return "answerQuestionNode";
    } else {
      graphFlowDecision("going to bugPlausibilityNode");
      return "bugPlausibilityNode";
    }
  };

  private determinePlausabilityNext = (state: typeof this.AgentState.State) => {
    graphFlowNode("running determinePlausabilityNext");
    if (state.plausabilityPass === false) {
      graphFlowDecision("going to END");
      return "end";
    } else {
      graphFlowDecision("going to bugValidatorNode");
      return "bugValidatorNode";
    }
  };

  private determineValidationNext = (state: typeof this.AgentState.State) => {
    graphFlowNode("running determineValidationNext");
    
    if (state.validationPass === false) {
      graphFlowDecision("going to END");
      return "end";
    } else {
      graphFlowDecision("going to bugBuilderNode");
      return "bugBuilderNode";
    }
  };

  public createBugReportAgentGraph = () => {
    const workflow = new StateGraph(this.AgentState)
      .addNode("bugEntryNode", bugEntryNode)
      .addNode("answerQuestionNode", answerQuestionNode)
      .addNode("bugValidatorNode", bugValidatorNode)
      .addNode("bugPlausibilityNode", bugPlausibilityNode)
      .addNode("bugBuilderNode", bugBiulderNode)
      .addEdge(START, "bugEntryNode")
      .addConditionalEdges("bugEntryNode", this.determineNextNode, {
        bugPlausibilityNode: "bugPlausibilityNode",
        bugValidatorNode: "bugValidatorNode",
        answerQuestionNode: "answerQuestionNode",
      })
      .addConditionalEdges(
        "bugPlausibilityNode",
        this.determinePlausabilityNext,
        {
          bugValidatorNode: "bugValidatorNode",
          end: END,
        }
      )
      .addConditionalEdges("bugValidatorNode", this.determineValidationNext, {
        bugBuilderNode: "bugBuilderNode",
        end: END,
      })
      .addEdge("answerQuestionNode", END)
      .addEdge("bugValidatorNode", END)
      .addEdge("bugBuilderNode", END);

    // Compile the workflow to create the graph
    const graph = workflow.compile();
    this.compiledGraph = graph;

    return graph;
  };

  public createChart = () => {
    // Generate Mermaid representation
    const mermaidDiagram = this.compiledGraph.getGraph().drawMermaid();

    // Save the Mermaid diagram to a file
    fs.writeFileSync("bugReportAgentGraph.mmd", mermaidDiagram);
  };
}

export default BugReportAgentGraph;
