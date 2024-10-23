import { answerQuestionRequest } from "@libs/portkey/bugReporting/anwer-question";
import { BugAgentRequestVariables, BugOperationType } from "@libs/portkey/types";
import { StateManager } from "@libs/bugReportAgents/stateManager";

interface AnswerQuestionResponse {
  message: string; 
}

/**
 * AnswerQuestion is responsible for handling a new part of the bug report process.
 * This is a stub and should be implemented with the actual logic.
 */
export const answerQuestionNode = async (state: any) => {

  try {
    const vars: BugAgentRequestVariables = {
      useLanguage: "Your response should be in English.",
      messages: state.messages[state.messages.length - 1]?.content ?? "",
    };


    // This would be a new request type specific to the new node's functionality
    const portkey = new answerQuestionRequest(vars, BugOperationType.ANSWER_QUESTION);

    const resp = await portkey.makeRequest(state.traceId, 'Answer Question', state.userId);
    const { message } = JSON.parse(resp.choices[0].message.content) as AnswerQuestionResponse;

    const stateManager = new StateManager()
    await stateManager.addMessage(
      state,
      "AiMessage",
      message,
      true,
      false
    );

    return {
      bugBuildCompleted: false
    }

  } catch (error) {
    console.error("Error in AnswerQuestion:", error);
    throw new Error("Failed to process in AnswerQuestion. Please try again later.");
  }
};