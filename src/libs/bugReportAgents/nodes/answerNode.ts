import { answerQuestionRequest } from "@libs/portkey/bugReporting/anwer-question";
import { BugAgentRequestVariables, BugOperationType } from "@libs/portkey/types";
import { HumanMessage, AIMessage } from '@langchain/core/messages';

interface AnswerQuestionResponse {
  message: string; 
}

/**
 * AnswerQuestion is responsible for handling a new part of the bug report process.
 * This is a stub and should be implemented with the actual logic.
 */
export const answerQuestionNode = async (state: any): Promise<{ [key: string]: any }> => {
  console.log("State in AnswerQuestion:", state);

  try {
    const vars: BugAgentRequestVariables = {
      language_statement: "Your response should be in English.",
      message: state.messages[state.messages.length - 1]?.content ?? "",
    };

    console.log("Variables to be sent:", vars);

    // This would be a new request type specific to the new node's functionality
    const portkey = new answerQuestionRequest(vars, BugOperationType.ANSWER_QUESTION);

    const resp = await portkey.makeRequest();
    const { message } = JSON.parse(resp.choices[0].message.content) as AnswerQuestionResponse;

    // Add the new message to the state as an assistant message
    const assistantMessage = new AIMessage(message);
    state.messages.push(assistantMessage);

    // Update the state with the new exampleField value
    return { ...state, message };
  } catch (error) {
    console.error("Error in AnswerQuestion:", error);
    throw new Error("Failed to process in AnswerQuestion. Please try again later.");
  }
};