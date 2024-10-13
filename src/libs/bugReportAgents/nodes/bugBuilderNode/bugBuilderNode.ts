import { BugBuilderRequest } from "@libs/portkey";
import {
  BugAgentRequestVariables,
  BugOperationType,
} from "@libs/portkey/types";
import {
  bugBuilderResponse,
  bugSchemaString
} from "./types";

import { StateManager } from "@libs/bugReportAgents/stateManager";

/**
 * BugBuilderNode is responsible for building the final bug report.
 * It processes the validated information and creates a structured bug report.
 */
export const bugBuilderNode = async (
  state: any
): Promise<{ [key: string]: any }> => {
  try {
    const vars: BugAgentRequestVariables = {
      useLanguage: "English",
      messages: JSON.stringify(state.messages),
      responseFormat: JSON.stringify(bugSchemaString),
    };

    const portkey = new BugBuilderRequest(vars, BugOperationType.BUG_BUILDER);
    const resp = await portkey.makeRequest(
      state.traceId,
      "Bug Builder Node",
      state.userId
    );

    const responseContent = resp.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent) as bugBuilderResponse;

    const stateManager = new StateManager();
    await stateManager.addMessage(
      state,
      "AiMessage",
      JSON.stringify({
        previous_bug_report: true,
        bugReport: parsedResponse.evaluation,
      }),
      true,
      true
    );

    // Update the state to indicate that bug building is completed
    return {
      bugBuildCompleted: true,
      messages: state.messages,
    };
  } catch (error) {
    console.error("Error in bugBuilderNode:", error);
    throw new Error(
      "Failed to build the bug report. Please try again later."
    );
  }
};
