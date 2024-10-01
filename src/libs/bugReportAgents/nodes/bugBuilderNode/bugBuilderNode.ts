import { BugBuilderRequest } from "@libs/portkey";
import {
  BugAgentRequestVariables,
  BugOperationType,
} from "@libs/portkey/types";
import { bugBuilderResponse, BugBuilderResponseSchema, bugSchemaString } from "./types";
import { AIMessage } from "@langchain/core/messages";

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
    const resp = await portkey.makeRequest();

    const responseContent = resp.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent) as bugBuilderResponse;
    const { evaluation } = parsedResponse;

    return {
      messages: new AIMessage({
        // @ts-expect-error complaining about a string, but works fine.
        content: evaluation,
        additional_kwargs: { displayBug: true},
      }),
    };
  } catch (error) {
    console.error("Error in bugEntryNode:", error);
    throw new Error(
      "Failed to validate the bug report. Please try again later."
    );
  }
};
