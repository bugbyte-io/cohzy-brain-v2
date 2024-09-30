import { BugValidationRequest } from "@libs/portkey";
import {
  BugOperationType,
  BugAgentRequestVariables,
} from "@libs/portkey/types";
import { HumanMessage } from "@langchain/core/messages";
import {
  PlausibilityResponse,
  PlausibilityResponseSchema,
  responseSchemaString,
} from "./types";
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
      useLanguage: "English",
      message: state.messages[0]?.content ?? "",
      responseFormat: JSON.stringify(responseSchemaString),
    };

    const portkey = new BugValidationRequest(
      vars,
      BugOperationType.BUG_PLAUSIBILITY
    );

    const resp = await portkey.makeRequest();
    const parsedResp = JSON.parse(resp.choices[0].message.content);
    const plausibilityData = PlausibilityResponseSchema.parse(parsedResp);
    const { plausibilityScore, plausibilityMessage } =
      evaluatePlausibility(plausibilityData);
    graphFlowDebugInfo(`plausibilityScore:: ${plausibilityScore}`);

    return {
      ...state,
      plausabilityChecked: true,
      plausabilityPass: plausibilityScore > 40, // Now checking > 40% instead of > 4
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
 * Defines the bias factors for different plausibility evaluation criteria.
 * Using a Map for easy key-value management.
 */
const scoringBias = new Map<string, number>([
  ["lengthOfText", 0.6],
  ["structureAnalysis", 0.6],
  ["environmentInfo", 0.2],
  ["keywordPresence", 0.8],
  ["reasoning", 0.8],
  ["clarity", 0.9],
  ["specificity", 0.9],
  ["reproducibility", 0.6],
  ["relevance", 0.9],
]);

/**
 * Evaluates the plausibility of the bug report.
 * @param plausibilityData - The data related to the plausibility evaluation.
 * @returns The plausibility score and the next task.
 */
const evaluatePlausibility = (plausibilityData: PlausibilityResponse) => {
  const scores = new Map<string, number>();
  Object.entries(plausibilityData.evaluation).forEach(([key, value]) => {
    if (value && typeof value !== "string" && value.score !== undefined) {
      scores.set(key, value.score);
    }
  });

  // Normalize
  const totalScore = Array.from(scores.entries()).reduce(
    (sum, [key, score]) => {
      const biasFactor = scoringBias.get(key) || 1;
      // Assuming the score is out of 10 for scaling purposes (use actual max value if different)
      const normalizedScore = score / 10;
      return sum + normalizedScore * biasFactor;
    },
    0
  );

  const totalBiasFactor = Array.from(scores.keys()).reduce((sum, key) => {
    return sum + (scoringBias.get(key) || 1);
  }, 0);

  // Convert the plausibility score to a percentage out of 100
  const plausibilityScore = (totalScore / totalBiasFactor) * 100;

  const plausibilityMessage = plausibilityData.evaluation.nextAsk;

  return { plausibilityScore, plausibilityMessage };
};
