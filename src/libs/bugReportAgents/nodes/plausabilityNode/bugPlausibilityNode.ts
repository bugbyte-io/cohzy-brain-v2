import { BugValidationRequest } from "@libs/portkey";
import {
  BugOperationType,
  BugAgentRequestVariables,
} from "@libs/portkey/types";
import { HumanMessage } from "@langchain/core/messages";
import { PlausibilityResponse, PlausibilityResponseSchema, responseSchemaString } from "./types";
import { graphFlowDebugInfo } from "@libs/logging/flowLogger";

/**
 * Example Node function that returns a plausibility message.
 * @param state - The current state of the bug report.
 * @returns The updated state with a plausibility message.
 */
export const bugPlausibilityNode = async (
  state: any
): Promise<{ [key: string]: any }> => {
  try {
    const vars: BugAgentRequestVariables = {
      language_statement: "Your response should be in English.",
      message: state.messages[0]?.content ?? "",
      responseFormat: JSON.stringify(responseSchemaString)
    };

    const portkey = new BugValidationRequest(
      vars,
      BugOperationType.BUG_PLAUSIBILITY
    );

    const resp = await portkey.makeRequest();
    const parsedResp = JSON.parse(resp.choices[0].message.content)
    const plausibilityData = PlausibilityResponseSchema.parse(parsedResp);
    const { plausibilityScore, plausibilityMessage } = evaluatePlausibility(plausibilityData);
    graphFlowDebugInfo(`plausibilityScore:: ${plausibilityScore}`)

    return {
      ...state,
      plausabilityChecked: true,
      plausabilityPass: (plausibilityScore > 4),
      messages: [new HumanMessage(plausibilityMessage)],
    };
  } catch (error) {
    console.error("Error in bugPlausibilityNode:", error);
    throw new Error(
      "Failed to evaluate the bug plausibility. Please try again later."
    );
  }
};

/**
 * Evaluates the plausibility of the bug report.
 * @param plausibilityData - The data related to the plausibility evaluation.
 * @returns The plausibility score and the next task.
 */
const evaluatePlausibility = (plausibilityData: PlausibilityResponse) => {
  const scores = {
    lengthOfTextScore: plausibilityData.evaluation.lengthOfTextScore.score,
    structureAnalysisScore: plausibilityData.evaluation.structureAnalysisScore.score,
    environmentInfoScore: plausibilityData.evaluation.environmentInfoScore.score,
    keywordPresenceScore: plausibilityData.evaluation.keywordPresenceScore.score,
    reasoning: plausibilityData.evaluation.reasoning.score,
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const plausibilityScore = totalScore / Object.values(scores).length;

  const plausibilityMessage = plausibilityData.evaluation.nextAsk;

  return { plausibilityScore, plausibilityMessage };
};

