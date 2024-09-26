import { BugEntryRequest } from "@libs/portkey/bug-entry-request";
import {
  BugAgentRequestVariables,
  BugOperationType,
} from "@libs/portkey/types";

interface BugEntryResponse {
  askedQuestion: boolean;
}

/**
 * EntryNode is responsible for handling the initial processing of bug reports.
 * It acts as the entry point node in the bug report handling pipeline.
 */
export const bugEntryNode = async (
  state: any
): Promise<{ [key: string]: any }> => {
  try {
    const vars: BugAgentRequestVariables = {
      language_statement: "Your response should be in English.",
      message: state.messages[state.messages.length - 1]?.content ?? "",
    };

    const portkey = new BugEntryRequest(vars, BugOperationType.Entry);

    const resp = await portkey.makeRequest();

    const responseContent = resp.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent) as BugEntryResponse;

    const { askedQuestion } = parsedResponse;
    // Update the state with the new askedQuestion value
    return { ...state, askedQuestion };
  } catch (error) {
    console.error("Error in bugEntryNode:", error);
    throw new Error(
      "Failed to validate the bug report. Please try again later."
    );
  }
};
