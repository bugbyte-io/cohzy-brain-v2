import { observe } from "@langchain/core/dist/utils/fast-json-patch/index.js";
import { BugValidationRequest } from "../../../libs/portkey/index.js";
import {
  BugOperationType,
  BugValidationVariables,
} from "../../../libs/portkey/types.js";
import { BugValidationResponse } from "./bugValidationTypes.js";

/**
 * Example Node function that returns a static message.
 * @param state - The current state of the bug report.
 * @returns The updated state with a static message.
 */
export const bugValidatorNode = async (state: any): Promise<{ [key: string]: any }> => {
  console.log("state", state.messages);

  try {
    const vars: BugValidationVariables = {
      language_statement: "",
      observation: "",
    };

    const portkey = new BugValidationRequest(
      vars,
      BugOperationType.BUG_VALIDATION
    );

    const resp = await portkey.makeRequest();

    const validationData = JSON.parse(resp.choices[0].message.content) as BugValidationResponse;

    const { averageScore, lowestScoreKey } = calculateScore(validationData);
    console.log("Average Score:", averageScore, "Lowest Score Key:", lowestScoreKey);

    const returnString = getLowestScoreMsg(validationData, lowestScoreKey)

    return { ...state, averageScore, message: returnString };
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in bugValidatorNode:", error);
    // Throw a new exception with a meaningful message
    throw new Error("Failed to validate the bug report. Please try again later.");
  }
};

const getLowestScoreMsg = (validationData: BugValidationResponse, lowScoreKey: string) => {
  switch (lowScoreKey) {
    case "observation":
      return validationData.evaluation.observationClarification
      break;
      case "explanation":
        return validationData.evaluation.expectationClarification
      break;
      case "replication":
        return validationData.evaluation.replicationClarification
        break;
    default:
      return "Can you provide more information? I don't have a clear understanding yet."
      break;
  }

}


/**
 * Represents the result of the score calculation.
 */
interface ScoreCalculationResult {
  averageScore: number;
  lowestScoreKey: string;
}

/**
 * Calculate the average score from the bug validation data and determine the key of the lowest score.
 * @param validationData - The validation data object containing individual scores.
 * @returns An object containing the average score and the key of the lowest score.
 */
const calculateScore = (validationData: BugValidationResponse): ScoreCalculationResult => {
  
  const scores = {
    observation: validationData.evaluation.observation,
    explanation: validationData.evaluation.explanation,
    replication: validationData.evaluation.replication,
  };

  console.log('scores', scores)

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  console.log('totalScore', totalScore)
  const averageScore = totalScore / Object.values(scores).length;
  console.log('averageScore', averageScore)

  type ScoreKeys = keyof typeof scores;

  const lowestScoreKey = (Object.keys(scores) as ScoreKeys[]).reduce(
    (lowestKey, currentKey) =>
      scores[currentKey] < scores[lowestKey] ? currentKey : lowestKey
  );

  return { averageScore, lowestScoreKey };
};

