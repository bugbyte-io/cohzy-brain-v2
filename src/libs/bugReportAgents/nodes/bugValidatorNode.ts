import { BugValidationRequest } from "../../../libs/portkey/index";
import {
  BugOperationType,
  BugAgentRequestVariables,
} from "@libs/portkey/types";
import { BugValidationResponse } from "./bugValidationTypes";
import { HumanMessage } from '@langchain/core/messages';

/**
 * Example Node function that returns a static message.
 * @param state - The current state of the bug report.
 * @returns The updated state with a static message.
 */
export const bugValidatorNode = async (state: any): Promise<{ [key: string]: any }> => {
  console.log("State in bugValidatorNode:", state);

  try {
    const vars: BugAgentRequestVariables = {
      language_statement: "Your response should be in English.",
      message: state.messages[0]?.content ?? "",
    };

    const portkey = new BugValidationRequest(
      vars,
      BugOperationType.BUG_VALIDATION
    );

    const resp = await portkey.makeRequest();

    const validationData = JSON.parse(resp.choices[0].message.content) as BugValidationResponse;

    const { averageScore, lowestScoreKey } = calculateScore(validationData);
    console.log("Average Score:", averageScore, "Lowest Score Key:", lowestScoreKey);

    const returnString = getLowestScoreMsg(validationData, lowestScoreKey);

    return { ...state, averageScore, messages: [new HumanMessage(returnString)] };
  } catch (error) {
    console.error("Error in bugValidatorNode:", error);
    throw new Error("Failed to validate the bug report. Please try again later.");
  }
};

const getLowestScoreMsg = (validationData: BugValidationResponse, lowScoreKey: string) => {
  switch (lowScoreKey) {
    case "observation":
      return validationData.evaluation.observationClarification;
    case "explanation":
      return validationData.evaluation.expectationClarification;
    case "replication":
      return validationData.evaluation.replicationClarification;
    default:
      return "Can you provide more information? I don't have a clear understanding yet.";
  }
};

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

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.values(scores).length;

  type ScoreKeys = keyof typeof scores;

  const lowestScoreKey = (Object.keys(scores) as ScoreKeys[]).reduce(
    (lowestKey, currentKey) =>
      scores[currentKey] < scores[lowestKey] ? currentKey : lowestKey
  );

  return { averageScore, lowestScoreKey };
};

