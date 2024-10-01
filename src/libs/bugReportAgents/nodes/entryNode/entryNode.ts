import { BugEntryRequest } from "@libs/portkey";
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
      useLanguage: "English",
      messages: JSON.stringify(state.messages),
    };

    const portkey = new BugEntryRequest(vars, BugOperationType.Entry);
    const resp = await portkey.makeRequest();
    const responseContent = resp.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent) as BugEntryResponse;

    const { askedQuestion } = parsedResponse;
    return { askedQuestion };
    
  } catch (error) {
    console.error("Error in bugEntryNode:", error);
    throw new Error(
      "Failed to validate the bug report. Please try again later."
    );
  }
};
