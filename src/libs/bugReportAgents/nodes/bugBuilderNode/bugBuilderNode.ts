import { BugBuilderRequest } from "@libs/portkey";
import {
  BugAgentRequestVariables,
  BugOperationType,
} from "@libs/portkey/types";
import {
  bugBuilderResponse,
  BugBuilderResponseSchema,
  bugSchemaString,
} from "./types";
import { AIMessage } from "@langchain/core/messages";
import { StateManager } from "@libs/bugReportAgents/stateManager";

/**
 * EntryNode is responsible for handling the initial processing of bug reports.
 * It acts as the entry point node in the bug report handling pipeline.
 */
export const bugBiulderNode = async (
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
    const { evaluation } = parsedResponse;

    const stateManager = new StateManager();
    await stateManager.addMessage(
      state,
      "AiMessage",
      JSON.stringify({
        previous_bug_report: true,
        bugReport: parsedResponse.evaluation,
      })
    );

    return {
      messages: new AIMessage({
        // @ts-expect-error complaining about a string, but works fine.
        content: evaluation,
        additional_kwargs: { displayBug: true },
      }),
    };
  } catch (error) {
    console.error("Error in bugEntryNode:", error);
    throw new Error(
      "Failed to validate the bug report. Please try again later."
    );
  }
};
