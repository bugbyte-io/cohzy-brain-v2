/**
 * Specific types for each promptId.
 */
export type BugAgentRequestVariables = {
  messages: string;
  useLanguage?: string
  responseFormat?: string;
};

/**
 * Enum for different types of bug-related operations.
 */
export enum BugOperationType {
  BUG_VALIDATION = "BUG_VALIDATION",
  BUG_PLAUSIBILITY = "BUG_PLAUSIBILITY",
  BUG_BUILDER = "BUG_BUILDER",
  Entry = "Entry",
  ANSWER_QUESTION = "ANSWER_QUESTION",
}

